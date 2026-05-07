import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Alert,
    ActivityIndicator,
    Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import {
    setQuestions,
    setSubject,
    goToNext,
    goToPrev,
    selectAnswer,
    submitTest,
    setLoading,
    setError,
    resetTest,
} from '../redux/slices/testSlice';
import { addBookmark, removeBookmark } from '../redux/slices/bookmarkSlice';
import { fetchQuestions, fetchMockTestByNumber } from '../services/questionService';
import { saveBookmarks } from '../services/firestoreService';
import { formatTime } from '../utils/helpers';
import { MOCK_TEST_CONFIG } from '../utils/constants';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/theme';

export default function TestScreen({ navigation, route }) {
    const dispatch = useDispatch();
    const {
        questions,
        currentIndex,
        answers,
        isSubmitted,
        isLoading,
        error,
    } = useSelector(state => state.test);
    const { user } = useSelector(state => state.auth);
    const { bookmarks } = useSelector(state => state.bookmarks);

    const { subject = null, mockTestNumber = null } = route.params || {};
    const [timeLeft, setTimeLeft] = useState(MOCK_TEST_CONFIG.timeInMinutes * 60);
    const timerRef = useRef(null);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    // Load questions
    useEffect(() => {
        const load = async () => {
            dispatch(setLoading(true));
            try {
                let qs;
                if (mockTestNumber) {
                    // Numbered Mock Test from list screen
                    const res = await fetchMockTestByNumber(mockTestNumber);
                    qs = res.questions;
                    setTimeLeft(60 * 60); // 60 minutes
                } else if (!subject) {
                    // Fallback: shouldn't reach here anymore
                    const res = await fetchMockTestByNumber(1);
                    qs = res.questions;
                    setTimeLeft(60 * 60);
                } else {
                    // Subject-specific Test: 25 questions
                    const res = await fetchQuestions({
                        subject,
                        limit: 25,
                    });
                    qs = res.questions;
                    setTimeLeft(20 * 60); // 20 minutes for 25 questions
                }
                dispatch(setSubject(mockTestNumber ? `Mock Test ${mockTestNumber}` : subject || 'Mock Test'));
                dispatch(setQuestions(qs));
            } catch (e) {
                dispatch(setError(e.message));
            }
        };
        load();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Start timer when questions load
    useEffect(() => {
        if (questions.length > 0 && !isSubmitted) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        handleSubmit(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [questions.length]);

    // Navigate to result when submitted
    useEffect(() => {
        if (isSubmitted) {
            if (timerRef.current) clearInterval(timerRef.current);
            navigation.replace('Result');
        }
    }, [isSubmitted]);

    const animateTransition = (cb) => {
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
        cb();
    };

    const handleSubmit = (timeUp = false) => {
        if (timeUp) {
            dispatch(submitTest());
            return;
        }
        const answered = Object.keys(answers).length;
        const unanswered = questions.length - answered;
        Alert.alert(
            'Submit Test?',
            unanswered > 0
                ? `You have ${unanswered} unanswered question(s). Still submit?`
                : 'Ready to submit your test?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Submit',
                    style: 'destructive',
                    onPress: () => dispatch(submitTest()),
                },
            ]
        );
    };
    
    const handleBookmarkToggle = async () => {
        if (!questions[currentIndex] || !user?.uid) return;
        const q = questions[currentIndex];
        const isBookmarked = bookmarks.some(b => b._id === q._id);

        let updatedBookmarks;
        if (isBookmarked) {
            dispatch(removeBookmark(q._id));
            updatedBookmarks = bookmarks.filter(b => b._id !== q._id);
        } else {
            dispatch(addBookmark(q));
            updatedBookmarks = [...bookmarks, q];
        }

        try {
            await saveBookmarks(user.uid, updatedBookmarks);
        } catch (err) {
            console.error('Error saving bookmark:', err);
        }
    };

    const handleExit = () => {
        Alert.alert(
            'Exit Test?',
            'Are you sure you want to leave the exam? Your current progress will be lost.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Exit',
                    style: 'destructive',
                    onPress: () => {
                        dispatch(resetTest());
                        navigation.navigate('MainTabs');
                    },
                },
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading questions...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorTitle}>⚠️ Failed to load questions</Text>
                <Text style={styles.errorMsg}>{error}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={() => { dispatch(resetTest()); navigation.goBack(); }}>
                    <Text style={styles.retryText}>← Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!questions.length) return null;

    const q = questions[currentIndex];
    const selectedAnswer = answers[q._id];
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const isLow = timeLeft < 300;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryStart} />

            {/* Timer Bar */}
            <LinearGradient colors={[COLORS.primaryStart, COLORS.primaryEnd]} style={styles.timerHeader}>
                <TouchableOpacity onPress={handleExit} style={styles.exitBtn}>
                    <Icon name="exit-to-app" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.questionCount}>{currentIndex + 1} / {questions.length}</Text>
                    {subject && <Text style={styles.subjectBadge}>{subject}</Text>}
                </View>
                <View style={[styles.timerPill, isLow && styles.timerPillDanger]}>
                    <Text style={styles.timerText}>⏱️ {formatTime(timeLeft)}</Text>
                </View>
                <TouchableOpacity onPress={handleBookmarkToggle} style={styles.bookmarkBtn}>
                    <Text style={[styles.bookmarkEmoji, { opacity: bookmarks.some(b => b._id === q?._id) ? 1 : 0.4 }]}>
                        {bookmarks.some(b => b._id === q?._id) ? '🔖' : '📑'}
                    </Text>
                </TouchableOpacity>
            </LinearGradient>

            {/* Progress bar */}
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>

            {/* Question */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <View style={styles.questionCard}>
                        <Text style={styles.questionText}>{q.question}</Text>
                    </View>

                    {/* Options */}
                    {q.options.map((option, idx) => {
                        const isSelected = selectedAnswer === option;
                        return (
                            <TouchableOpacity
                                key={idx}
                                style={[styles.option, isSelected && styles.optionSelected]}
                                onPress={() => dispatch(selectAnswer({ questionId: q._id, selectedOption: option }))}
                                activeOpacity={0.75}>
                                <View style={[styles.optionBadge, isSelected && styles.optionBadgeSelected]}>
                                    <Text style={[styles.optionBadgeText, isSelected && styles.optionBadgeTextSelected]}>
                                        {['A', 'B', 'C', 'D'][idx]}
                                    </Text>
                                </View>
                                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </Animated.View>
            </ScrollView>

            {/* Navigation */}
            <View style={styles.navRow}>
                <TouchableOpacity
                    style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
                    disabled={currentIndex === 0}
                    onPress={() => animateTransition(() => dispatch(goToPrev()))}>
                    <Text style={styles.navBtnText}>← Prev</Text>
                </TouchableOpacity>

                {currentIndex === questions.length - 1 ? (
                    <TouchableOpacity style={styles.submitBtn} onPress={() => handleSubmit(false)}>
                        <LinearGradient
                            colors={[COLORS.correct, '#00b36b']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.submitBtnGradient}>
                            <Text style={styles.submitBtnText}>Submit ✓</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.navBtnPrimary}
                        onPress={() => animateTransition(() => dispatch(goToNext()))}>
                        <LinearGradient
                            colors={[COLORS.primaryStart, COLORS.primaryEnd]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.navBtnGradient}>
                            <Text style={styles.navBtnPrimaryText}>Next →</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
    loadingText: { ...FONTS.body1, color: COLORS.textSecondary, marginTop: SPACING.md },
    errorTitle: { ...FONTS.h3, color: COLORS.incorrect, textAlign: 'center' },
    errorMsg: { ...FONTS.body2, color: COLORS.textSecondary, marginTop: 8, textAlign: 'center' },
    retryBtn: { marginTop: SPACING.lg, padding: SPACING.md },
    retryText: { ...FONTS.button, color: COLORS.primary },
    timerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 48,
        paddingBottom: SPACING.md,
        paddingHorizontal: SPACING.lg,
    },
    exitBtn: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.full,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    headerInfo: { flex: 1 },
    questionCount: { ...FONTS.h4, color: COLORS.white },
    subjectBadge: {
        ...FONTS.caption,
        color: 'rgba(255,255,255,0.75)',
        marginTop: 2,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    timerPill: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: RADIUS.full,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
    },
    timerPillDanger: { backgroundColor: COLORS.incorrect },
    timerText: { ...FONTS.h4, color: COLORS.white },
    progressBar: { height: 4, backgroundColor: 'rgba(102,126,234,0.2)' },
    progressFill: { height: 4, backgroundColor: COLORS.primary },
    scroll: { flex: 1 },
    scrollContent: { padding: SPACING.md, paddingBottom: SPACING.xl },
    questionCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        ...SHADOW.sm,
    },
    questionText: { ...FONTS.body1, color: COLORS.textPrimary, lineHeight: 26, fontSize: 16 },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        borderWidth: 2,
        borderColor: COLORS.border,
        ...SHADOW.sm,
        gap: SPACING.sm,
    },
    optionSelected: { borderColor: COLORS.primary, backgroundColor: '#F0F2FF' },
    optionBadge: {
        width: 32,
        height: 32,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionBadgeSelected: { backgroundColor: COLORS.primary },
    optionBadgeText: { ...FONTS.body2, fontWeight: '700', color: COLORS.textSecondary },
    optionBadgeTextSelected: { color: COLORS.white },
    optionText: { ...FONTS.body1, color: COLORS.textPrimary, flex: 1 },
    optionTextSelected: { color: COLORS.primary, fontWeight: '600' },
    bookmarkBtn: {
        padding: SPACING.xs,
        marginLeft: SPACING.sm,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: RADIUS.sm,
    },
    bookmarkEmoji: { fontSize: 22 },
    navRow: {
        flexDirection: 'row',
        padding: SPACING.md,
        gap: SPACING.sm,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    navBtn: {
        flex: 1,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.md,
        borderWidth: 2,
        borderColor: COLORS.border,
        alignItems: 'center',
    },
    navBtnDisabled: { opacity: 0.4 },
    navBtnText: { ...FONTS.button, color: COLORS.textSecondary },
    navBtnPrimary: { flex: 2, borderRadius: RADIUS.md, overflow: 'hidden' },
    navBtnGradient: { paddingVertical: SPACING.md, alignItems: 'center' },
    navBtnPrimaryText: { ...FONTS.button, color: COLORS.white },
    submitBtn: { flex: 2, borderRadius: RADIUS.md, overflow: 'hidden' },
    submitBtnGradient: { paddingVertical: SPACING.md, alignItems: 'center' },
    submitBtnText: { ...FONTS.button, color: COLORS.white },
});
