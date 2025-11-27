import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import theme from "../theme/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

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
    onDelete,
}) {
    const primaryUrl = property?.imageUrl;
    const first = property?.images?.[0];
    const urlCandidate =
        primaryUrl && typeof primaryUrl === "string"
            ? primaryUrl
            : first && typeof first === "string"
            ? first
            : null;
    const imageSource =
        urlCandidate && typeof urlCandidate === "string"
            ? { uri: urlCandidate }
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
                <MaterialIcons
                    name={isFav ? "favorite" : "favorite-border"}
                    size={20}
                    color={isFav ? theme.tokens.colors.error : "#9CA3AF"}
                />
            </TouchableOpacity>
            {onDelete && (
                <TouchableOpacity
                    onPress={onDelete}
                    style={styles.deleteWrap}
                    activeOpacity={0.85}
                >
                    <MaterialIcons
                        name="delete-outline"
                        size={18}
                        color={theme.tokens.colors.error}
                    />
                </TouchableOpacity>
            )}
            <LinearGradient
                colors={["#667EEA", "#764BA2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.priceBadge}
            >
                <Text style={styles.priceText}>ETB {property.price?.toLocaleString() || "1,200"}</Text>
            </LinearGradient>
            <View style={styles.body}>
                <Text style={styles.title} numberOfLines={1}>
                    {property.title || "Cozy Apartment"}
                </Text>
                <View style={styles.locRow}>
                    <MaterialIcons name="location-on" size={14} color="#64748B" />
                    <Text style={styles.loc} numberOfLines={1}>
                        {property.location || "Unknown"}
                    </Text>
                </View>
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
    deleteWrap: {
        position: "absolute",
        right: 12,
        top: 52,
        backgroundColor: "rgba(255,255,255,0.95)",
        padding: 6,
        borderRadius: 18,
    },
    priceBadge: {
        position: "absolute",
        left: 12,
        top: 160,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        shadowColor: "#667EEA",
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    priceText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 14,
    },
    body: { padding: theme.tokens.spacing.md, paddingTop: 12 },
    title: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1E293B",
    },
    locRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6,
    },
    loc: {
        color: "#64748B",
        marginLeft: 4,
        flex: 1,
    },
});
