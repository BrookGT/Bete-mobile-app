import React from "react";
import { TextInput, StyleSheet } from "react-native";

export default function Input(props) {
    return <TextInput style={[styles.input, props.style]} {...props} />;
}

const styles = StyleSheet.create({
    input: {
        padding: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
    },
});
