import firestore from '@react-native-firebase/firestore';
import { FIRESTORE_COLLECTIONS } from '../utils/constants';

/**
 * Save test result to Firestore
 */
export const saveTestResult = async (uid, resultData) => {
    await firestore()
        .collection(FIRESTORE_COLLECTIONS.RESULTS)
        .add({
            uid,
            ...resultData,
            createdAt: firestore.FieldValue.serverTimestamp(),
        });
};

/**
 * Fetch all test results for a user
 */
export const getUserResults = async (uid) => {
    const snapshot = await firestore()
        .collection(FIRESTORE_COLLECTIONS.RESULTS)
        .where('uid', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Get aggregate stats for a user (last score, total tests, accuracy)
 */
export const getUserStats = async (uid) => {
    const results = await getUserResults(uid);
    if (!results.length) {
        return { lastScore: 0, totalTests: 0, accuracy: 0 };
    }
    const totalCorrect = results.reduce((sum, r) => sum + (r.correct || 0), 0);
    const totalQuestions = results.reduce((sum, r) => sum + (r.total || 0), 0);
    return {
        lastScore: results[0]?.score || 0,
        lastTotal: results[0]?.totalMarks || 0,
        totalTests: results.length,
        accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
    };
};

/**
 * Save bookmarks to Firestore
 */
export const saveBookmarks = async (uid, bookmarks) => {
    await firestore()
        .collection(FIRESTORE_COLLECTIONS.BOOKMARKS)
        .doc(uid)
        .set({ 
            questions: bookmarks, 
            updatedAt: firestore.FieldValue.serverTimestamp() 
        });
};

/**
 * Get bookmarks for a user
 */
export const getBookmarks = async (uid) => {
    const doc = await firestore()
        .collection(FIRESTORE_COLLECTIONS.BOOKMARKS)
        .doc(uid)
        .get();
    return doc.exists ? doc.data().questions || [] : [];
};
