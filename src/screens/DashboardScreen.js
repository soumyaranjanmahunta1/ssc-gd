import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import { getUserResults } from '../services/firestoreService';
import { formatDate, calcAccuracy } from '../utils/helpers';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/theme';
import { SUBJECTS, SUBJECT_ICONS, SUBJECT_COLORS } from '../utils/constants';

export default function DashboardScreen() {
    const { user } = useSelector(state => state.auth);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.uid) {
            setLoading(true);
            getUserResults(user.uid)
                .then(setResults)
                .catch(err => {
                    console.error('Dashboard Load Error:', err);
                })
                .finally(() => setLoading(false));
        } else if (user === null) {
            // If user is explicitly logged out, stop loading
            setLoading(false);
        }
    }, [user]);

    const totalTests = results.length;
    const overallCorrect = results.reduce((s, r) => s + (r.correct || 0), 0);
    const overallTotal = results.reduce((s, r) => s + (r.total || 0), 0);
    const overallAccuracy = calcAccuracy(overallCorrect, overallTotal);

    // Per-subject stats
    const subjectStats = SUBJECTS.map(sub => {
        const subResults = results.filter(r => r.subject === sub);
        const correct = subResults.reduce((s, r) => s + (r.correct || 0), 0);
        const total = subResults.reduce((s, r) => s + (r.total || 0), 0);
        return { subject: sub, tests: subResults.length, accuracy: calcAccuracy(correct, total) };
    });

    const weakSubjects = subjectStats.filter(s => s.tests > 0 && s.accuracy < 60);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryStart} />

            {/* Header */}
            <LinearGradient colors={[COLORS.primaryStart, COLORS.primaryEnd]} style={styles.header}>
                <Text style={styles.headerTitle}>📊 Performance</Text>
                <Text style={styles.headerSubtitle}>Track your progress</Text>
            </LinearGradient>

            {/* Overall Stats */}
            <View style={styles.statsCard}>
                <View style={styles.statsRow}>
                    <OverallStat label="Tests Taken" value={totalTests} emoji="📋" />
                    <View style={styles.divider} />
                    <OverallStat label="Accuracy" value={`${overallAccuracy}%`} emoji="🎯" />
                    <View style={styles.divider} />
                    <OverallStat label="Correct" value={overallCorrect} emoji="✅" />
                </View>
            </View>

            {/* Subject Accuracy */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Subject Performance</Text>
                {subjectStats.map(({ subject, tests, accuracy }) => (
                    <View key={subject} style={styles.subjectRow}>
                        <Text style={styles.subjectIcon}>{SUBJECT_ICONS[subject]}</Text>
                        <View style={styles.subjectInfo}>
                            <View style={styles.subjectTitleRow}>
                                <Text style={styles.subjectName}>{subject}</Text>
                                <Text style={styles.subjectTests}>{tests} tests</Text>
                            </View>
                            <View style={styles.barBg}>
                                <LinearGradient
                                    colors={SUBJECT_COLORS[subject]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[styles.barFill, { width: `${accuracy}%` }]}
                                />
                            </View>
                        </View>
                        <Text style={styles.subjectPct}>{tests > 0 ? `${accuracy}%` : '—'}</Text>
                    </View>
                ))}
            </View>

            {/* Weak Areas */}
            {weakSubjects.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⚠️ Focus Areas</Text>
                    <View style={styles.weakCard}>
                        {weakSubjects.map(s => (
                            <Text key={s.subject} style={styles.weakItem}>
                                {SUBJECT_ICONS[s.subject]} {s.subject} — only {s.accuracy}% accuracy
                            </Text>
                        ))}
                    </View>
                </View>
            )}

            {/* Recent Tests */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Tests</Text>
                {results.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>No tests yet. Start your first test!</Text>
                    </View>
                ) : (
                    results.slice(0, 10).map(r => (
                        <View key={r.id} style={styles.recentCard}>
                            <View>
                                <Text style={styles.recentSubject}>{SUBJECT_ICONS[r.subject] || '📝'} {r.subject || 'Mixed'}</Text>
                                <Text style={styles.recentDate}>{formatDate(r.createdAt)}</Text>
                            </View>
                            <View style={styles.recentRight}>
                                <Text style={styles.recentScore}>
                                    {r.score}{r.totalMarks ? `/${r.totalMarks}` : `/${r.total}`}
                                </Text>
                                <Text style={[styles.recentAccuracy, { color: r.accuracy >= 60 ? COLORS.correct : COLORS.incorrect }]}>
                                    {r.accuracy}%
                                </Text>
                            </View>
                        </View>
                    ))
                )}
            </View>
            <View style={{ height: 32 }} />
        </ScrollView>
    );
}

function OverallStat({ emoji, label, value }) {
    return (
        <View style={styles.overallStat}>
            <Text style={styles.overallEmoji}>{emoji}</Text>
            <Text style={styles.overallValue}>{value}</Text>
            <Text style={styles.overallLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingTop: 50, paddingBottom: 30, paddingHorizontal: SPACING.lg },
    headerTitle: { ...FONTS.h2, color: COLORS.white },
    headerSubtitle: { ...FONTS.body2, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
    statsCard: {
        backgroundColor: COLORS.white,
        marginHorizontal: SPACING.md,
        marginTop: -16,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        ...SHADOW.md,
    },
    statsRow: { flexDirection: 'row', alignItems: 'center' },
    divider: { width: 1, height: 40, backgroundColor: COLORS.border, marginHorizontal: SPACING.sm },
    overallStat: { flex: 1, alignItems: 'center', gap: 2 },
    overallEmoji: { fontSize: 22 },
    overallValue: { ...FONTS.h3, color: COLORS.textPrimary, fontWeight: '700' },
    overallLabel: { ...FONTS.caption, color: COLORS.textSecondary },
    section: { padding: SPACING.md, paddingBottom: 0 },
    sectionTitle: { ...FONTS.h4, color: COLORS.textPrimary, marginBottom: SPACING.sm },
    subjectRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        gap: SPACING.sm,
        ...SHADOW.sm,
    },
    subjectIcon: { fontSize: 26, width: 36, textAlign: 'center' },
    subjectInfo: { flex: 1 },
    subjectTitleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    subjectName: { ...FONTS.body2, fontWeight: '600', color: COLORS.textPrimary },
    subjectTests: { ...FONTS.caption, color: COLORS.textMuted },
    barBg: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
    barFill: { height: 8, borderRadius: 4 },
    subjectPct: { ...FONTS.body2, fontWeight: '700', color: COLORS.textSecondary, width: 38, textAlign: 'right' },
    weakCard: {
        backgroundColor: '#FFF8E7',
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.warning,
        gap: SPACING.xs,
    },
    weakItem: { ...FONTS.body2, color: COLORS.textPrimary },
    emptyCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        padding: SPACING.lg,
        alignItems: 'center',
        ...SHADOW.sm,
    },
    emptyText: { ...FONTS.body2, color: COLORS.textSecondary },
    recentCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        ...SHADOW.sm,
    },
    recentSubject: { ...FONTS.body2, fontWeight: '600', color: COLORS.textPrimary },
    recentDate: { ...FONTS.caption, color: COLORS.textMuted, marginTop: 2 },
    recentRight: { alignItems: 'flex-end' },
    recentScore: { ...FONTS.h4, color: COLORS.textPrimary },
    recentAccuracy: { ...FONTS.caption, fontWeight: '700' },
});
