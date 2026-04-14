import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, FONTS, SPACING } from '../utils/theme';

export default function SplashScreen({ navigation }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.7)).current;

    useEffect(() => {
        // Animate logo — auth is already resolved by AppNavigator
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 60,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        // After animation, go to Login (user is unauthenticated at this point)
        const timer = setTimeout(() => navigation.replace('Login'), 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <LinearGradient
            colors={[COLORS.primaryStart, COLORS.primaryEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryStart} />
            <Animated.View
                style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                <View style={styles.logoCircle}>
                    <Text style={styles.logoEmoji}>📚</Text>
                </View>
                <Text style={styles.appName}>SSC GD</Text>
                <Text style={styles.appSubtitle}>Mock Test 2026</Text>
            </Animated.View>
            <Animated.Text style={[styles.tagline, { opacity: fadeAnim }]}>
                Free Practice • Score Higher
            </Animated.Text>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    logoCircle: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    logoEmoji: {
        fontSize: 52,
    },
    appName: {
        ...FONTS.h1,
        color: COLORS.white,
        fontSize: 36,
        fontWeight: '800',
        letterSpacing: 2,
    },
    appSubtitle: {
        ...FONTS.h3,
        color: 'rgba(255,255,255,0.85)',
        marginTop: 4,
    },
    tagline: {
        ...FONTS.body2,
        color: 'rgba(255,255,255,0.65)',
        position: 'absolute',
        bottom: 60,
        letterSpacing: 0.5,
    },
});
