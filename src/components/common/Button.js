import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function Button({ children, onPress, style }) {
    return (
        <TouchableOpacity onPress={onPress} style={[styles.btn, style]}>
            <Text style={styles.text}>{children}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    btn: {
        padding: 12,
        backgroundColor: "#0066ff",
        borderRadius: 8,
        alignItems: "center",
    },
    text: { color: "white", fontWeight: "600" },
});
