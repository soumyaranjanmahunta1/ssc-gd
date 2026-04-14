import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    questions: [],
    currentIndex: 0,
    answers: {},          // { questionId: selectedOption }
    markedForReview: [],  // array of questionIds
    subject: null,        // null means mixed/all
    startTime: null,
    endTime: null,
    isSubmitted: false,
    isLoading: false,
    error: null,
    result: null,         // populated after submission
};

const testSlice = createSlice({
    name: 'test',
    initialState,
    reducers: {
        setQuestions(state, action) {
            state.questions = action.payload;
            state.currentIndex = 0;
            state.answers = {};
            state.markedForReview = [];
            state.isSubmitted = false;
            state.startTime = Date.now();
            state.endTime = null;
            state.result = null;
            state.error = null;
            state.isLoading = false;
        },
        setSubject(state, action) {
            state.subject = action.payload;
        },
        setCurrentIndex(state, action) {
            state.currentIndex = action.payload;
        },
        goToNext(state) {
            if (state.currentIndex < state.questions.length - 1) {
                state.currentIndex += 1;
            }
        },
        goToPrev(state) {
            if (state.currentIndex > 0) {
                state.currentIndex -= 1;
            }
        },
        selectAnswer(state, action) {
            const { questionId, selectedOption } = action.payload;
            state.answers[questionId] = selectedOption;
        },
        toggleMarkForReview(state, action) {
            const qId = action.payload;
            const idx = state.markedForReview.indexOf(qId);
            if (idx > -1) {
                state.markedForReview.splice(idx, 1);
            } else {
                state.markedForReview.push(qId);
            }
        },
        submitTest(state) {
            state.isSubmitted = true;
            state.endTime = Date.now();
            // Calculate result
            let correct = 0;
            let wrong = 0;
            let skipped = 0;
            state.questions.forEach(q => {
                const chosen = state.answers[q._id];
                if (!chosen) {
                    skipped += 1;
                } else if (chosen === q.answer) {
                    correct += 1;
                } else {
                    wrong += 1;
                }
            });
            const timeTakenSeconds = Math.round((state.endTime - state.startTime) / 1000);
            const rawScore = (correct * 2) - (wrong * 0.25);
            state.result = {
                correct,
                wrong,
                skipped,
                total: state.questions.length,
                totalPossibleMarks: state.questions.length * 2,
                score: parseFloat(rawScore.toFixed(2)),
                timeTakenSeconds,
                accuracy: Math.round((correct / state.questions.length) * 100),
            };
        },
        setLoading(state, action) {
            state.isLoading = action.payload;
        },
        setError(state, action) {
            state.error = action.payload;
            state.isLoading = false;
        },
        resetTest(state) {
            return initialState;
        },
    },
});

export const {
    setQuestions,
    setSubject,
    setCurrentIndex,
    goToNext,
    goToPrev,
    selectAnswer,
    toggleMarkForReview,
    submitTest,
    setLoading,
    setError,
    resetTest,
} = testSlice.actions;
export default testSlice.reducer;
