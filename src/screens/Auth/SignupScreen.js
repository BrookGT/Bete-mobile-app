import React, { useState, useContext } from "react";
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform, Image, TouchableOpacity, ScrollView } from "react-native";
import { AuthContext } from "../../context/AuthContext";
import GradientButton from "../../components/GradientButton";
import { MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";

export default function SignupScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const { signup } = useContext(AuthContext);

    const submit = async () => {
        try {
            await signup(email, password, name);
            // Auth state will redirect via RootNavigator
        } catch (e) {
            Alert.alert("Signup failed", e.response?.data?.error || e.message);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: "#F9FAFB" }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.heroWrap}>
                    <Image source={require("../../../assets/signup image.png")} style={styles.hero} resizeMode="contain" />
                </View>
                <View style={styles.card}>
                    <Text style={styles.title}>Find Your Home</Text>
                    <Text style={styles.sub}>Create an account to discover amazing rental properties.</Text>

                    <View style={styles.fieldWrap}>
                        <View style={styles.inputRow}>
                            <MaterialCommunityIcons name="account-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                placeholder="Your Name"
                                value={name}
                                onChangeText={setName}
                                style={styles.input}
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>

                    <View style={styles.fieldWrap}>
                        <View style={styles.inputRow}>
                            <MaterialCommunityIcons name="email-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                placeholder="Email"
                                value={email}
                                onChangeText={setEmail}
                                style={styles.input}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>

                    <View style={styles.fieldWrap}>
                        <View style={styles.inputRow}>
                            <MaterialCommunityIcons name="lock-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                style={styles.input}
                                secureTextEntry={!showPassword}
                                placeholderTextColor="#9CA3AF"
                            />
                            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                                <MaterialCommunityIcons
                                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <GradientButton
                        title="Create account"
                        onPress={submit}
                        colors={["#7C3AED", "#A78BFA"]}
                        style={{ alignSelf: "stretch", marginTop: 8 }}
                    />

                    <View style={styles.dividerRow}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>Or sign up with</Text>
                        <View style={styles.divider} />
                    </View>

                    <View style={styles.socialRow}>
                        <TouchableOpacity style={styles.socialBtn} activeOpacity={0.9}>
                            <Image
                                source={require("../../../assets/google icon.png")}
                                style={styles.socialIcon}
                                resizeMode="contain"
                            />
                            <Text style={styles.socialText}>Sign up with Google</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                            <Text style={styles.switchLink}>Sign in</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scroll: { flexGrow: 1, padding: 20, paddingBottom: 32, justifyContent: "center" },
    heroWrap: { alignItems: "center", marginBottom: 8 },
    hero: { width: 260, height: 180 },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 24,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 4,
    },
    title: { fontSize: 26, fontWeight: "800", textAlign: "center", color: "#0F172A" },
    sub: { color: "#6B7280", marginTop: 4, marginBottom: 20, textAlign: "center" },
    fieldWrap: { marginBottom: 12 },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    inputIcon: { marginRight: 8 },
    input: {
        flex: 1,
        paddingVertical: 2,
        color: "#111827",
    },
    eyeBtn: { paddingLeft: 8, paddingVertical: 4 },
    dividerRow: { flexDirection: "row", alignItems: "center", marginTop: 20, marginBottom: 12 },
    divider: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
    dividerText: { marginHorizontal: 8, fontSize: 12, color: "#9CA3AF" },
    socialRow: { marginTop: 4 },
    socialBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        paddingVertical: 10,
        paddingHorizontal: 14,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    socialIcon: { width: 22, height: 22, marginRight: 10 },
    socialText: { color: "#111827", fontSize: 14, fontWeight: "600" },
    switchRow: { flexDirection: "row", justifyContent: "center", marginTop: 18 },
    switchLabel: { color: "#6B7280", fontSize: 13 },
    switchLink: { color: "#2563EB", fontSize: 13, fontWeight: "600" },
});
