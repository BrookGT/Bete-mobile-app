import React, { useContext } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Image, ScrollView } from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import GradientButton from "../../components/GradientButton";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AccountScreen({ navigation }) {
    const { user, logout } = useContext(AuthContext);
    const insets = useSafeAreaInsets();

    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#8B5CF6", "#A78BFA"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
            >
                <View style={styles.avatarWrap}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate("EditAvatar")}
                    >
                        {user?.avatarUrl ? (
                            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarFallback}>
                                <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate("EditAvatar")}
                        style={styles.editBtn}
                    >
                        <MaterialIcons name="camera-alt" size={16} color="#8B5CF6" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.userName}>{user?.name || "Guest"}</Text>
                <Text style={styles.userEmail}>{user?.email || "Not signed in"}</Text>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                    onPress={() =>
                        navigation.navigate("Posts", {
                            screen: "PostProperty",
                        })
                    }
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
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    headerGradient: {
        alignItems: "center",
        paddingBottom: 28,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    avatarWrap: {
        position: "relative",
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: "rgba(255,255,255,0.5)",
    },
    avatarFallback: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(255,255,255,0.3)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 4,
        borderColor: "rgba(255,255,255,0.5)",
    },
    avatarText: {
        fontSize: 36,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    editBtn: {
        position: "absolute",
        right: 0,
        bottom: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    userName: {
        fontSize: 24,
        fontWeight: "700",
        color: "#FFFFFF",
        marginTop: 12,
    },
    userEmail: {
        fontSize: 14,
        color: "rgba(255,255,255,0.85)",
        marginTop: 4,
    },
    content: {
        flex: 1,
        padding: 16,
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
