import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch } from 'react-redux';
import { resetTest } from '../redux/slices/testSlice';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/theme';
import { SUBJECT_ICONS, SUBJECT_COLORS, SUBJECTS } from '../utils/constants';

export default function TopicTestScreen({ navigation }) {
    const dispatch = useDispatch();

    const startTest = (subject) => {
        dispatch(resetTest());
        navigation.navigate('Test', { subject });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryStart} />
            <LinearGradient colors={[COLORS.primaryStart, COLORS.primaryEnd]} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Topic-wise Test</Text>
                <Text style={styles.headerSubtitle}>Choose a subject to practice</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Select Subject</Text>
                {SUBJECTS.map(subject => (
                    <TouchableOpacity key={subject} style={styles.card} onPress={() => startTest(subject)} activeOpacity={0.85}>
                        <LinearGradient
                            colors={SUBJECT_COLORS[subject]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.cardGradient}>
                            <Text style={styles.cardIcon}>{SUBJECT_ICONS[subject]}</Text>
                            <View style={styles.cardMid}>
                                <Text style={styles.cardTitle}>{subject}</Text>
                                <Text style={styles.cardSub}>25 Questions · 20 minutes</Text>
                            </View>
                            <Text style={styles.cardArrow}>›</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}

                <Text style={styles.sectionTitle}>Mixed Test</Text>
                <TouchableOpacity style={styles.card} onPress={() => startTest(null)} activeOpacity={0.85}>
                    <LinearGradient
                        colors={['#f7971e', '#ffd200']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.cardGradient}>
                        <Text style={styles.cardIcon}>🎲</Text>
                        <View style={styles.cardMid}>
                            <Text style={[styles.cardTitle, { color: '#fff' }]}>Full Mock Test</Text>
                            <Text style={[styles.cardSub, { color: 'rgba(255,255,255,0.85)' }]}>All subjects · 80 Questions · 60 min</Text>
                        </View>
                        <Text style={styles.cardArrow}>›</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <View style={{ height: SPACING.xl }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { paddingTop: 50, paddingBottom: 30, paddingHorizontal: SPACING.lg },
    backBtn: { marginBottom: SPACING.sm },
    backText: { fontSize: 22, color: COLORS.white },
    headerTitle: { ...FONTS.h2, color: COLORS.white },
    headerSubtitle: { ...FONTS.body2, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
    content: { padding: SPACING.md },
    sectionTitle: { ...FONTS.h4, color: COLORS.textPrimary, marginBottom: SPACING.sm, marginTop: SPACING.md },
    card: { borderRadius: RADIUS.lg, marginBottom: SPACING.sm, overflow: 'hidden', ...SHADOW.md },
    cardGradient: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md + 4, gap: SPACING.md },
    cardIcon: { fontSize: 36 },
    cardMid: { flex: 1 },
    cardTitle: { ...FONTS.h4, color: COLORS.white },
    cardSub: { ...FONTS.caption, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    cardArrow: { fontSize: 28, color: COLORS.white, fontWeight: '300' },
});
