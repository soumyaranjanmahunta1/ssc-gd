import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { signInWithEmail, getAuthErrorMessage } from '../services/authService';
import { setUser, setLoading, setError, clearError } from '../redux/slices/authSlice';
import { isValidEmail } from '../utils/helpers';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/theme';

export default function LoginScreen({ navigation }) {
    const dispatch = useDispatch();
    const { isLoading, error } = useSelector(state => state.auth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const validate = () => {
        const errors = {};
        if (!email.trim()) errors.email = 'Email is required';
        else if (!isValidEmail(email)) errors.email = 'Enter a valid email address';
        if (!password) errors.password = 'Password is required';
        else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;
        dispatch(clearError());
        dispatch(setLoading(true));
        try {
            const user = await signInWithEmail(email.trim(), password);
            dispatch(setUser({
                uid: user.uid,
                name: user.displayName || 'User',
                email: user.email,
            }));
        } catch (e) {
            dispatch(setError(getAuthErrorMessage(e)));
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryStart} />
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled">
                {/* Header */}
                <LinearGradient
                    colors={[COLORS.primaryStart, COLORS.primaryEnd]}
                    style={styles.header}>
                    <Text style={styles.headerEmoji}>📚</Text>
                    <Text style={styles.headerTitle}>Welcome Back!</Text>
                    <Text style={styles.headerSubtitle}>Login to continue your preparation</Text>
                </LinearGradient>

                {/* Form Card */}
                <View style={styles.card}>
                    {error ? (
                        <View style={styles.errorBanner}>
                            <Text style={styles.errorBannerText}>⚠️ {error}</Text>
                        </View>
                    ) : null}

                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={[styles.input, fieldErrors.email && styles.inputError]}
                        placeholder="you@example.com"
                        placeholderTextColor={COLORS.textMuted}
                        value={email}
                        onChangeText={v => { setEmail(v); setFieldErrors(p => ({ ...p, email: null })); }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                    />
                    {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}

                    <Text style={[styles.label, { marginTop: SPACING.md }]}>Password</Text>
                    <View style={[styles.inputRow, fieldErrors.password && styles.inputError]}>
                        <TextInput
                            style={styles.inputFlex}
                            placeholder="Min 6 characters"
                            placeholderTextColor={COLORS.textMuted}
                            value={password}
                            onChangeText={v => { setPassword(v); setFieldErrors(p => ({ ...p, password: null })); }}
                            secureTextEntry={!showPass}
                            autoComplete="password"
                        />
                        <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
                            <Text style={styles.eyeText}>{showPass ? '🙈' : '👁️'}</Text>
                        </TouchableOpacity>
                    </View>
                    {fieldErrors.password ? <Text style={styles.fieldError}>{fieldErrors.password}</Text> : null}

                    <TouchableOpacity
                        style={[styles.loginBtn, isLoading && styles.btnDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                        activeOpacity={0.85}>
                        <LinearGradient
                            colors={[COLORS.primaryStart, COLORS.primaryEnd]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.loginBtnGradient}>
                            {isLoading ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <Text style={styles.loginBtnText}>Login →</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity
                        style={styles.signupBtn}
                        onPress={() => navigation.navigate('Signup')}
                        activeOpacity={0.85}>
                        <Text style={styles.signupBtnText}>Create New Account</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scroll: { flex: 1, backgroundColor: COLORS.background },
    scrollContent: { flexGrow: 1 },
    header: {
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: SPACING.lg,
        alignItems: 'center',
    },
    headerEmoji: { fontSize: 48, marginBottom: SPACING.sm },
    headerTitle: { ...FONTS.h1, color: COLORS.white },
    headerSubtitle: { ...FONTS.body1, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    card: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
        marginTop: -24,
        padding: SPACING.lg,
        ...SHADOW.sm,
    },
    errorBanner: {
        backgroundColor: '#FFF0F0',
        borderRadius: RADIUS.sm,
        padding: SPACING.sm,
        marginBottom: SPACING.md,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.incorrect,
    },
    errorBannerText: { ...FONTS.body2, color: COLORS.incorrect },
    label: { ...FONTS.label, color: COLORS.textSecondary, marginBottom: SPACING.xs },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        ...FONTS.body1,
        color: COLORS.textPrimary,
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: RADIUS.md,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        paddingHorizontal: SPACING.md,
    },
    inputFlex: { flex: 1, paddingVertical: SPACING.md, ...FONTS.body1, color: COLORS.textPrimary },
    eyeBtn: { padding: SPACING.xs },
    eyeText: { fontSize: 18 },
    inputError: { borderColor: COLORS.incorrect },
    fieldError: { ...FONTS.caption, color: COLORS.incorrect, marginTop: 4 },
    loginBtn: { marginTop: SPACING.lg, borderRadius: RADIUS.md, overflow: 'hidden', ...SHADOW.md },
    loginBtnGradient: {
        paddingVertical: SPACING.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    loginBtnText: { ...FONTS.button, color: COLORS.white, fontSize: 17 },
    btnDisabled: { opacity: 0.7 },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.lg },
    dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
    dividerText: { ...FONTS.caption, color: COLORS.textMuted, marginHorizontal: SPACING.sm },
    signupBtn: {
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderRadius: RADIUS.md,
        paddingVertical: SPACING.md,
        alignItems: 'center',
    },
    signupBtnText: { ...FONTS.button, color: COLORS.primary },
});
