import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import theme from "../theme/theme";
import { UnreadContext } from "../context/UnreadContext";

export default function AppHeader({ navigation, route, options }) {
    const insets = useSafeAreaInsets();
    const topPad = (insets.top || 0) + 16;
    const { unreadCount } = useContext(UnreadContext);

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
                    <TouchableOpacity
                        accessibilityLabel="Notifications"
                        style={styles.actionBtn}
                        onPress={() => navigation.navigate("Chats")}
                    >
                        <View>
                            <MaterialIcons
                                name={unreadCount > 0 ? "notifications-active" : "notifications-none"}
                                size={24}
                                color={unreadCount > 0 ? "#667EEA" : theme.tokens.colors.textPrimary}
                            />
                            {unreadCount > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </Text>
                                </View>
                            )}
                        </View>
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
    badge: {
        position: "absolute",
        top: -4,
        right: -6,
        backgroundColor: "#EF4444",
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },
    badgeText: {
        color: "#FFFFFF",
        fontSize: 10,
        fontWeight: "700",
    },
});
