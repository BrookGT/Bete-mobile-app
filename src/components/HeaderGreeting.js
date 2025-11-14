import React from "react";
import { View, Text, Image, StyleSheet, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import theme from "../theme/theme";
import GradientText from "./GradientText";

export default function HeaderGreeting({ name = "Guest" }) {
    const insets = useSafeAreaInsets();
    const outerStyle = [
        styles.outer,
        { paddingTop: (theme.tokens.spacing.sm || 8) + (insets.top || 0) },
    ];
    return (
        <View style={outerStyle}>
            <LinearGradient
                colors={["#3B82F6", "#8B5CF6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.container}
            >
                <Animated.View style={styles.inner}>
                    <View style={styles.textBlock}>
                        <Text style={styles.greeting}>Hi {name} 👋</Text>
                        <GradientText
                            text="Find your next home with Bete"
                            fontSize={24}
                            fontFamily={theme.tokens.font.semi}
                            style={{ marginTop: 2 }}
                        />
                    </View>
                    <Image
                        source={require("../../assets/icon.png")}
                        style={styles.avatar}
                    />
                </Animated.View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    outer: {
        paddingHorizontal: theme.tokens.spacing.md,
        paddingTop: theme.tokens.spacing.sm,
    },
    container: {
        borderRadius: theme.tokens.radius.lg,
        padding: theme.tokens.spacing.md,
        overflow: "hidden",
    },
    inner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    textBlock: { flex: 1, marginRight: 12 },
    greeting: {
        fontSize: 22,
        fontFamily: theme.tokens.font.semi,
        color: "#fff",
    },
    sub: { marginTop: 4, color: "rgba(255,255,255,0.9)" },
    avatar: {
        width: 54,
        height: 54,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.18)",
        backgroundColor: "rgba(255,255,255,0.12)",
    },
});
