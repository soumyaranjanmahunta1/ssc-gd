import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,           // { uid, name, email }
    isAuthenticated: false,
    isLoading: true,      // true while checking auth state on app launch
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser(state, action) {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
            state.isLoading = false;
            state.error = null;
        },
        setLoading(state, action) {
            state.isLoading = action.payload;
        },
        setError(state, action) {
            state.error = action.payload;
            state.isLoading = false;
        },
        clearError(state) {
            state.error = null;
        },
        logout(state) {
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = null;
        },
    },
});

export const { setUser, setLoading, setError, clearError, logout } = authSlice.actions;
export default authSlice.reducer;
