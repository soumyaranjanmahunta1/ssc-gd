// API Base URL
// Android Emulator  → http://10.0.2.2:5000/api
// Physical device   → http://192.168.0.153:5000/api  (your current machine IP)
// Production        → https://your-api.onrender.com/api
export const API_BASE_URL = 'http://10.0.2.2:5000/api';

export const SUBJECTS = ['GK', 'Math', 'Reasoning', 'English'];

export const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'];

export const SUBJECT_ICONS = {
    GK: '🌍',
    Math: '🔢',
    Reasoning: '🧠',
    English: '📖',
};

export const SUBJECT_COLORS = {
    GK: ['#667eea', '#764ba2'],
    Math: ['#f093fb', '#f5576c'],
    Reasoning: ['#4facfe', '#00f2fe'],
    English: ['#43e97b', '#38f9d7'],
};

export const MOCK_TEST_CONFIG = {
    totalQuestions: 80,
    timeInMinutes: 60,
};

export const FIRESTORE_COLLECTIONS = {
    USERS: 'users',
    RESULTS: 'results',
    BOOKMARKS: 'bookmarks',
};
