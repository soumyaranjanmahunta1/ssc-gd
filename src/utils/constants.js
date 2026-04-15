// Set this to true when you deploy your backend to Render
const IS_PRODUCTION = true;

const DEV_URL = 'http://10.0.2.2:5000/api';
const PROD_URL = 'https://sscgd-mock-api.onrender.com/api'; // Replace with your actual Render URL later

export const API_BASE_URL = IS_PRODUCTION ? PROD_URL : DEV_URL;

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
