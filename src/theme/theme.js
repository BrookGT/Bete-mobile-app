import { DefaultTheme as PaperDefault } from "react-native-paper";

const themeObj = {
    colors: {
        primary: "#0061FF",
        accent: "#FF8C42",
        background: "#F8FAFC",
        surface: "#FFFFFF",
        textPrimary: "#1F2937",
        textSecondary: "#6B7280",
        muted: "#E5E7EB",
        success: "#22C55E",
        error: "#EF4444",
    },
    radius: { sm: 8, md: 16, lg: 24 },
    spacing: { sm: 8, md: 16, lg: 24 },
    font: {
        regular: "Poppins_400Regular",
        semi: "Poppins_600SemiBold",
        bold: "Poppins_700Bold",
    },
};

export const paperTheme = {
    ...PaperDefault,
    roundness: 12,
    colors: {
        ...PaperDefault.colors,
        primary: themeObj.colors.primary,
        accent: themeObj.colors.accent,
        background: themeObj.colors.background,
        surface: themeObj.colors.surface,
        text: themeObj.colors.textPrimary,
    },
    fonts: {
        // legacy keys
        regular: { fontFamily: themeObj.font.regular },
        medium: { fontFamily: themeObj.font.semi },
        light: { fontFamily: themeObj.font.regular },
        thin: { fontFamily: themeObj.font.regular },
        // Material 3 / variant keys expected by newer react-native-paper
        displayLarge: { fontFamily: themeObj.font.bold, fontWeight: "700" },
        displayMedium: { fontFamily: themeObj.font.semi, fontWeight: "600" },
        displaySmall: { fontFamily: themeObj.font.semi, fontWeight: "600" },
        headlineLarge: { fontFamily: themeObj.font.semi, fontWeight: "600" },
        headlineMedium: { fontFamily: themeObj.font.semi, fontWeight: "600" },
        headlineSmall: { fontFamily: themeObj.font.semi, fontWeight: "600" },
        titleLarge: { fontFamily: themeObj.font.semi, fontWeight: "600" },
        titleMedium: { fontFamily: themeObj.font.semi, fontWeight: "600" },
        titleSmall: { fontFamily: themeObj.font.regular, fontWeight: "400" },
        bodyLarge: { fontFamily: themeObj.font.regular, fontWeight: "400" },
        bodyMedium: { fontFamily: themeObj.font.regular, fontWeight: "400" },
        bodySmall: { fontFamily: themeObj.font.regular, fontWeight: "400" },
        labelLarge: { fontFamily: themeObj.font.semi, fontWeight: "600" },
        labelMedium: { fontFamily: themeObj.font.semi, fontWeight: "600" },
        labelSmall: { fontFamily: themeObj.font.regular, fontWeight: "400" },
    },
};

// provide both `tokens` and `theme` keys for compatibility
const tokens = themeObj;

export default { tokens, theme: themeObj, paperTheme };
