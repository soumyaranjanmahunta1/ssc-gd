import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    StatusBar, ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { fetchChapters } from '../services/questionService';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/theme';

const SUBJECTS = ['Math', 'Reasoning', 'GK', 'English', 'Hindi'];
const SUBJECT_META = {
    Math:      { emoji: '🔢', color: ['#f093fb', '#f5576c'] },
    Reasoning: { emoji: '🧠', color: ['#4facfe', '#00f2fe'] },
    GK:        { emoji: '🌍', color: ['#43e97b', '#38f9d7'] },
    English:   { emoji: '📖', color: ['#fa709a', '#fee140'] },
    Hindi:     { emoji: '🇮🇳', color: ['#f7971e', '#ffd200'] },
};

export default function ChapterListScreen({ navigation }) {
    const [chapters, setChapters] = useState({});
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null); // selected subject

    useEffect(() => {
        fetchChapters()
            .then(data => setChapters(data || {}))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    // Subject list view
    if (!selected) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryStart} />
                <LinearGradient colors={[COLORS.primaryStart, COLORS.primaryEnd]} style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
                        <Text style={styles.backText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>📚 Chapter Wise Test</Text>
                    <Text style={styles.subtitle}>Select a subject to see chapters</Text>
                </LinearGradient>

                <FlatList
                    data={SUBJECTS}
                    keyExtractor={s => s}
                    contentContainerStyle={styles.list}
                    renderItem={({ item: subject }) => {
                        const meta = SUBJECT_META[subject];
                        const count = (chapters[subject] || []).length;
                        return (
                            <TouchableOpacity
                                style={styles.subjectCard}
                                onPress={() => setSelected(subject)}
                                activeOpacity={0.85}>
                                <LinearGradient colors={meta.color} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.subjectGradient}>
                                    <Text style={styles.subjectEmoji}>{meta.emoji}</Text>
                                    <View style={styles.subjectInfo}>
                                        <Text style={styles.subjectName}>{subject}</Text>
                                        <Text style={styles.subjectCount}>{count} chapters</Text>
                                    </View>
                                    <Text style={styles.arrow}>›</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>
        );
    }

    // Chapter list view
    const chapterList = chapters[selected] || [];
    const meta = SUBJECT_META[selected];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryStart} />
            <LinearGradient colors={meta.color} style={styles.header}>
                <TouchableOpacity onPress={() => setSelected(null)} style={styles.back}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>{meta.emoji} {selected}</Text>
                <Text style={styles.subtitle}>{chapterList.length} chapters • all questions included</Text>
            </LinearGradient>

            <FlatList
                data={chapterList}
                keyExtractor={item => item.chapter}
                contentContainerStyle={styles.list}
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                        style={styles.chapterCard}
                        onPress={() => navigation.navigate('Test', {
                            mode: 'chapter',
                            subject: selected,
                            chapter: item.chapter,
                        })}
                        activeOpacity={0.8}>
                        <View style={styles.chapterNum}>
                            <Text style={styles.chapterNumText}>{index + 1}</Text>
                        </View>
                        <View style={styles.chapterInfo}>
                            <Text style={styles.chapterName}>{item.chapter}</Text>
                            <Text style={styles.chapterMeta}>{item.count} questions available</Text>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingTop: 50, paddingBottom: 28, paddingHorizontal: SPACING.lg },
    back: { marginBottom: SPACING.sm },
    backText: { color: COLORS.white, fontSize: 22 },
    title: { ...FONTS.h2, color: COLORS.white },
    subtitle: { ...FONTS.body2, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
    list: { padding: SPACING.md },
    subjectCard: { borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.md, ...SHADOW.md },
    subjectGradient: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, gap: SPACING.md },
    subjectEmoji: { fontSize: 32 },
    subjectInfo: { flex: 1 },
    subjectName: { ...FONTS.h3, color: COLORS.white },
    subjectCount: { ...FONTS.body2, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    arrow: { fontSize: 28, color: COLORS.white, fontWeight: '300' },
    chapterCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.white, borderRadius: RADIUS.md,
        padding: SPACING.md, marginBottom: SPACING.sm,
        ...SHADOW.sm, gap: SPACING.md,
    },
    chapterNum: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: COLORS.primaryStart + '22',
        justifyContent: 'center', alignItems: 'center',
    },
    chapterNumText: { ...FONTS.body2, fontWeight: '700', color: COLORS.primary },
    chapterInfo: { flex: 1 },
    chapterName: { ...FONTS.body1, fontWeight: '600', color: COLORS.textPrimary },
    chapterMeta: { ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2 },
});
