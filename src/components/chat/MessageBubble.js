import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function MessageBubble({ message, otherUserAvatar, otherUserName }) {
    const fromMe = !!message.fromMe;

    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((s) => s[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    };

    return (
        <View style={[styles.row, fromMe ? styles.rowRight : styles.rowLeft]}>
            {!fromMe && (
                otherUserAvatar ? (
                    <Image source={{ uri: otherUserAvatar }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarFallback}>
                        <Text style={styles.avatarText}>{getInitials(otherUserName)}</Text>
                    </View>
                )
            )}
            {fromMe ? (
                <LinearGradient
                    colors={["#667EEA", "#764BA2"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.bubble, styles.bubbleMe]}
                >
                    <Text style={styles.textMe}>{message.text}</Text>
                    <Text style={styles.timeMe}>
                        {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                </LinearGradient>
            ) : (
                <View style={[styles.bubble, styles.bubbleOther]}>
                    <Text style={styles.textOther}>{message.text}</Text>
                    <Text style={styles.timeOther}>
                        {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "flex-end",
        marginVertical: 4,
    },
    rowLeft: {
        justifyContent: "flex-start",
    },
    rowRight: {
        justifyContent: "flex-end",
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    avatarFallback: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#E2E8F0",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },
    avatarText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#64748B",
    },
    bubble: {
        maxWidth: "75%",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
    },
    bubbleMe: {
        borderBottomRightRadius: 6,
    },
    bubbleOther: {
        backgroundColor: "#FFFFFF",
        borderBottomLeftRadius: 6,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    textMe: {
        color: "#FFFFFF",
        fontSize: 15,
        lineHeight: 20,
    },
    textOther: {
        color: "#1E293B",
        fontSize: 15,
        lineHeight: 20,
    },
    timeMe: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 10,
        marginTop: 4,
        alignSelf: "flex-end",
    },
    timeOther: {
        color: "#94A3B8",
        fontSize: 10,
        marginTop: 4,
        alignSelf: "flex-end",
    },
});
