import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { resetTest } from '../redux/slices/testSlice';
import { addBookmark, removeBookmark } from '../redux/slices/bookmarkSlice';
import { saveTestResult, saveBookmarks } from '../services/firestoreService';
import { formatTime, getScoreLabel } from '../utils/helpers';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/theme';

export default function ResultScreen({ navigation }) {
    const dispatch = useDispatch();
    const { questions, answers, result, subject } = useSelector(state => state.test);
    const { user } = useSelector(state => state.auth);
    const { bookmarks } = useSelector(state => state.bookmarks);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.85)).current;

    useEffect(() => {
        // Auto-save result to Firestore
        if (result && user?.uid) {
            saveTestResult(user.uid, {
                subject: subject || 'Mixed',
                score: result.score,
                total: result.total,
                totalMarks: result.totalPossibleMarks,
                correct: result.correct,
                wrong: result.wrong,
                skipped: result.skipped,
                accuracy: result.accuracy,
                timeTakenSeconds: result.timeTakenSeconds,
            }).catch(console.warn);
        }
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        ]).start();
    }, []);

    if (!result) {
        return (
            <View style={styles.centered}>
                <Text style={styles.noResult}>No result available.</Text>
                <TouchableOpacity onPress={() => navigation.navigate('MainTabs')}>
                    <Text style={styles.goHome}>Go Home</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleRetake = () => {
        dispatch(resetTest());
        navigation.replace('Test', { subject });
    };

    const goHome = () => {
        dispatch(resetTest());
        navigation.navigate('MainTabs');
    };

    const handleBookmarkToggle = async (q) => {
        if (!q || !user?.uid) return;
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

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryStart} />

            {/* Score Card */}
            <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
                <LinearGradient
                    colors={result.accuracy >= 60 ? [COLORS.primaryStart, COLORS.primaryEnd] : [COLORS.accent, '#c0392b']}
                    style={styles.scoreHeader}>
                    <Text style={styles.scoreEmoji}>{result.accuracy >= 90 ? '🏆' : result.accuracy >= 60 ? '🎉' : '💪'}</Text>
                    <Text style={styles.scoreLabel}>{getScoreLabel(result.accuracy)}</Text>
                    <Text style={styles.scoreBig}>{result.correct}</Text>
                    <Text style={styles.scoreOf}>out of {result.total}</Text>
                    <Text style={styles.scoreAccuracy}>{result.accuracy}% Accuracy</Text>
                </LinearGradient>
            </Animated.View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <ResultStat emoji="✅" label="Correct" value={result.correct} color={COLORS.correct} />
                <ResultStat emoji="❌" label="Wrong" value={result.wrong} color={COLORS.incorrect} />
                <ResultStat emoji="⏭️" label="Skipped" value={result.skipped} color={COLORS.warning} />
                <ResultStat emoji="⏱️" label="Time" value={formatTime(result.timeTakenSeconds)} color={COLORS.info} />
            </View>

            {/* CTA Buttons */}
            <View style={styles.btnRow}>
                <TouchableOpacity style={styles.retakeBtn} onPress={handleRetake}>
                    <Text style={styles.retakeBtnText}>🔄 Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.homeBtn} onPress={goHome}>
                    <LinearGradient colors={[COLORS.primaryStart, COLORS.primaryEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.homeBtnGradient}>
                        <Text style={styles.homeBtnText}>🏠 Home</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Question Review */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Question Review</Text>
                {questions.map((q, idx) => {
                    const chosen = answers[q._id];
                    const isCorrect = chosen === q.answer;
                    const isSkipped = !chosen;
                    let statusColor = COLORS.warning; // skipped
                    let statusEmoji = '⏭️';
                    if (!isSkipped) {
                        statusColor = isCorrect ? COLORS.correct : COLORS.incorrect;
                        statusEmoji = isCorrect ? '✅' : '❌';
                    }

                    return (
                        <View key={q._id} style={[styles.reviewCard, { borderLeftColor: statusColor }]}>
                            <View style={styles.reviewHeader}>
                                <Text style={styles.reviewQNum}>Q{idx + 1} {statusEmoji}</Text>
                                <TouchableOpacity onPress={() => handleBookmarkToggle(q)} style={styles.bookmarkSmBtn}>
                                    <Text style={[styles.bookmarkEmoji, { opacity: bookmarks.some(b => b._id === q._id) ? 1 : 0.3 }]}>
                                        {bookmarks.some(b => b._id === q._id) ? '🔖' : '📑'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.reviewQuestion}>{q.question}</Text>
                            {!isSkipped && !isCorrect && (
                                <View style={styles.reviewAnswerRow}>
                                    <Text style={[styles.reviewAnswerLabel, { color: COLORS.incorrect }]}>Your answer: </Text>
                                    <Text style={[styles.reviewAnswerValue, { color: COLORS.incorrect }]}>{chosen}</Text>
                                </View>
                            )}
                            <View style={styles.reviewAnswerRow}>
                                <Text style={[styles.reviewAnswerLabel, { color: COLORS.correct }]}>Correct: </Text>
                                <Text style={[styles.reviewAnswerValue, { color: COLORS.correct }]}>{q.answer}</Text>
                            </View>
                            {q.explanation ? (
                                <View style={styles.explanationBox}>
                                    <Text style={styles.explanationText}>💡 {q.explanation}</Text>
                                </View>
                            ) : null}
                        </View>
                    );
                })}
            </View>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

function ResultStat({ emoji, label, value, color }) {
    return (
        <View style={styles.statChip}>
            <Text style={styles.statEmoji}>{emoji}</Text>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    noResult: { ...FONTS.body1, color: COLORS.textSecondary },
    goHome: { ...FONTS.button, color: COLORS.primary, marginTop: SPACING.md },
    scoreHeader: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: SPACING.lg,
    },
    scoreEmoji: { fontSize: 56 },
    scoreLabel: { ...FONTS.h4, color: 'rgba(255,255,255,0.85)', marginTop: SPACING.sm },
    scoreBig: { fontSize: 72, fontWeight: '800', color: COLORS.white, lineHeight: 80 },
    scoreOf: { ...FONTS.body1, color: 'rgba(255,255,255,0.75)' },
    scoreAccuracy: { ...FONTS.h4, color: COLORS.white, marginTop: SPACING.xs, fontWeight: '700' },
    statsRow: {
        flexDirection: 'row',
        marginHorizontal: SPACING.md,
        marginTop: -20,
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        ...SHADOW.md,
    },
    statChip: { flex: 1, alignItems: 'center', gap: 2 },
    statEmoji: { fontSize: 20 },
    statValue: { ...FONTS.h4, fontWeight: '700' },
    statLabel: { ...FONTS.caption, color: COLORS.textSecondary },
    btnRow: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md },
    retakeBtn: {
        flex: 1,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.md,
        borderWidth: 2,
        borderColor: COLORS.primary,
        alignItems: 'center',
    },
    retakeBtnText: { ...FONTS.button, color: COLORS.primary },
    homeBtn: { flex: 2, borderRadius: RADIUS.md, overflow: 'hidden' },
    homeBtnGradient: { paddingVertical: SPACING.md, alignItems: 'center' },
    homeBtnText: { ...FONTS.button, color: COLORS.white },
    section: { paddingHorizontal: SPACING.md },
    sectionTitle: { ...FONTS.h3, color: COLORS.textPrimary, marginBottom: SPACING.md },
    reviewCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        borderLeftWidth: 4,
        ...SHADOW.sm,
    },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    bookmarkSmBtn: { padding: 4 },
    bookmarkEmoji: { fontSize: 18 },
    reviewQNum: { ...FONTS.label, color: COLORS.textMuted },
    reviewQuestion: { ...FONTS.body1, color: COLORS.textPrimary, marginBottom: SPACING.sm, lineHeight: 22 },
    reviewAnswerRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 2 },
    reviewAnswerLabel: { ...FONTS.caption },
    reviewAnswerValue: { ...FONTS.caption, fontWeight: '700' },
    explanationBox: {
        backgroundColor: '#F8F9FF',
        borderRadius: RADIUS.sm,
        padding: SPACING.sm,
        marginTop: SPACING.sm,
    },
    explanationText: { ...FONTS.caption, color: COLORS.textSecondary, lineHeight: 18 },
});
