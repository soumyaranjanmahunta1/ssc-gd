import React, { useState, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch } from 'react-redux';
import { signUpWithEmail, getAuthErrorMessage } from '../services/authService';
import { setUser, setError, clearError } from '../redux/slices/authSlice';
import { isValidEmail } from '../utils/helpers';
import { API_BASE_URL } from '../utils/constants';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/theme';

export default function SignupScreen({ navigation }) {
    const dispatch = useDispatch();

    const [step, setStep] = useState('form'); // 'form' | 'otp'
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError2] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const otpRefs = useRef([]);

    const validate = () => {
        const errs = {};
        if (!name.trim() || name.trim().length < 2) errs.name = 'Enter your full name (min 2 chars)';
        if (!isValidEmail(email)) errs.email = 'Enter a valid email address';
        if (password.length < 6) errs.password = 'Password must be at least 6 characters';
        if (password !== confirmPass) errs.confirmPass = 'Passwords do not match';
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSendOtp = async () => {
        if (!validate()) return;
        setError2('');
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/send-signup-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = await res.json();
            if (!data.success) return setError2(data.message);
            setStep('otp');
        } catch {
            setError2('Network error. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (val, idx) => {
        if (!/^\d*$/.test(val)) return;
        const next = [...otp];
        next[idx] = val.slice(-1);
        setOtp(next);
        if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    };

    const handleOtpKeyPress = (e, idx) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
            otpRefs.current[idx - 1]?.focus();
        }
    };

    const handleCreateAccount = async () => {
        const otpStr = otp.join('');
        if (otpStr.length < 6) return setError2('Enter the 6-digit OTP.');
        setError2('');
        setLoading(true);
        try {
            // Verify OTP
            const verifyRes = await fetch(`${API_BASE_URL}/auth/verify-signup-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), otp: otpStr }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyData.success) return setError2(verifyData.message);

            // Create Firebase account
            dispatch(clearError());
            const user = await signUpWithEmail(email.trim(), password, name.trim());
            dispatch(setUser({ uid: user.uid, name: name.trim(), email: user.email }));
        } catch (e) {
            const msg = getAuthErrorMessage(e);
            setError2(msg);
            dispatch(setError(msg));
        } finally {
            setLoading(false);
        }
    };

    const resendOtp = () => {
        setOtp(['', '', '', '', '', '']);
        setError2('');
        handleSendOtp();
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryStart} />
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <LinearGradient colors={[COLORS.primaryStart, COLORS.primaryEnd]} style={styles.header}>
                    <Text style={styles.headerEmoji}>{step === 'form' ? '🎓' : '📧'}</Text>
                    <Text style={styles.headerTitle}>{step === 'form' ? 'Create Account' : 'Verify Email'}</Text>
                    <Text style={styles.headerSubtitle}>
                        {step === 'form' ? 'Join 1 Lakh+ SSC GD aspirants' : `OTP sent to ${email}`}
                    </Text>
                </LinearGradient>

                <View style={styles.card}>
                    {/* Step indicator */}
                    <View style={styles.steps}>
                        {['Details', 'Verify'].map((label, i) => (
                            <View key={label} style={styles.stepRow}>
                                <View style={[styles.stepDot, (step === 'form' ? i === 0 : true) && i <= (step === 'otp' ? 1 : 0) && styles.stepDotActive]}>
                                    <Text style={[styles.stepNum, (step === 'otp' && i === 0) ? styles.stepNumActive : (step === 'form' && i === 0) ? styles.stepNumActive : i === 1 && step === 'otp' ? styles.stepNumActive : null]}>
                                        {step === 'otp' && i === 0 ? '✓' : i + 1}
                                    </Text>
                                </View>
                                <Text style={[styles.stepLabel, (step === 'form' && i === 0) || step === 'otp' ? styles.stepLabelActive : null]}>{label}</Text>
                                {i === 0 && <View style={[styles.stepLine, step === 'otp' && styles.stepLineActive]} />}
                            </View>
                        ))}
                    </View>

                    {error ? (
                        <View style={styles.errorBanner}>
                            <Text style={styles.errorBannerText}>⚠️ {error}</Text>
                        </View>
                    ) : null}

                    {/* ── Step 1: Form ── */}
                    {step === 'form' && (
                        <>
                            <Text style={styles.label}>Full Name</Text>
                            <View style={[styles.inputRow, fieldErrors.name && styles.inputError]}>
                                <TextInput
                                    style={styles.inputFlex}
                                    placeholder="Your full name"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={name}
                                    onChangeText={v => { setName(v); setFieldErrors(p => ({ ...p, name: null })); }}
                                    autoComplete="name"
                                    autoCapitalize="words"
                                />
                            </View>
                            {fieldErrors.name ? <Text style={styles.fieldError}>{fieldErrors.name}</Text> : null}

                            <Text style={[styles.label, { marginTop: SPACING.md }]}>Email Address</Text>
                            <View style={[styles.inputRow, fieldErrors.email && styles.inputError]}>
                                <TextInput
                                    style={styles.inputFlex}
                                    placeholder="you@example.com"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={email}
                                    onChangeText={v => { setEmail(v); setFieldErrors(p => ({ ...p, email: null })); }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                />
                            </View>
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
                                    autoComplete="new-password"
                                />
                                <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
                                    <Text style={styles.eyeText}>{showPass ? '🙈' : '👁️'}</Text>
                                </TouchableOpacity>
                            </View>
                            {fieldErrors.password ? <Text style={styles.fieldError}>{fieldErrors.password}</Text> : null}

                            <Text style={[styles.label, { marginTop: SPACING.md }]}>Confirm Password</Text>
                            <View style={[styles.inputRow, fieldErrors.confirmPass && styles.inputError]}>
                                <TextInput
                                    style={styles.inputFlex}
                                    placeholder="Re-enter password"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={confirmPass}
                                    onChangeText={v => { setConfirmPass(v); setFieldErrors(p => ({ ...p, confirmPass: null })); }}
                                    secureTextEntry
                                    autoComplete="new-password"
                                />
                            </View>
                            {fieldErrors.confirmPass ? <Text style={styles.fieldError}>{fieldErrors.confirmPass}</Text> : null}

                            <TouchableOpacity
                                style={[styles.signupBtn, loading && styles.btnDisabled]}
                                onPress={handleSendOtp}
                                disabled={loading}
                                activeOpacity={0.85}>
                                <LinearGradient colors={[COLORS.primaryStart, COLORS.primaryEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.signupBtnGradient}>
                                    {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.signupBtnText}>Send OTP →</Text>}
                                </LinearGradient>
                            </TouchableOpacity>
                        </>
                    )}

                    {/* ── Step 2: OTP ── */}
                    {step === 'otp' && (
                        <>
                            <Text style={styles.otpInfo}>
                                A 6-digit OTP was sent to{' '}
                                <Text style={styles.emailHighlight}>{email}</Text>
                            </Text>

                            <Text style={[styles.label, { marginTop: SPACING.md }]}>Enter OTP</Text>
                            <View style={styles.otpRow}>
                                {otp.map((digit, idx) => (
                                    <TextInput
                                        key={idx}
                                        ref={r => (otpRefs.current[idx] = r)}
                                        style={[styles.otpBox, digit && styles.otpBoxFilled]}
                                        value={digit}
                                        onChangeText={v => handleOtpChange(v, idx)}
                                        onKeyPress={e => handleOtpKeyPress(e, idx)}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        textAlign="center"
                                        selectTextOnFocus
                                    />
                                ))}
                            </View>

                            <TouchableOpacity onPress={resendOtp} style={styles.resendBtn}>
                                <Text style={styles.resendText}>Didn't receive? Resend OTP</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.signupBtn, loading && styles.btnDisabled]}
                                onPress={handleCreateAccount}
                                disabled={loading}
                                activeOpacity={0.85}>
                                <LinearGradient colors={[COLORS.primaryStart, COLORS.primaryEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.signupBtnGradient}>
                                    {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.signupBtnText}>Create Account →</Text>}
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.backBtn} onPress={() => { setStep('form'); setOtp(['', '', '', '', '', '']); setError2(''); }}>
                                <Text style={styles.backText}>← Edit Details</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    <TouchableOpacity style={styles.loginLink} onPress={() => navigation.goBack()}>
                        <Text style={styles.loginLinkText}>
                            Already have an account? <Text style={styles.loginLinkBold}>Login</Text>
                        </Text>
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
    headerSubtitle: { ...FONTS.body1, color: 'rgba(255,255,255,0.8)', marginTop: 4, textAlign: 'center' },
    card: {
        flex: 1, backgroundColor: COLORS.white,
        borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
        marginTop: -24, padding: SPACING.lg, ...SHADOW.sm,
    },
    steps: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg },
    stepRow: { flexDirection: 'row', alignItems: 'center' },
    stepDot: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: COLORS.border,
        justifyContent: 'center', alignItems: 'center',
    },
    stepDotActive: { backgroundColor: COLORS.primary },
    stepNum: { ...FONTS.caption, fontWeight: '700', color: COLORS.textMuted },
    stepNumActive: { color: COLORS.white },
    stepLabel: { ...FONTS.caption, color: COLORS.textMuted, marginLeft: 4 },
    stepLabelActive: { color: COLORS.primary, fontWeight: '600' },
    stepLine: { width: 40, height: 2, backgroundColor: COLORS.border, marginHorizontal: 8 },
    stepLineActive: { backgroundColor: COLORS.primary },
    errorBanner: {
        backgroundColor: '#FFF0F0', borderRadius: RADIUS.sm,
        padding: SPACING.sm, marginBottom: SPACING.md,
        borderLeftWidth: 4, borderLeftColor: COLORS.incorrect,
    },
    errorBannerText: { ...FONTS.body2, color: COLORS.incorrect },
    label: { ...FONTS.label, color: COLORS.textSecondary, marginBottom: SPACING.xs },
    inputRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.background, borderRadius: RADIUS.md,
        borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: SPACING.md,
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
    otpInfo: { ...FONTS.body2, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.sm },
    emailHighlight: { color: COLORS.primary, fontWeight: '600' },
    otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: SPACING.sm },
    otpBox: {
        width: 46, height: 56, borderWidth: 2, borderColor: COLORS.border,
        borderRadius: RADIUS.md, backgroundColor: COLORS.background,
        ...FONTS.h2, color: COLORS.textPrimary, textAlign: 'center',
    },
    otpBoxFilled: { borderColor: COLORS.primary, backgroundColor: '#f0f0ff' },
    resendBtn: { alignSelf: 'center', marginTop: 4 },
    resendText: { ...FONTS.caption, color: COLORS.primary, fontWeight: '600' },
    backBtn: { alignSelf: 'center', marginTop: SPACING.md },
    backText: { ...FONTS.body2, color: COLORS.textMuted, fontWeight: '600' },
    loginLink: { marginTop: SPACING.lg, alignItems: 'center', paddingBottom: SPACING.lg },
    loginLinkText: { ...FONTS.body2, color: COLORS.textSecondary },
    loginLinkBold: { color: COLORS.primary, fontWeight: '700' },
});
