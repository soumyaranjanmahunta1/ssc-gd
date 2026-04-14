import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    bookmarks: [],   // array of question objects
};

const bookmarkSlice = createSlice({
    name: 'bookmarks',
    initialState,
    reducers: {
        setBookmarks(state, action) {
            state.bookmarks = action.payload;
        },
        addBookmark(state, action) {
            const exists = state.bookmarks.find(b => b._id === action.payload._id);
            if (!exists) {
                state.bookmarks.push(action.payload);
            }
        },
        removeBookmark(state, action) {
            state.bookmarks = state.bookmarks.filter(b => b._id !== action.payload);
        },
    },
});

export const { setBookmarks, addBookmark, removeBookmark } = bookmarkSlice.actions;
export default bookmarkSlice.reducer;
