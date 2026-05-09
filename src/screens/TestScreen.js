import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    StatusBar, Alert, ActivityIndicator, Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import {
    setQuestions, setSubject, goToNext, goToPrev,
    selectAnswer, submitTest, setLoading, setError, resetTest,
} from '../redux/slices/testSlice';
import { addBookmark, removeBookmark } from '../redux/slices/bookmarkSlice';
import {
    fetchQuestions, fetchMockTestQuestions,
    fetchChapterTestQuestions, toggleBookmark,
} from '../services/questionService';
import { formatTime } from '../utils/helpers';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/theme';

const SUBJECT_COLOR = {
    Math: '#667eea', Reasoning: '#4facfe', GK: '#43e97b',
    English: '#fa709a', Hindi: '#f7971e',
};

export default function TestScreen({ navigation, route }) {
    const dispatch = useDispatch();
    const { questions, currentIndex, answers, isSubmitted, isLoading, error } = useSelector(s => s.test);
    const { user } = useSelector(s => s.auth);
    const { bookmarks } = useSelector(s => s.bookmarks);

    const { mode = 'topic', subject = null, chapter = null, optionalSubject = 'English' } = route.params || {};
    const isMock = mode === 'mock';
    const isChapter = mode === 'chapter';

    const defaultTime = isMock ? 60 * 60 : isChapter ? 10 * 60 : 20 * 60;
    const [timeLeft, setTimeLeft] = useState(defaultTime);
    const timerRef = useRef(null);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    // Compute sections for mock mode
    const sections = useMemo(() => {
        if (!isMock || !questions.length) return [];
        const map = {};
        questions.forEach((q, i) => {
            if (!map[q.subject]) map[q.subject] = { subject: q.subject, start: i };
            map[q.subject].end = i;
        });
        return Object.values(map);
    }, [questions, isMock]);

    const currentSection = isMock && sections.length
        ? sections.find(s => currentIndex >= s.start && currentIndex <= s.end)
        : null;

    // Load questions
    useEffect(() => {
        const load = async () => {
            dispatch(setLoading(true));
            try {
                let qs;
                if (isMock) {
                    const res = await fetchMockTestQuestions(optionalSubject);
                    qs = res.questions;
                    dispatch(setSubject(`Mock Test (${optionalSubject})`));
                } else if (isChapter) {
                    qs = await fetchChapterTestQuestions(subject, chapter);
                    dispatch(setSubject(`${subject} › ${chapter}`));
                } else {
                    const res = await fetchQuestions({ subject, limit: 25 });
                    qs = res.questions;
                    dispatch(setSubject(subject || 'Mixed'));
                }
                dispatch(setQuestions(qs));
            } catch (e) {
                dispatch(setError(e.message));
            }
        };
        load();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    useEffect(() => {
        if (questions.length > 0 && !isSubmitted) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [questions.length]);

    useEffect(() => {
        if (isSubmitted) {
            if (timerRef.current) clearInterval(timerRef.current);
            navigation.replace('Result');
        }
    }, [isSubmitted]);

    const animateTransition = cb => {
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
        cb();
    };

    const handleSubmit = (timeUp = false) => {
        if (timeUp) { dispatch(submitTest()); return; }
        const unanswered = questions.length - Object.keys(answers).length;
        Alert.alert('Submit Test?',
            unanswered > 0 ? `${unanswered} question(s) unanswered. Still submit?` : 'Ready to submit?',
            [{ text: 'Cancel', style: 'cancel' },
             { text: 'Submit', style: 'destructive', onPress: () => dispatch(submitTest()) }]
        );
    };

    const handleBookmarkToggle = async () => {
        if (!questions[currentIndex] || !user?.email) return;
        const q = questions[currentIndex];
        const isBookmarked = bookmarks.some(b => b._id === q._id);
        if (isBookmarked) dispatch(removeBookmark(q._id));
        else dispatch(addBookmark(q));
        toggleBookmark(user.email, q._id).catch(() => {});
    };

    const handleExit = () => {
        Alert.alert('Exit Test?', 'Your progress will be lost.',
            [{ text: 'Cancel', style: 'cancel' },
             { text: 'Exit', style: 'destructive', onPress: () => { dispatch(resetTest()); navigation.navigate('MainTabs'); } }]
        );
    };

    if (isLoading) return (
        <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading questions...</Text>
        </View>
    );

    if (error) return (
        <View style={styles.centered}>
            <Text style={styles.errorTitle}>Failed to load questions</Text>
            <Text style={styles.errorMsg}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => { dispatch(resetTest()); navigation.goBack(); }}>
                <Text style={styles.retryText}>← Go Back</Text>
            </TouchableOpacity>
        </View>
    );

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
                    {q.subject && <Text style={styles.subjectTag}>{q.subject}</Text>}
                </View>
                <View style={[styles.timerPill, isLow && styles.timerPillDanger]}>
                    <Text style={styles.timerText}>⏱️ {formatTime(timeLeft)}</Text>
                </View>
                <TouchableOpacity onPress={handleBookmarkToggle} style={styles.bookmarkBtn}>
                    <Text style={{ fontSize: 22, opacity: bookmarks.some(b => b._id === q?._id) ? 1 : 0.4 }}>
                        {bookmarks.some(b => b._id === q?._id) ? '🔖' : '📑'}
                    </Text>
                </TouchableOpacity>
            </LinearGradient>

            {/* Section Tabs (mock mode only) */}
            {isMock && sections.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sectionBar} contentContainerStyle={styles.sectionBarContent}>
                    {sections.map(sec => {
                        const answered = Object.keys(answers).filter((id, _, arr) => {
                            const idx = questions.findIndex(x => x._id === id);
                            return idx >= sec.start && idx <= sec.end;
                        }).length;
                        const total = sec.end - sec.start + 1;
                        const active = currentSection?.subject === sec.subject;
                        const color = SUBJECT_COLOR[sec.subject] || COLORS.primary;
                        return (
                            <TouchableOpacity
                                key={sec.subject}
                                style={[styles.sectionTab, active && { borderBottomColor: color, borderBottomWidth: 3 }]}
                                onPress={() => animateTransition(() => {
                                    const action = { type: 'test/setCurrentIndex', payload: sec.start };
                                    dispatch(action);
                                })}>
                                <Text style={[styles.sectionTabText, active && { color, fontWeight: '700' }]}>
                                    {sec.subject}
                                </Text>
                                <Text style={[styles.sectionTabCount, { color: answered === total ? COLORS.correct : COLORS.textMuted }]}>
                                    {answered}/{total}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            )}

            {/* Progress bar */}
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>

            {/* Question */}
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    {isChapter && (
                        <View style={styles.chapterBadge}>
                            <Text style={styles.chapterBadgeText}>{q.chapter}</Text>
                        </View>
                    )}
                    <View style={styles.questionCard}>
                        <Text style={styles.questionText}>{q.question}</Text>
                    </View>
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
                                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{option}</Text>
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
                        <LinearGradient colors={[COLORS.correct, '#00b36b']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitBtnGradient}>
                            <Text style={styles.submitBtnText}>Submit ✓</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.navBtnPrimary} onPress={() => animateTransition(() => dispatch(goToNext()))}>
                        <LinearGradient colors={[COLORS.primaryStart, COLORS.primaryEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.navBtnGradient}>
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
    timerHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingBottom: SPACING.md, paddingHorizontal: SPACING.lg },
    exitBtn: { width: 36, height: 36, borderRadius: RADIUS.full, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
    headerInfo: { flex: 1 },
    questionCount: { ...FONTS.h4, color: COLORS.white },
    subjectTag: { ...FONTS.caption, color: 'rgba(255,255,255,0.75)', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 },
    timerPill: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs },
    timerPillDanger: { backgroundColor: COLORS.incorrect },
    timerText: { ...FONTS.h4, color: COLORS.white },
    bookmarkBtn: { padding: SPACING.xs, marginLeft: SPACING.sm, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.sm },
    sectionBar: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border, maxHeight: 56 },
    sectionBarContent: { paddingHorizontal: SPACING.sm },
    sectionTab: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
    sectionTabText: { ...FONTS.caption, fontWeight: '600', color: COLORS.textSecondary },
    sectionTabCount: { ...FONTS.caption, fontSize: 10, marginTop: 2 },
    progressBar: { height: 4, backgroundColor: 'rgba(102,126,234,0.2)' },
    progressFill: { height: 4, backgroundColor: COLORS.primary },
    scroll: { flex: 1 },
    scrollContent: { padding: SPACING.md, paddingBottom: SPACING.xl },
    chapterBadge: { backgroundColor: COLORS.primaryStart + '22', borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: SPACING.sm },
    chapterBadgeText: { ...FONTS.caption, color: COLORS.primary, fontWeight: '700' },
    questionCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOW.sm },
    questionText: { ...FONTS.body1, color: COLORS.textPrimary, lineHeight: 26, fontSize: 16 },
    option: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 2, borderColor: COLORS.border, ...SHADOW.sm, gap: SPACING.sm },
    optionSelected: { borderColor: COLORS.primary, backgroundColor: '#F0F2FF' },
    optionBadge: { width: 32, height: 32, borderRadius: RADIUS.full, backgroundColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
    optionBadgeSelected: { backgroundColor: COLORS.primary },
    optionBadgeText: { ...FONTS.body2, fontWeight: '700', color: COLORS.textSecondary },
    optionBadgeTextSelected: { color: COLORS.white },
    optionText: { ...FONTS.body1, color: COLORS.textPrimary, flex: 1 },
    optionTextSelected: { color: COLORS.primary, fontWeight: '600' },
    navRow: { flexDirection: 'row', padding: SPACING.md, gap: SPACING.sm, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
    navBtn: { flex: 1, paddingVertical: SPACING.md, borderRadius: RADIUS.md, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center' },
    navBtnDisabled: { opacity: 0.4 },
    navBtnText: { ...FONTS.button, color: COLORS.textSecondary },
    navBtnPrimary: { flex: 2, borderRadius: RADIUS.md, overflow: 'hidden' },
    navBtnGradient: { paddingVertical: SPACING.md, alignItems: 'center' },
    navBtnPrimaryText: { ...FONTS.button, color: COLORS.white },
    submitBtn: { flex: 2, borderRadius: RADIUS.md, overflow: 'hidden' },
    submitBtnGradient: { paddingVertical: SPACING.md, alignItems: 'center' },
    submitBtnText: { ...FONTS.button, color: COLORS.white },
});
