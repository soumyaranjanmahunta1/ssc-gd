import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector, useDispatch } from 'react-redux';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';
import { setUser } from '../redux/slices/authSlice';
import { setBookmarks } from '../redux/slices/bookmarkSlice';
import { getUserProfile } from '../services/authService';
import { wakeUpServer, fetchUserBookmarks } from '../services/questionService';
import { COLORS } from '../utils/theme';

// Auth Screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import MockTestConfigScreen from '../screens/MockTestConfigScreen';
import ChapterListScreen from '../screens/ChapterListScreen';
import TestScreen from '../screens/TestScreen';
import ResultScreen from '../screens/ResultScreen';
import TopicTestScreen from '../screens/TopicTestScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import PreviousYearScreen from '../screens/PreviousYearScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Bottom Tab Navigator ─────────────────────────────────────────────────────
function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textMuted,
                tabBarLabelStyle: styles.tabLabel,
            }}>
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <TabIcon emoji="🏠" color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <TabIcon emoji="📊" color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Bookmarks"
                component={BookmarksScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <TabIcon emoji="🔖" color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <TabIcon emoji="👤" color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

function TabIcon({ emoji, color }) {
    return (
        <View style={styles.tabIconContainer}>
            <Text style={[styles.tabEmoji, { opacity: color === COLORS.primary ? 1 : 0.5 }]}>
                {emoji}
            </Text>
        </View>
    );
}

// ─── Root Navigator ───────────────────────────────────────────────────────────
export default function AppNavigator() {
    const dispatch = useDispatch();
    const { isAuthenticated, isLoading } = useSelector(state => state.auth);

    // Warm up Render backend on first launch to avoid cold-start delay during tests
    useEffect(() => { wakeUpServer(); }, []);

    // ✅ Check Firebase auth state HERE — not inside SplashScreen
    // This ensures isLoading gets resolved even before NavigationContainer mounts
    useEffect(() => {
        const unsubscribe = auth().onAuthStateChanged(async user => {
            if (user) {
                // 1. First, set basic info from Auth
                const userData = {
                    uid: user.uid,
                    name: user.displayName || 'User',
                    email: user.email,
                };
                dispatch(setUser(userData));

                // 2. Then, fetch the full profile from Firestore to get the real 'name'
                try {
                    const [profile, bookmarks] = await Promise.all([
                        getUserProfile(user.uid),
                        fetchUserBookmarks(user.email),
                    ]);

                    if (profile && profile.name) {
                        dispatch(setUser({
                            ...userData,
                            name: profile.name,
                        }));
                    }

                    if (bookmarks) {
                        dispatch(setBookmarks(bookmarks));
                    }
                } catch (err) {
                    console.error('Error fetching user data:', err);
                }
            } else {
                dispatch(setUser(null));
                dispatch(setBookmarks([]));
            }
        });
        return unsubscribe;
    }, [dispatch]);

    if (isLoading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    // Auth Stack
                    <>
                        <Stack.Screen name="Splash" component={SplashScreen} />
                        <Stack.Screen
                            name="Login"
                            component={LoginScreen}
                            options={{ animationTypeForReplace: 'pop' }}
                        />
                        <Stack.Screen name="Signup" component={SignupScreen} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                    </>
                ) : (
                    // App Stack
                    <>
                        <Stack.Screen name="MainTabs" component={MainTabs} />
                        <Stack.Screen name="MockTestConfig" component={MockTestConfigScreen} />
                        <Stack.Screen name="ChapterList" component={ChapterListScreen} />
                        <Stack.Screen name="TopicTest" component={TopicTestScreen} />
                        <Stack.Screen
                            name="Test"
                            component={TestScreen}
                            options={{ gestureEnabled: false }}
                        />
                        <Stack.Screen name="Result" component={ResultScreen} />
                        <Stack.Screen name="PreviousYear" component={PreviousYearScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    tabBar: {
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        height: 62,
        paddingBottom: 8,
        paddingTop: 6,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: '500',
    },
    tabIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabEmoji: {
        fontSize: 20,
    },
});
