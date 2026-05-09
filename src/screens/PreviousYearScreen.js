import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/theme';

export default function PreviousYearScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#f7971e" />

            {/* Header */}
            <LinearGradient
                colors={['#f7971e', '#ffd200']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>📜 Previous Year Questions</Text>
                <Text style={styles.subtitle}>Official SSC GD Exam Papers</Text>
            </LinearGradient>

            {/* Coming Soon Banner */}
            <View style={styles.body}>
                <View style={styles.comingSoonCard}>
                    <Text style={styles.clockEmoji}>🕐</Text>
                    <Text style={styles.comingSoonTitle}>Coming Soon!</Text>
                    <Text style={styles.comingSoonDesc}>
                        We are adding year-wise official SSC GD question papers.
                        Each year will have multiple full exam sets with detailed solutions.
                    </Text>
                    <View style={styles.divider} />
                    <Text style={styles.featureHeading}>What to expect:</Text>
                    <View style={styles.featureList}>
                        <Text style={styles.featureItem}>📅 Year-wise papers (2021 – 2025)</Text>
                        <Text style={styles.featureItem}>📋 30+ question sets per year</Text>
                        <Text style={styles.featureItem}>💡 Detailed explanations</Text>
                        <Text style={styles.featureItem}>📊 Performance tracking</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.85}>
                    <LinearGradient
                        colors={['#f7971e', '#ffd200']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.backBtnGradient}>
                        <Text style={styles.backBtnText}>← Go Back</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        paddingTop: 50,
        paddingBottom: 28,
        paddingHorizontal: SPACING.lg,
    },
    back: { marginBottom: SPACING.sm },
    backText: { color: COLORS.white, fontSize: 22 },
    title: { ...FONTS.h2, color: COLORS.white },
    subtitle: { ...FONTS.body2, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    body: {
        flex: 1,
        padding: SPACING.md,
        justifyContent: 'center',
    },
    comingSoonCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        alignItems: 'center',
        ...SHADOW.md,
        marginBottom: SPACING.lg,
    },
    clockEmoji: { fontSize: 64, marginBottom: SPACING.md },
    comingSoonTitle: {
        ...FONTS.h2,
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    comingSoonDesc: {
        ...FONTS.body2,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: SPACING.md,
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#EEF2FF',
        marginBottom: SPACING.md,
    },
    featureHeading: {
        ...FONTS.h4,
        color: COLORS.textPrimary,
        alignSelf: 'flex-start',
        marginBottom: SPACING.sm,
    },
    featureList: { alignSelf: 'flex-start', gap: SPACING.xs },
    featureItem: { ...FONTS.body2, color: COLORS.textSecondary },
    backBtn: { borderRadius: RADIUS.md, overflow: 'hidden' },
    backBtnGradient: {
        paddingVertical: SPACING.md,
        alignItems: 'center',
    },
    backBtnText: { ...FONTS.button, color: COLORS.white },
});
