import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { FIRESTORE_COLLECTIONS } from '../utils/constants';

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email, password) => {
    const credential = await auth().signInWithEmailAndPassword(email, password);
    return credential.user;
};

/**
 * Create new account with email and password
 */
export const signUpWithEmail = async (email, password, name) => {
    try {
        console.log('--- Auth: Creating user in Firebase Auth ---');
        const credential = await auth().createUserWithEmailAndPassword(email, password);
        const user = credential.user;
        
        console.log('--- Auth: Updating display name ---');
        await user.updateProfile({ displayName: name });
        
        console.log('--- Firestore: Saving user profile ---');
        try {
            await firestore()
                .collection(FIRESTORE_COLLECTIONS.USERS)
                .doc(user.uid)
                .set({
                    uid: user.uid,
                    name,
                    email,
                    createdAt: firestore.FieldValue.serverTimestamp(),
                });
            console.log('--- Signup Successful ---');
            return user;
        } catch (firestoreError) {
            console.error('--- Firestore Error ---', firestoreError);
            // Cleanup: delete user from Auth if profile creation fails
            // This prevents "email already in use" on retry
            await user.delete();
            throw firestoreError;
        }
    } catch (authError) {
        console.error('--- Signup Process Error ---', authError);
        throw authError; // Rethrow to be caught by UI
    }
};

/**
 * Sign out current user
 */
export const signOut = async () => {
    await auth().signOut();
};

/**
 * Get current user profile from Firestore
 */
export const getUserProfile = async (uid) => {
    const doc = await firestore()
        .collection(FIRESTORE_COLLECTIONS.USERS)
        .doc(uid)
        .get();
    return doc.exists ? doc.data() : null;
};

/**
 * Parse Firebase auth error codes into user-friendly messages
 */
export const getAuthErrorMessage = (error) => {
    // If it is just a string (not common with Firebase errors)
    if (typeof error === 'string') return error;

    const code = error?.code;
    const messages = {
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/network-request-failed': 'Network error. Check your internet connection.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/invalid-credential': 'Invalid credentials. Please try again.',
        'firestore/permission-denied': 'Firestore Permission Denied. Please check your security rules.',
    };
    
    // Return custom message or raw Firebase message, fallback to generic
    return messages[code] || error?.message || 'Something went wrong. Please try again.';
};
