import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import testReducer from './slices/testSlice';
import bookmarkReducer from './slices/bookmarkSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        test: testReducer,
        bookmarks: bookmarkReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Firestore Timestamps are not serializable; ignore them in state
                ignoredPaths: ['auth.user'],
            },
        }),
});

export default store;
