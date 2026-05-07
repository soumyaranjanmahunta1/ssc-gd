import React, { useEffect, useState } from 'react';
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
import { fetchMockTestList } from '../services/questionService';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/theme';

export default function MockTestListScreen({ navigation }) {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMockTestList()
            .then(data => setTests(data))
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading mock tests...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>← Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryStart} />

            <LinearGradient colors={[COLORS.primaryStart, COLORS.primaryEnd]} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
                    <Text style={styles.backIconText}>←</Text>
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Mock Tests</Text>
                    <Text style={styles.headerSub}>80 Questions · 60 Min · -0.25 Marking</Text>
                </View>
            </LinearGradient>

            {tests.length === 0 ? (
                <View style={styles.centered}>
                    <Text style={styles.emptyText}>No mock tests available yet.</Text>
                    <Text style={styles.emptySubText}>Check back soon!</Text>
                </View>
            ) : (
                <FlatList
                    data={tests}
                    keyExtractor={item => item.number.toString()}
                    contentContainerStyle={styles.list}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            style={styles.card}
                            activeOpacity={0.85}
                            onPress={() => navigation.navigate('Test', { mockTestNumber: item.number })}>
                            <LinearGradient
                                colors={GRADIENTS[index % GRADIENTS.length]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.cardGradient}>
                                <View style={styles.cardBadge}>
                                    <Text style={styles.cardBadgeText}>{item.number}</Text>
                                </View>
                                <View style={styles.cardBody}>
                                    <Text style={styles.cardTitle}>Mock Test {item.number}</Text>
                                    <Text style={styles.cardSub}>{item.questionCount} Questions · 60 Min</Text>
                                </View>
                                <Text style={styles.cardArrow}>›</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}

const GRADIENTS = [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
    ['#a18cd1', '#fbc2eb'],
    ['#ffecd2', '#fcb69f'],
    ['#ff9a9e', '#fad0c4'],
    ['#a1c4fd', '#c2e9fb'],
    ['#fd746c', '#ff9068'],
];

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 24,
        paddingHorizontal: SPACING.lg,
        gap: SPACING.md,
    },
    backIcon: {
        width: 36,
        height: 36,
        borderRadius: RADIUS.full,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIconText: { fontSize: 20, color: COLORS.white, fontWeight: '700' },
    headerTitle: { ...FONTS.h3, color: COLORS.white },
    headerSub: { ...FONTS.caption, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    list: { padding: SPACING.md, gap: SPACING.sm },
    card: { borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOW.md },
    cardGradient: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.md },
    cardBadge: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.full,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardBadgeText: { ...FONTS.h3, color: COLORS.white, fontWeight: '800' },
    cardBody: { flex: 1 },
    cardTitle: { ...FONTS.h4, color: COLORS.white },
    cardSub: { ...FONTS.caption, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    cardArrow: { fontSize: 28, color: COLORS.white, fontWeight: '300' },
    loadingText: { ...FONTS.body2, color: COLORS.textSecondary, marginTop: SPACING.md },
    errorText: { ...FONTS.body1, color: COLORS.incorrect, textAlign: 'center' },
    backBtn: { marginTop: SPACING.lg, padding: SPACING.md },
    backBtnText: { ...FONTS.button, color: COLORS.primary },
    emptyText: { ...FONTS.h4, color: COLORS.textSecondary },
    emptySubText: { ...FONTS.body2, color: COLORS.textMuted, marginTop: 8 },
});
