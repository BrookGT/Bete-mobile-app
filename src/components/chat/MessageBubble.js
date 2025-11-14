import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function MessageBubble({ message }) {
    const fromMe = !!message.fromMe;
    return (
        <View style={[styles.row, fromMe ? styles.rowRight : styles.rowLeft]}>
            <View
                style={[
                    styles.bubble,
                    fromMe ? styles.bubbleMe : styles.bubbleOther,
                ]}
            >
                <Text style={{ color: fromMe ? "white" : "#111" }}>
                    {message.text}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: { marginVertical: 6 },
    rowLeft: { alignItems: "flex-start" },
    rowRight: { alignItems: "flex-end" },
    bubble: { maxWidth: "85%", padding: 10, borderRadius: 10 },
    bubbleMe: { backgroundColor: "#0066ff" },
    bubbleOther: { backgroundColor: "#f0f0f0" },
});
