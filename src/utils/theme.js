// ─── Color Palette ────────────────────────────────────────────────────────────
export const COLORS = {
    // Primary gradient
    primaryStart: '#667eea',
    primaryEnd: '#764ba2',
    primary: '#667eea',
    primaryDark: '#4a5db8',

    // Accent
    accent: '#f5576c',
    accentLight: '#ff8a9a',

    // Status colors
    correct: '#2ED573',
    incorrect: '#FF4757',
    warning: '#FFA502',
    info: '#1E90FF',

    // Neutrals
    white: '#FFFFFF',
    black: '#000000',
    background: '#F8F9FF',
    surface: '#FFFFFF',
    border: '#E8ECF4',

    // Text
    textPrimary: '#1A1D3B',
    textSecondary: '#6E7191',
    textMuted: '#A0A3B1',

    // Dark mode
    darkBackground: '#0D1117',
    darkSurface: '#161B22',
    darkBorder: '#30363D',
    darkTextPrimary: '#F0F6FC',
    darkTextSecondary: '#8B949E',

    // Subjects
    gkStart: '#667eea',
    gkEnd: '#764ba2',
    mathStart: '#f093fb',
    mathEnd: '#f5576c',
    reasoningStart: '#4facfe',
    reasoningEnd: '#00f2fe',
    englishStart: '#43e97b',
    englishEnd: '#38f9d7',
};

// ─── Typography ───────────────────────────────────────────────────────────────
export const FONTS = {
    h1: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
    h2: { fontSize: 22, fontWeight: '700' },
    h3: { fontSize: 18, fontWeight: '600' },
    h4: { fontSize: 16, fontWeight: '600' },
    body1: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
    body2: { fontSize: 13, fontWeight: '400', lineHeight: 20 },
    caption: { fontSize: 12, fontWeight: '400' },
    button: { fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
    label: { fontSize: 12, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 1 },
};

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

// ─── Border Radius ────────────────────────────────────────────────────────────
export const RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
};

// ─── Shadows ─────────────────────────────────────────────────────────────────
export const SHADOW = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    md: {
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    lg: {
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 10,
    },
};
