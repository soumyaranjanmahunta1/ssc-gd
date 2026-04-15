import React, { useEffect, useState } from 'react';
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
import { useSelector } from 'react-redux';
import { getUserStats } from '../services/firestoreService';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/theme';

const NAV_CARDS = [
    {
        id: 'mock',
        title: 'Mock Test',
        subtitle: '80 Questions · 60 min',
        emoji: '📝',
        grade: ['#667eea', '#764ba2'],
        screen: 'Test',
        params: { subject: null },
    },
    {
        id: 'topic',
        title: 'Topic-wise Test',
        subtitle: 'GK, Maths, Reasoning, English',
        emoji: '🎯',
        grade: ['#f093fb', '#f5576c'],
        screen: 'TopicTest',
        params: {},
    },
    {
        id: 'dashboard',
        title: 'Performance',
        subtitle: 'Charts · Accuracy · Progress',
        emoji: '📊',
        grade: ['#4facfe', '#00f2fe'],
        screen: 'Dashboard',
        params: {},
    },
];

export default function HomeScreen({ navigation }) {
    const { user } = useSelector(state => state.auth);
    const [stats, setStats] = useState({ lastScore: 0, lastTotal: 0, totalTests: 0, accuracy: 0 });
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
        if (user?.uid) {
            getUserStats(user.uid)
                .then(setStats)
                .catch(() => { });
        }
    }, [user]);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryStart} />

            {/* ─── Header ─────────────────────────────── */}
            <LinearGradient
                colors={[COLORS.primaryStart, COLORS.primaryEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Welcome back,</Text>
                    <Text style={styles.userName}>{user?.name || 'Aspirant'} 👋</Text>
                </View>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{(user?.name || 'A')[0].toUpperCase()}</Text>
                </View>
            </LinearGradient>

            {/* ─── Marketing Banner ──────────────────── */}
            <LinearGradient
                colors={['#FF6B35', '#FF8E53']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.marketingBanner}>
                <Text style={styles.bannerIcon}>🏆</Text>
                <View style={styles.bannerTextWrap}>
                    <Text style={styles.bannerHeadline}>SSC GD 2026 Exam Pattern</Text>
                    <Text style={styles.bannerSub}>Questions based on Latest Official Syllabus</Text>
                </View>
            </LinearGradient>

            {/* ─── Trust Badges ──────────────────────── */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeStrip} contentContainerStyle={styles.badgeContent}>
                <View style={styles.badge}><Text style={styles.badgeText}>✅ 100% Syllabus Covered</Text></View>
                <View style={styles.badge}><Text style={styles.badgeText}>🎯 Exam Pattern Based Questions</Text></View>
                <View style={styles.badge}><Text style={styles.badgeText}>📊 Previous Year Level</Text></View>
                <View style={styles.badge}><Text style={styles.badgeText}>🔥 Most Expected Topics</Text></View>
                <View style={styles.badge}><Text style={styles.badgeText}>⚡ Updated for 2026</Text></View>
            </ScrollView>

            {/* ─── Highlight Box ─────────────────────── */}
            <View style={styles.highlightBox}>
                <Text style={styles.highlightStar}>⭐</Text>
                <View style={{flex:1}}>
                    <Text style={styles.highlightTitle}>Crack SSC GD in First Attempt!</Text>
                    <Text style={styles.highlightDesc}>Our questions are carefully crafted matching the{' '}
                        <Text style={styles.highlightAccent}>exact difficulty & style</Text>{' '}of SSC GD official exams.
                    </Text>
                </View>
            </View>

            {/* ─── Stats Row ──────────────────────────── */}
            <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
                <StatChip emoji="🎯" label="Last Score" value={stats.totalTests ? `${stats.lastScore}/${stats.lastTotal}` : '—'} />
                <StatChip emoji="📋" label="Tests Taken" value={stats.totalTests.toString()} />
                <StatChip emoji="💯" label="Accuracy" value={`${stats.accuracy}%`} />
            </Animated.View>

            {/* ─── Nav Cards ──────────────────────────── */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Start Practising</Text>
                {NAV_CARDS.map(card => (
                    <TouchableOpacity
                        key={card.id}
                        style={styles.card}
                        onPress={() => navigation.navigate(card.screen, card.params)}
                        activeOpacity={0.88}>
                        <LinearGradient
                            colors={card.grade}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.cardGradient}>
                            <Text style={styles.cardEmoji}>{card.emoji}</Text>
                            <View style={styles.cardText}>
                                <Text style={styles.cardTitle}>{card.title}</Text>
                                <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                            </View>
                            <Text style={styles.cardArrow}>›</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ─── Quick Tips ─────────────────────────── */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>📋 Exam Pattern 2026</Text>
                <View style={styles.tipsCard}>
                    <Text style={styles.tipItem}>📌 80 Questions · 160 Total Marks</Text>
                    <Text style={styles.tipItem}>⏱️ 60 Minutes Duration</Text>
                    <Text style={styles.tipItem}>✅ +2.00 for Correct Answer</Text>
                    <Text style={styles.tipItem}>❌ -0.25 Negative Marking</Text>
                    <View style={styles.tipDivider}/>
                    <Text style={styles.tipHighlight}>🔥 Practice daily for guaranteed improvement!</Text>
                </View>
            </View>
            <View style={{ height: SPACING.xl }} />
        </ScrollView>
    );
}

function StatChip({ emoji, label, value }) {
    return (
        <View style={styles.statChip}>
            <Text style={styles.statEmoji}>{emoji}</Text>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 30,
        paddingHorizontal: SPACING.lg,
    },
    greeting: { ...FONTS.body2, color: 'rgba(255,255,255,0.75)' },
    userName: { ...FONTS.h2, color: COLORS.white, marginTop: 2 },
    avatarCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: { ...FONTS.h3, color: COLORS.white },
    // Marketing
    marketingBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: SPACING.md,
        marginTop: SPACING.sm,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        gap: SPACING.sm,
        ...SHADOW.md,
    },
    bannerIcon: { fontSize: 28 },
    bannerTextWrap: { flex: 1 },
    bannerHeadline: { ...FONTS.h4, color: '#fff', fontWeight: '800' },
    bannerSub: { ...FONTS.caption, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
    badgeStrip: { marginTop: SPACING.sm },
    badgeContent: { paddingHorizontal: SPACING.md, gap: SPACING.xs },
    badge: {
        backgroundColor: '#EEF2FF',
        borderRadius: 20,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#C7D2FE',
    },
    badgeText: { ...FONTS.caption, color: '#4338CA', fontWeight: '700' },
    highlightBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        margin: SPACING.md,
        marginBottom: 0,
        backgroundColor: '#FFFBEB',
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        borderLeftWidth: 4,
        borderLeftColor: '#F59E0B',
        gap: SPACING.sm,
        ...SHADOW.sm,
    },
    highlightStar: { fontSize: 22, marginTop: 2 },
    highlightTitle: { ...FONTS.h4, color: '#92400E', marginBottom: 4 },
    highlightDesc: { ...FONTS.body2, color: '#78350F', lineHeight: 20 },
    highlightAccent: { color: '#D97706', fontWeight: '800' },
    // Stats
    statsRow: {
        flexDirection: 'row',
        marginHorizontal: SPACING.md,
        marginTop: SPACING.md,
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        ...SHADOW.md,
        gap: SPACING.xs,
    },
    statChip: { flex: 1, alignItems: 'center', paddingVertical: SPACING.xs },
    statEmoji: { fontSize: 22, marginBottom: 4 },
    statValue: { ...FONTS.h4, color: COLORS.textPrimary },
    statLabel: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2, textAlign: 'center' },
    section: { padding: SPACING.md, paddingBottom: 0 },
    sectionTitle: { ...FONTS.h4, color: COLORS.textPrimary, marginBottom: SPACING.sm },
    card: { borderRadius: RADIUS.lg, marginBottom: SPACING.sm, overflow: 'hidden', ...SHADOW.md },
    cardGradient: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.md },
    cardEmoji: { fontSize: 32 },
    cardText: { flex: 1 },
    cardTitle: { ...FONTS.h4, color: COLORS.white },
    cardSubtitle: { ...FONTS.caption, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    cardArrow: { fontSize: 28, color: COLORS.white, fontWeight: '300' },
    tipsCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        ...SHADOW.sm,
        gap: SPACING.sm,
    },
    tipItem: { ...FONTS.body2, color: COLORS.textSecondary },
    tipDivider: { height: 1, backgroundColor: '#EEF2FF', marginVertical: 4 },
    tipHighlight: { ...FONTS.body2, color: '#7C3AED', fontWeight: '700' },
});
