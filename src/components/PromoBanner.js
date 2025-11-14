import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import theme from "../theme/theme";

export default function PromoBanner({
    text = "3 new homes added around you this week!",
    sub = "See the latest listings tailored for you",
    cta = "Explore",
    style,
}) {
    return (
        <TouchableOpacity activeOpacity={0.95} style={[styles.wrap, style]}>
            <LinearGradient
                colors={["#3B82F6", "#8B5CF6"]}
                style={styles.gradient}
            >
                <View style={styles.row}>
                    <Image
                        source={require("../../assets/lexury house 3.webp")}
                        style={styles.image}
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.title}>🏡 {text}</Text>
                        <Text style={styles.sub}>{sub}</Text>
                    </View>
                    <View>
                        <View style={styles.ctaBtn}>
                            <Text style={styles.ctaText}>{cta}</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    wrap: {
        paddingHorizontal: theme.tokens.spacing.md,
        marginTop: theme.tokens.spacing.md,
    },
    gradient: {
        borderRadius: theme.tokens.radius.lg,
        padding: theme.tokens.spacing.md,
    },
    row: { flexDirection: "row", alignItems: "center" },
    image: { width: 64, height: 48, borderRadius: 8, marginRight: 12 },
    title: {
        color: "#fff",
        fontFamily: theme.tokens.font.semi,
    },
    sub: { color: "rgba(255,255,255,0.9)", marginTop: 2, fontSize: 12 },
    ctaBtn: {
        backgroundColor: "#ffffff",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    ctaText: {
        color: theme.tokens.colors.primary,
        fontFamily: theme.tokens.font.semi,
        fontSize: 12,
    },
});
