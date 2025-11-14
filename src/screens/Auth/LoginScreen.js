import React, { useState, useContext } from "react";
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { AuthContext } from "../../context/AuthContext";
import GradientButton from "../../components/GradientButton";

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useContext(AuthContext);

    const submit = async () => {
        try {
            await login(email, password);
            // Auth state will redirect via RootNavigator
        } catch (e) {
            Alert.alert("Login failed", e.response?.data?.error || e.message);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={styles.container}>
                <Text style={styles.title}>Welcome back</Text>
                <Text style={styles.sub}>Sign in to continue</Text>
                <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                    secureTextEntry
                />
                <GradientButton title="Sign in" onPress={submit} style={{ alignSelf: "stretch" }} />
                <View style={{ height: 12 }} />
                <GradientButton
                    title="Create account"
                    onPress={() => navigation.navigate("Signup")}
                    colors={["#7C3AED", "#A78BFA"]}
                    style={{ alignSelf: "stretch" }}
                />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, alignItems: "center", justifyContent: "center" },
    title: { fontSize: 28, fontWeight: "800", marginBottom: 6 },
    sub: { color: "#6B7280", marginBottom: 16 },
    input: {
        width: "88%",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: "#fff",
    },
});
