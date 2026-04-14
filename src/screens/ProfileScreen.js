import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { signOut } from '../services/authService';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/theme';

export default function ProfileScreen() {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await signOut();
                    dispatch(logout());
                },
            },
        ]);
    };

    const InfoRow = ({ emoji, label, value }) => (
        <View style={styles.infoRow}>
            <Text style={styles.infoEmoji}>{emoji}</Text>
            <View>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value || '—'}</Text>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryStart} />

            {/* Header */}
            <LinearGradient colors={[COLORS.primaryStart, COLORS.primaryEnd]} style={styles.header}>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{(user?.name || 'A')[0].toUpperCase()}</Text>
                </View>
                <Text style={styles.userName}>{user?.name}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
            </LinearGradient>

            {/* Info Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Account Info</Text>
                <InfoRow emoji="👤" label="Full Name" value={user?.name} />
                <InfoRow emoji="📧" label="Email" value={user?.email} />
                <InfoRow emoji="🔑" label="User ID" value={user?.uid?.slice(0, 12) + '...'} />
            </View>

            {/* App Info */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>App Info</Text>
                <InfoRow emoji="📱" label="App Name" value="SSC GD Mock Test 2026" />
                <InfoRow emoji="🔢" label="Version" value="1.0.0" />
                <InfoRow emoji="📚" label="Questions Available" value="40+ (Growing)" />
            </View>

            {/* Logout */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
                <Text style={styles.logoutText}>🚪  Logout</Text>
            </TouchableOpacity>

            <View style={{ height: 32 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: SPACING.lg,
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    avatarText: { fontSize: 36, color: COLORS.white, fontWeight: '700' },
    userName: { ...FONTS.h2, color: COLORS.white },
    userEmail: { ...FONTS.body2, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        margin: SPACING.md,
        marginBottom: 0,
        ...SHADOW.sm,
    },
    cardTitle: { ...FONTS.label, color: COLORS.textMuted, marginBottom: SPACING.sm },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        gap: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    infoEmoji: { fontSize: 22, width: 32, textAlign: 'center' },
    infoLabel: { ...FONTS.caption, color: COLORS.textMuted },
    infoValue: { ...FONTS.body2, color: COLORS.textPrimary, fontWeight: '500', marginTop: 2 },
    logoutBtn: {
        margin: SPACING.md,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        alignItems: 'center',
        backgroundColor: '#FFF0F0',
        borderWidth: 1.5,
        borderColor: COLORS.incorrect,
        marginTop: SPACING.lg,
    },
    logoutText: { ...FONTS.button, color: COLORS.incorrect },
});
