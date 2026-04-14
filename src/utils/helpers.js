/**
 * General utility helpers
 */

/**
 * Format seconds into MM:SS string
 */
export const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

/**
 * Calculate accuracy percentage
 */
export const calcAccuracy = (correct, total) => {
    if (!total) return 0;
    return Math.round((correct / total) * 100);
};

/**
 * Get a label for score
 */
export const getScoreLabel = (accuracy) => {
    if (accuracy >= 90) return '🏆 Excellent!';
    if (accuracy >= 75) return '🎉 Very Good!';
    if (accuracy >= 60) return '👍 Good';
    if (accuracy >= 40) return '📚 Keep Practising';
    return '💪 Need Improvement';
};

/**
 * Format a Firestore timestamp to readable date string
 */
export const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

/**
 * Shuffle an array (Fisher-Yates)
 */
export const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

/**
 * Validate email
 */
export const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
