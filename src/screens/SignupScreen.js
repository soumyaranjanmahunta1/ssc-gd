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
import { signUpWithEmail, getAuthErrorMessage } from '../services/authService';
import { setUser, setLoading, setError, clearError } from '../redux/slices/authSlice';
import { isValidEmail } from '../utils/helpers';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/theme';

export default function SignupScreen({ navigation }) {
    const dispatch = useDispatch();
    const { isLoading, error } = useSelector(state => state.auth);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const validate = () => {
        const errs = {};
        if (!name.trim() || name.trim().length < 2) errs.name = 'Enter your full name (min 2 chars)';
        if (!isValidEmail(email)) errs.email = 'Enter a valid email address';
        if (password.length < 6) errs.password = 'Password must be at least 6 characters';
        if (password !== confirmPass) errs.confirmPass = 'Passwords do not match';
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSignup = async () => {
        if (!validate()) return;
        dispatch(clearError());
        dispatch(setLoading(true));
        try {
            const user = await signUpWithEmail(email.trim(), password, name.trim());
            dispatch(setUser({
                uid: user.uid,
                name: name.trim(),
                email: user.email,
            }));
        } catch (e) {
            console.error('[UI] Signup Error:', e);
            dispatch(setError(getAuthErrorMessage(e)));
        }
    };

    const Field = ({ label, value, onChangeText, placeholder, keyboardType, secureTextEntry, autoComplete, errorKey, right }) => (
        <>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputRow, fieldErrors[errorKey] && styles.inputError]}>
                <TextInput
                    style={styles.inputFlex}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textMuted}
                    value={value}
                    onChangeText={v => { onChangeText(v); setFieldErrors(p => ({ ...p, [errorKey]: null })); }}
                    keyboardType={keyboardType || 'default'}
                    secureTextEntry={secureTextEntry}
                    autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
                    autoComplete={autoComplete}
                />
                {right}
            </View>
            {fieldErrors[errorKey] ? <Text style={styles.fieldError}>{fieldErrors[errorKey]}</Text> : null}
        </>
    );

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryStart} />
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <LinearGradient colors={[COLORS.primaryStart, COLORS.primaryEnd]} style={styles.header}>
                    <Text style={styles.headerEmoji}>🎓</Text>
                    <Text style={styles.headerTitle}>Create Account</Text>
                    <Text style={styles.headerSubtitle}>Join 1 Lakh+ SSC GD aspirants</Text>
                </LinearGradient>

                <View style={styles.card}>
                    {error ? (
                        <View style={styles.errorBanner}>
                            <Text style={styles.errorBannerText}>⚠️ {error}</Text>
                        </View>
                    ) : null}

                    <Field label="Full Name" value={name} onChangeText={setName} placeholder="Your full name" errorKey="name" autoComplete="name" />
                    <View style={{ height: SPACING.md }} />
                    <Field label="Email Address" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" errorKey="email" autoComplete="email" />
                    <View style={{ height: SPACING.md }} />
                    <Field
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Min 6 characters"
                        secureTextEntry={!showPass}
                        errorKey="password"
                        autoComplete="new-password"
                        right={
                            <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
                                <Text style={styles.eyeText}>{showPass ? '🙈' : '👁️'}</Text>
                            </TouchableOpacity>
                        }
                    />
                    <View style={{ height: SPACING.md }} />
                    <Field label="Confirm Password" value={confirmPass} onChangeText={setConfirmPass} placeholder="Re-enter password" secureTextEntry errorKey="confirmPass" autoComplete="new-password" />

                    <TouchableOpacity
                        style={[styles.signupBtn, isLoading && styles.btnDisabled]}
                        onPress={handleSignup}
                        disabled={isLoading}
                        activeOpacity={0.85}>
                        <LinearGradient
                            colors={[COLORS.primaryStart, COLORS.primaryEnd]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.signupBtnGradient}>
                            {isLoading ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <Text style={styles.signupBtnText}>Create Account →</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.loginLink} onPress={() => navigation.goBack()}>
                        <Text style={styles.loginLinkText}>Already have an account? <Text style={styles.loginLinkBold}>Login</Text></Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scroll: { flex: 1, backgroundColor: COLORS.background },
    scrollContent: { flexGrow: 1 },
    header: { paddingTop: 50, paddingBottom: 40, paddingHorizontal: SPACING.lg, alignItems: 'center' },
    headerEmoji: { fontSize: 44, marginBottom: SPACING.sm },
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
    signupBtn: { marginTop: SPACING.xl, borderRadius: RADIUS.md, overflow: 'hidden', ...SHADOW.md },
    signupBtnGradient: { paddingVertical: SPACING.md, alignItems: 'center', justifyContent: 'center', minHeight: 52 },
    signupBtnText: { ...FONTS.button, color: COLORS.white, fontSize: 17 },
    btnDisabled: { opacity: 0.7 },
    loginLink: { marginTop: SPACING.lg, alignItems: 'center', paddingBottom: SPACING.lg },
    loginLinkText: { ...FONTS.body2, color: COLORS.textSecondary },
    loginLinkBold: { color: COLORS.primary, fontWeight: '700' },
});
