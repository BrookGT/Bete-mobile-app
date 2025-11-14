import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import theme from "../theme/theme";
import { Heart } from "lucide-react-native";

// local assets (use nice house photos you added)
const localImages = [
    require("../../assets/lexury house.jpg"),
    require("../../assets/lexury house 2.jpg"),
    require("../../assets/lexury house 4.jpg"),
    require("../../assets/lexury house 3.webp"),
];

function pickLocal(property) {
    // deterministic pick: use id or title to pick an index
    const key = property?.id || property?.title || "0";
    let sum = 0;
    for (let i = 0; i < String(key).length; i++)
        sum += String(key).charCodeAt(i);
    return localImages[sum % localImages.length];
}

export default function PropertyCard({
    property,
    onPress,
    onToggleFav,
    isFav,
}) {
    const first = property?.images?.[0];
    const imageSource =
        first && typeof first === "string" && first.startsWith("http")
            ? { uri: first }
            : pickLocal(property);
    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            style={styles.card}
        >
            <Image source={imageSource} style={styles.image} />
            <View style={styles.imageOverlay} />
            <TouchableOpacity onPress={onToggleFav} style={styles.heartWrap}>
                <Heart
                    width={18}
                    height={18}
                    color={isFav ? theme.tokens.colors.error : "#9CA3AF"}
                />
            </TouchableOpacity>
            <View style={styles.priceBadge}>
                <Text style={styles.priceText}>${property.price || 1200}</Text>
            </View>
            <View style={styles.body}>
                <Text style={styles.title} numberOfLines={1}>
                    {property.title || "Cozy Apartment"}
                </Text>
                <Text style={styles.loc} numberOfLines={1}>
                    {property.location || "Unknown"}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.tokens.colors.surface,
        borderRadius: theme.tokens.radius.lg,
        overflow: "hidden",
        marginBottom: theme.tokens.spacing.md,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 4,
    },
    image: { width: "100%", height: 200 },
    imageOverlay: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: 200,
        backgroundColor: "rgba(0,0,0,0.12)",
    },
    heartWrap: {
        position: "absolute",
        right: 12,
        top: 12,
        backgroundColor: "rgba(255,255,255,0.95)",
        padding: 8,
        borderRadius: 20,
    },
    priceBadge: {
        position: "absolute",
        left: 12,
        top: 160,
        backgroundColor: "rgba(255,255,255,0.95)",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 18,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    priceText: {
        color: theme.tokens.colors.primary,
        fontFamily: theme.tokens.font.semi || theme.theme.font.semi,
        fontSize: 14,
    },
    body: { padding: theme.tokens.spacing.md, paddingTop: 12 },
    title: {
        fontSize: 16,
        fontFamily: theme.tokens.font.semi || theme.theme.font.semi,
        color: theme.tokens.colors.textPrimary,
    },
    loc: { color: theme.tokens.colors.textSecondary, marginTop: 4 },
});
