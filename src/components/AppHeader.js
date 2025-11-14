import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import theme from "../theme/theme";

export default function AppHeader({ navigation, route, options }) {
    const insets = useSafeAreaInsets();
    const topPad = (insets.top || 0) + (theme.tokens.spacing.xs || 4);

    return (
        <View style={[styles.wrap, { paddingTop: topPad }]}
            accessibilityRole="header"
        >
            <LinearGradient
                colors={[theme.tokens.colors.surface, theme.tokens.colors.background]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.left}>
                    <Image
                        source={require("../../assets/logo.png")}
                        style={styles.logo}
                    />
                    <Text style={styles.brand}>Bete</Text>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity accessibilityLabel="Search" style={styles.actionBtn}>
                        <MaterialIcons name="search" size={22} color={theme.tokens.colors.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity accessibilityLabel="Notifications" style={styles.actionBtn}>
                        <MaterialIcons name="notifications-none" size={22} color={theme.tokens.colors.textPrimary} />
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        backgroundColor: theme.tokens.colors.background,
    },
    header: {
        paddingHorizontal: theme.tokens.spacing.md,
        paddingBottom: theme.tokens.spacing.sm,
        paddingTop: theme.tokens.spacing.sm,
        borderBottomLeftRadius: theme.tokens.radius.lg,
        borderBottomRightRadius: theme.tokens.radius.lg,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 10,
        elevation: 2,
    },
    left: { flexDirection: "row", alignItems: "center" },
    logo: { width: 28, height: 28, borderRadius: 8, marginRight: 10 },
    brand: {
        fontSize: 20,
        fontFamily: theme.tokens.font.semi || theme.theme.font.semi,
        color: theme.tokens.colors.textPrimary,
    },
    actions: { flexDirection: "row", alignItems: "center" },
    actionBtn: { marginLeft: 12 },
});
