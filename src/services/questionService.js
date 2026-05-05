import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/constants';

const CACHE_KEY = 'cached_questions';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

// Axios instance — 30s timeout to handle Render free-tier cold starts (~15-50s wake-up)
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
});

/**
 * Pings the backend health endpoint to wake up the Render server.
 * Call this on app launch so the server is warm when the user starts a test.
 */
export const wakeUpServer = () => {
    axios.get(`${API_BASE_URL}/health`, { timeout: 60000 }).catch(() => {});
};

// Request interceptor (can add auth token later)
api.interceptors.request.use(
    config => config,
    error => Promise.reject(error)
);

// Response interceptor for error normalisation
api.interceptors.response.use(
    response => response.data,
    error => {
        const message =
            error.response?.data?.message ||
            error.message ||
            'Network error. Please check your connection.';
        return Promise.reject(new Error(message));
    }
);

/**
 * Fetch questions from API with AsyncStorage caching.
 * Falls back to cache if API is unreachable.
 */
export const fetchQuestions = async ({ subject = '', limit = 25, page = 1, difficulty = '' } = {}) => {
    const params = { limit, page };
    if (subject) params.subject = subject;
    if (difficulty) params.difficulty = difficulty;

    // Build cache key from params
    const cacheKey = `${CACHE_KEY}_${subject}_${page}_${limit}`;

    try {
        const response = await api.get('/questions', { params });
        const questions = response.data;

        // Cache the result
        await AsyncStorage.setItem(
            cacheKey,
            JSON.stringify({ data: questions, pagination: response.pagination, timestamp: Date.now() })
        );

        return { questions, pagination: response.pagination };
    } catch (error) {
        // Try cache fallback
        try {
            const cached = await AsyncStorage.getItem(cacheKey);
            if (cached) {
                const parsed = JSON.parse(cached);
                // Check if cache is within TTL
                if (Date.now() - parsed.timestamp < CACHE_TTL) {
                    console.log('📦 Serving from cache:', cacheKey);
                    return { questions: parsed.data, pagination: parsed.pagination, fromCache: true };
                }
            }
        } catch (_) { }
        throw error;
    }
};

/**
 * Fetches a perfectly balanced 80-question mock test (20 per subject)
 * Directly from the specialized backend endpoint.
 */
export const fetchBalancedMockTest = async () => {
    try {
        const response = await api.get('/questions/mock-test');
        // response is already unwrapped by the interceptor to be the JSON object
        return { questions: response.data };
    } catch (error) {
        console.error('fetchBalancedMockTest error:', error);
        throw error;
    }
};

/**
 * Submit test result (server acknowledges, primary storage is Firestore)
 */
export const submitTestResult = async (resultData) => {
    try {
        return await api.post('/questions/submit-test', resultData);
    } catch (error) {
        // Non-critical — results are always saved to Firestore
        console.warn('Submit test API error (non-critical):', error.message);
        return null;
    }
};
