import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { removeBookmark } from '../redux/slices/bookmarkSlice';
import { toggleBookmark, fetchUserBookmarks } from '../services/questionService';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/theme';

export default function BookmarksScreen() {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            if (!user?.email) return;
            let active = true;
            setLoading(true);
            fetchUserBookmarks(user.email)
                .then(questions => { if (active) setBookmarks(questions || []); })
                .catch(() => { if (active) setBookmarks([]); })
                .finally(() => { if (active) setLoading(false); });
            return () => { active = false; };
        }, [user?.email])
    );

    const handleRemove = async (questionId) => {
        const qid = String(questionId);
        setBookmarks(prev => prev.filter(b => String(b._id) !== qid));
        dispatch(removeBookmark(qid));
        if (user?.email) {
            toggleBookmark(user.email, qid).catch(() => {});
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryStart} />

            {/* Header */}
            <LinearGradient colors={[COLORS.primaryStart, COLORS.primaryEnd]} style={styles.header}>
                <Text style={styles.headerTitle}>🔖 Bookmarks</Text>
                <Text style={styles.headerSubtitle}>{bookmarks.length} saved question{bookmarks.length !== 1 ? 's' : ''}</Text>
            </LinearGradient>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : bookmarks.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyEmoji}>🔖</Text>
                    <Text style={styles.emptyTitle}>No Bookmarks Yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Bookmark questions during tests to review them here.
                    </Text>
                </View>
            ) : (
            <FlatList
                    data={bookmarks}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item, index }) => (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardNum}>Q{index + 1}</Text>
                                <Text style={styles.subjectBadge}>{item.subject}</Text>
                                <TouchableOpacity onPress={() => handleRemove(item._id)} style={styles.removeBtn}>
                                    <Text style={styles.removeText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.questionText}>{item.question}</Text>
                            <View style={styles.answerRow}>
                                <Text style={styles.answerLabel}>Answer: </Text>
                                <Text style={styles.answerValue}>{item.answer}</Text>
                            </View>
                            {item.explanation ? (
                                <View style={styles.explanationBox}>
                                    <Text style={styles.explanationText}>💡 {item.explanation}</Text>
                                </View>
                            ) : null}
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { paddingTop: 50, paddingBottom: 24, paddingHorizontal: SPACING.lg },
    headerTitle: { ...FONTS.h2, color: COLORS.white },
    headerSubtitle: { ...FONTS.body2, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
    emptyEmoji: { fontSize: 56, marginBottom: SPACING.md },
    emptyTitle: { ...FONTS.h3, color: COLORS.textPrimary, marginBottom: SPACING.sm },
    emptySubtitle: { ...FONTS.body2, color: COLORS.textSecondary, textAlign: 'center' },
    listContent: { padding: SPACING.md, paddingBottom: 32 },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        ...SHADOW.sm,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm, gap: SPACING.sm },
    cardNum: { ...FONTS.label, color: COLORS.textMuted },
    subjectBadge: {
        backgroundColor: COLORS.primaryStart + '22',
        color: COLORS.primary,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: RADIUS.full,
        ...FONTS.caption,
        fontWeight: '600',
        flex: 1,
    },
    removeBtn: {
        padding: SPACING.xs,
        backgroundColor: '#FFF0F0',
        borderRadius: RADIUS.full,
        width: 26,
        height: 26,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeText: { fontSize: 12, color: COLORS.incorrect, fontWeight: '700' },
    questionText: { ...FONTS.body1, color: COLORS.textPrimary, lineHeight: 22, marginBottom: SPACING.sm },
    answerRow: { flexDirection: 'row', alignItems: 'center' },
    answerLabel: { ...FONTS.caption, color: COLORS.textSecondary },
    answerValue: { ...FONTS.caption, fontWeight: '700', color: COLORS.correct },
    explanationBox: {
        backgroundColor: '#F8F9FF',
        borderRadius: RADIUS.sm,
        padding: SPACING.sm,
        marginTop: SPACING.sm,
    },
    explanationText: { ...FONTS.caption, color: COLORS.textSecondary, lineHeight: 18 },
});
