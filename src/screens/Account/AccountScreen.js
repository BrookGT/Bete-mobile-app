import React, { useContext } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Avatar, Title, Paragraph, useTheme, IconButton } from "react-native-paper";
import { AuthContext } from "../../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import GradientButton from "../../components/GradientButton";
import * as ImagePicker from "expo-image-picker";
import { uploadImage } from "../../services/upload";
import api from "../../services/api";

export default function AccountScreen({ navigation }) {
    const { user, logout, refreshMe } = useContext(AuthContext);
    const paper = useTheme();

    return (
        <View style={{ flex: 1, backgroundColor: paper.colors.background }}>
            <View style={styles.header}>
                <View style={{ position: "relative" }}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate("EditAvatar")}
                    >
                        {user?.avatarUrl ? (
                            <Avatar.Image size={72} source={{ uri: user.avatarUrl }} />
                        ) : (
                            <Avatar.Text
                                size={72}
                                label={
                                    user?.name
                                        ? user.name
                                              .split(" ")
                                              .map((n) => n[0])
                                              .slice(0, 2)
                                              .join("")
                                        : "U"
                                }
                            />
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate("EditAvatar")}
                        style={styles.editBtn}
                    >
                        <LinearGradient colors={["#7C3AED", "#A78BFA"]} style={styles.editBtnInner}>
                            <IconButton icon="pencil" size={20} iconColor="#fff" style={{ margin: 0 }} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
                <Title style={{ marginTop: 8 }}>{user?.name || "Guest"}</Title>
                <Paragraph style={{ color: paper.colors.muted }}>
                    {user?.email || "Not signed in"}
                </Paragraph>
            </View>
            <View style={{ padding: 16 }}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate("RentManager")}
                    style={{ marginBottom: 12, borderRadius: 14, overflow: "hidden" }}
                >
                    <LinearGradient
                        colors={["#00C6FF", "#5B9DF9", "#7C4DFF", "#C084FC"]}
                        locations={[0, 0.35, 0.72, 1]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientBtn}
                    >
                        <LinearGradient
                            colors={["rgba(255,255,255,0.35)", "rgba(255,255,255,0.08)", "rgba(255,255,255,0)"]}
                            locations={[0, 0.6, 1]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={styles.gloss}
                        />
                        <Text style={styles.gradientBtnText}>Smart Rent Manager</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <GradientButton
                    title="Add Property"
                    onPress={() => navigation.navigate("PostProperty")}
                    style={{ marginBottom: 8 }}
                />
                <GradientButton
                    title="My Properties"
                    onPress={() =>
                        navigation.navigate("Posts", {
                            screen: "PostsList",
                            params: { mode: "mine" },
                        })
                    }
                    colors={["#6BA6FF", "#8E7CFF"]}
                    style={{ marginBottom: 8 }}
                />
                <GradientButton
                    title="Logout"
                    onPress={logout}
                    colors={["#FF6B6B", "#FF8E8E"]}
                    style={{ marginTop: 24 }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        padding: 24,
        alignItems: "center",
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    editBtn: {
        position: "absolute",
        right: -6,
        bottom: -6,
        width: 30,
        height: 30,
        borderRadius: 24,
        overflow: "hidden",
        elevation: 3,
    },
    editBtnInner: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 24,
    },
    gradientBtn: {
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.25)",
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    gloss: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "58%",
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
    },
    gradientBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});
