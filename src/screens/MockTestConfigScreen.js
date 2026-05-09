import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/theme';

const FIXED = ['Math', 'Reasoning', 'GK'];
const OPTIONAL = ['English', 'Hindi'];

export default function MockTestConfigScreen({ navigation }) {
    const [optional, setOptional] = useState('English');

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryStart} />
            <LinearGradient colors={[COLORS.primaryStart, COLORS.primaryEnd]} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>📝 Mock Test</Text>
                <Text style={styles.subtitle}>80 Questions • 60 Minutes • -0.25 Negative</Text>
            </LinearGradient>

            <View style={styles.body}>
                <Text style={styles.sectionLabel}>COMPULSORY SUBJECTS</Text>
                {FIXED.map(s => (
                    <View key={s} style={styles.subjectRow}>
                        <Text style={styles.subjectEmoji}>{emoji(s)}</Text>
                        <View style={styles.subjectInfo}>
                            <Text style={styles.subjectName}>{s}</Text>
                            <Text style={styles.subjectMeta}>20 Questions • 40 Marks</Text>
                        </View>
                        <View style={styles.checkedBadge}>
                            <Text style={styles.checkedText}>✓</Text>
                        </View>
                    </View>
                ))}

                <Text style={[styles.sectionLabel, { marginTop: SPACING.lg }]}>CHOOSE ONE (Language)</Text>
                <View style={styles.optionalRow}>
                    {OPTIONAL.map(s => (
                        <TouchableOpacity
                            key={s}
                            style={[styles.optionBtn, optional === s && styles.optionBtnActive]}
                            onPress={() => setOptional(s)}>
                            <Text style={[styles.optionText, optional === s && styles.optionTextActive]}>
                                {emoji(s)} {s}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>📌 You can switch between sections during the test</Text>
                </View>

                <TouchableOpacity
                    style={styles.startBtn}
                    onPress={() => navigation.navigate('Test', { mode: 'mock', optionalSubject: optional })}
                    activeOpacity={0.85}>
                    <LinearGradient
                        colors={[COLORS.primaryStart, COLORS.primaryEnd]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.startBtnGradient}>
                        <Text style={styles.startBtnText}>Start Mock Test →</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

function emoji(subject) {
    return { Math: '🔢', Reasoning: '🧠', GK: '🌍', English: '📖', Hindi: '🇮🇳' }[subject] || '📚';
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { paddingTop: 50, paddingBottom: 28, paddingHorizontal: SPACING.lg },
    back: { marginBottom: SPACING.sm },
    backText: { color: COLORS.white, fontSize: 22 },
    title: { ...FONTS.h2, color: COLORS.white },
    subtitle: { ...FONTS.body2, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
    body: { flex: 1, padding: SPACING.lg },
    sectionLabel: { ...FONTS.label, color: COLORS.textMuted, marginBottom: SPACING.sm, letterSpacing: 1 },
    subjectRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.white, borderRadius: RADIUS.md,
        padding: SPACING.md, marginBottom: SPACING.sm,
        ...SHADOW.sm, gap: SPACING.md,
    },
    subjectEmoji: { fontSize: 26 },
    subjectInfo: { flex: 1 },
    subjectName: { ...FONTS.body1, fontWeight: '700', color: COLORS.textPrimary },
    subjectMeta: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2 },
    checkedBadge: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: COLORS.correct, justifyContent: 'center', alignItems: 'center',
    },
    checkedText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
    optionalRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
    optionBtn: {
        flex: 1, padding: SPACING.md, borderRadius: RADIUS.md,
        borderWidth: 2, borderColor: COLORS.border,
        backgroundColor: COLORS.white, alignItems: 'center', ...SHADOW.sm,
    },
    optionBtnActive: { borderColor: COLORS.primary, backgroundColor: '#F0F2FF' },
    optionText: { ...FONTS.body1, color: COLORS.textSecondary, fontWeight: '600' },
    optionTextActive: { color: COLORS.primary },
    infoBox: {
        backgroundColor: '#FFF8E1', borderRadius: RADIUS.md,
        padding: SPACING.md, marginBottom: SPACING.lg,
        borderLeftWidth: 3, borderLeftColor: '#FFC107',
    },
    infoText: { ...FONTS.body2, color: '#795548' },
    startBtn: { borderRadius: RADIUS.md, overflow: 'hidden', ...SHADOW.md },
    startBtnGradient: { paddingVertical: 16, alignItems: 'center' },
    startBtnText: { ...FONTS.button, color: COLORS.white, fontSize: 17 },
});
