import React, { useState, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, ActivityIndicator, StatusBar, KeyboardAvoidingView,
    Platform, Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { isValidEmail } from '../utils/helpers';
import { API_BASE_URL } from '../utils/constants';
import { COLORS, FONTS, SPACING, RADIUS, SHADOW } from '../utils/theme';

const STEPS = { EMAIL: 'email', OTP: 'otp', PASSWORD: 'password', DONE: 'done' };

export default function ForgotPasswordScreen({ navigation }) {
    const [step, setStep] = useState(STEPS.EMAIL);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const otpRefs = useRef([]);

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

    const sendOtp = async () => {
        if (!email.trim()) return setError('Please enter your email.');
        if (!isValidEmail(email)) return setError('Enter a valid email address.');
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = await res.json();
            if (!data.success) return setError(data.message);
            setStep(STEPS.OTP);
        } catch {
            setError('Network error. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const verifyAndReset = async () => {
        const otpStr = otp.join('');
        if (otpStr.length < 6) return setError('Enter the 6-digit OTP.');
        if (!newPassword) return setError('Enter a new password.');
        if (newPassword.length < 6) return setError('Password must be at least 6 characters.');
        if (newPassword !== confirmPassword) return setError('Passwords do not match.');
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), otp: otpStr, newPassword }),
            });
            const data = await res.json();
            if (!data.success) return setError(data.message);
            setStep(STEPS.DONE);
        } catch {
            setError('Network error. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const resendOtp = () => {
        setOtp(['', '', '', '', '', '']);
        setError('');
        sendOtp();
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryStart} />
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <LinearGradient colors={[COLORS.primaryStart, COLORS.primaryEnd]} style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Text style={styles.backText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerEmoji}>🔐</Text>
                    <Text style={styles.headerTitle}>Reset Password</Text>
                    <Text style={styles.headerSubtitle}>
                        {step === STEPS.EMAIL && 'Enter your registered email'}
                        {step === STEPS.OTP && 'Enter OTP & new password'}
                        {step === STEPS.DONE && 'Password changed!'}
                    </Text>
                </LinearGradient>

                <View style={styles.card}>
                    {/* Step indicators */}
                    {step !== STEPS.DONE && (
                        <View style={styles.steps}>
                            {[STEPS.EMAIL, STEPS.OTP].map((s, i) => (
                                <View key={s} style={styles.stepRow}>
                                    <View style={[styles.stepDot, (step === s || (step === STEPS.OTP && i === 0)) && styles.stepDotActive]}>
                                        <Text style={[styles.stepNum, (step === s || (step === STEPS.OTP && i === 0)) && styles.stepNumActive]}>
                                            {step === STEPS.OTP && i === 0 ? '✓' : i + 1}
                                        </Text>
                                    </View>
                                    {i === 0 && <View style={[styles.stepLine, step === STEPS.OTP && styles.stepLineActive]} />}
                                </View>
                            ))}
                        </View>
                    )}

                    {error ? (
                        <View style={styles.errorBanner}>
                            <Text style={styles.errorText}>⚠️ {error}</Text>
                        </View>
                    ) : null}

                    {/* ── Step 1: Email ── */}
                    {step === STEPS.EMAIL && (
                        <>
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="you@example.com"
                                placeholderTextColor={COLORS.textMuted}
                                value={email}
                                onChangeText={v => { setEmail(v); setError(''); }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoComplete="email"
                            />
                            <Text style={styles.hint}>We'll send a 6-digit OTP to this email.</Text>
                            <TouchableOpacity
                                style={[styles.btn, loading && styles.btnDisabled]}
                                onPress={sendOtp}
                                disabled={loading}
                                activeOpacity={0.85}>
                                <LinearGradient colors={[COLORS.primaryStart, COLORS.primaryEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btnGradient}>
                                    {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.btnText}>Send OTP →</Text>}
                                </LinearGradient>
                            </TouchableOpacity>
                        </>
                    )}

                    {/* ── Step 2: OTP + New Password ── */}
                    {step === STEPS.OTP && (
                        <>
                            <Text style={styles.sentTo}>OTP sent to <Text style={styles.emailHighlight}>{email}</Text></Text>

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

                            <Text style={[styles.label, { marginTop: SPACING.md }]}>New Password</Text>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={styles.inputFlex}
                                    placeholder="Min 6 characters"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={newPassword}
                                    onChangeText={v => { setNewPassword(v); setError(''); }}
                                    secureTextEntry={!showPass}
                                />
                                <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
                                    <Text style={styles.eyeText}>{showPass ? '🙈' : '👁️'}</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={[styles.label, { marginTop: SPACING.md }]}>Confirm Password</Text>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={styles.inputFlex}
                                    placeholder="Re-enter password"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={confirmPassword}
                                    onChangeText={v => { setConfirmPassword(v); setError(''); }}
                                    secureTextEntry={!showConfirmPass}
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPass(p => !p)} style={styles.eyeBtn}>
                                    <Text style={styles.eyeText}>{showConfirmPass ? '🙈' : '👁️'}</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[styles.btn, loading && styles.btnDisabled]}
                                onPress={verifyAndReset}
                                disabled={loading}
                                activeOpacity={0.85}>
                                <LinearGradient colors={[COLORS.primaryStart, COLORS.primaryEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btnGradient}>
                                    {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.btnText}>Reset Password →</Text>}
                                </LinearGradient>
                            </TouchableOpacity>
                        </>
                    )}

                    {/* ── Step 3: Done ── */}
                    {step === STEPS.DONE && (
                        <View style={styles.doneContainer}>
                            <Text style={styles.doneEmoji}>✅</Text>
                            <Text style={styles.doneTitle}>Password Reset!</Text>
                            <Text style={styles.doneMsg}>Your password has been changed successfully. Please login with your new password.</Text>
                            <TouchableOpacity
                                style={styles.btn}
                                onPress={() => navigation.navigate('Login')}
                                activeOpacity={0.85}>
                                <LinearGradient colors={[COLORS.primaryStart, COLORS.primaryEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btnGradient}>
                                    <Text style={styles.btnText}>Go to Login →</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scroll: { flex: 1, backgroundColor: COLORS.background },
    scrollContent: { flexGrow: 1 },
    header: {
        paddingTop: 50,
        paddingBottom: 40,
        paddingHorizontal: SPACING.lg,
        alignItems: 'center',
    },
    backBtn: { position: 'absolute', top: 50, left: SPACING.lg },
    backText: { ...FONTS.body1, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
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
    steps: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg },
    stepRow: { flexDirection: 'row', alignItems: 'center' },
    stepDot: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: COLORS.border,
        justifyContent: 'center', alignItems: 'center',
    },
    stepDotActive: { backgroundColor: COLORS.primary },
    stepNum: { ...FONTS.caption, fontWeight: '700', color: COLORS.textMuted },
    stepNumActive: { color: COLORS.white },
    stepLine: { width: 48, height: 2, backgroundColor: COLORS.border, marginHorizontal: 4 },
    stepLineActive: { backgroundColor: COLORS.primary },
    errorBanner: {
        backgroundColor: '#FFF0F0',
        borderRadius: RADIUS.sm,
        padding: SPACING.sm,
        marginBottom: SPACING.md,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.incorrect,
    },
    errorText: { ...FONTS.body2, color: COLORS.incorrect },
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
    hint: { ...FONTS.caption, color: COLORS.textMuted, marginTop: 6, marginBottom: 4 },
    inputRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: RADIUS.md,
        borderWidth: 1.5, borderColor: COLORS.border,
        paddingHorizontal: SPACING.md,
    },
    inputFlex: { flex: 1, paddingVertical: SPACING.md, ...FONTS.body1, color: COLORS.textPrimary },
    eyeBtn: { padding: SPACING.xs },
    eyeText: { fontSize: 18 },
    btn: { marginTop: SPACING.lg, borderRadius: RADIUS.md, overflow: 'hidden', ...SHADOW.md },
    btnGradient: { paddingVertical: SPACING.md, alignItems: 'center', justifyContent: 'center', minHeight: 52 },
    btnText: { ...FONTS.button, color: COLORS.white, fontSize: 17 },
    btnDisabled: { opacity: 0.7 },
    sentTo: { ...FONTS.body2, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.sm },
    emailHighlight: { color: COLORS.primary, fontWeight: '600' },
    otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: SPACING.sm },
    otpBox: {
        width: 46, height: 56,
        borderWidth: 2, borderColor: COLORS.border,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.background,
        ...FONTS.h2, color: COLORS.textPrimary,
        textAlign: 'center',
    },
    otpBoxFilled: { borderColor: COLORS.primary, backgroundColor: '#f0f0ff' },
    resendBtn: { alignSelf: 'center', marginTop: 4 },
    resendText: { ...FONTS.caption, color: COLORS.primary, fontWeight: '600' },
    doneContainer: { alignItems: 'center', paddingTop: SPACING.xl },
    doneEmoji: { fontSize: 64, marginBottom: SPACING.md },
    doneTitle: { ...FONTS.h2, color: COLORS.textPrimary, marginBottom: SPACING.sm },
    doneMsg: { ...FONTS.body1, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.lg },
});
