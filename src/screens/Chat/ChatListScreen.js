import React, { useEffect, useState, useCallback, useContext } from "react";
import { View, FlatList, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import chatsApi from "../../services/chats";
import { UnreadContext } from "../../context/UnreadContext";

export default function ChatListScreen({ navigation }) {
    const paper = useTheme();
    const insets = useSafeAreaInsets();
    const [items, setItems] = useState([]);
    const { unreadChats, refreshUnread } = useContext(UnreadContext);

    const loadChats = async () => {
        try {
            const data = await chatsApi.listChats();
            setItems(data || []);
        } catch (e) {
            setItems([]);
        }
    };

    useEffect(() => {
        loadChats();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadChats();
            // refreshUnread uses the same API, no need to call twice
        }, [])
    );

    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((s) => s[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) {
            return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } else if (diffDays === 1) {
            return "Yesterday";
        } else if (diffDays < 7) {
            return d.toLocaleDateString([], { weekday: "short" });
        }
        return d.toLocaleDateString([], { month: "short", day: "numeric" });
    };

    return (
        <View style={[styles.container, { backgroundColor: "#F8FAFC" }]}>
            <LinearGradient
                colors={["#667EEA", "#764BA2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
            >
                <Text style={styles.headerTitle}>Messages</Text>
                <Text style={styles.headerSub}>Your conversations</Text>
            </LinearGradient>

            <FlatList
                data={items}
                keyExtractor={(item) => item.id?.toString?.() || String(item.id)}
                contentContainerStyle={{
                    paddingBottom: (insets.bottom || 0) + 100,
                    paddingHorizontal: 16,
                    paddingTop: 12,
                }}
                ListEmptyComponent={() => (
                    <View style={styles.emptyWrap}>
                        <MaterialIcons name="chat-bubble-outline" size={48} color="#CBD5E1" />
                        <Text style={styles.emptyText}>No conversations yet</Text>
                        <Text style={styles.emptySubtext}>
                            Start chatting by contacting a property owner
                        </Text>
                    </View>
                )}
                renderItem={({ item }) => {
                    const isUnread = unreadChats.includes(item.id);
                    return (
                        <TouchableOpacity
                            onPress={() =>
                                navigation.navigate("Chat", {
                                    chatId: item.id,
                                    otherUserName: item.otherUserName || "User",
                                    otherUserAvatar: item.otherUserAvatar || null,
                                    propertyTitle: item.propertyTitle || null,
                                    propertyImage: item.propertyImage || null,
                                })
                            }
                            style={[styles.chatCard, isUnread && styles.chatCardUnread]}
                            activeOpacity={0.85}
                        >
                            {item.otherUserAvatar ? (
                                <Image
                                    source={{ uri: item.otherUserAvatar }}
                                    style={styles.avatar}
                                />
                            ) : (
                                <LinearGradient
                                    colors={isUnread ? ["#EF4444", "#F87171"] : ["#667EEA", "#764BA2"]}
                                    style={styles.avatarGradient}
                                >
                                    <Text style={styles.avatarText}>
                                        {getInitials(item.otherUserName)}
                                    </Text>
                                </LinearGradient>
                            )}
                            <View style={styles.chatInfo}>
                                <View style={styles.chatRow}>
                                    <Text style={[styles.chatName, isUnread && styles.chatNameUnread]} numberOfLines={1}>
                                        {item.otherUserName || "User"}
                                    </Text>
                                    <Text style={[styles.chatTime, isUnread && styles.chatTimeUnread]}>
                                        {formatTime(item.lastMessageAt)}
                                    </Text>
                                </View>
                                {/* Show property info if available */}
                                {item.propertyTitle && (
                                    <View style={styles.propertyBadge}>
                                        <MaterialIcons name="home" size={12} color="#3B82F6" />
                                        <Text style={styles.propertyBadgeText} numberOfLines={1}>
                                            {item.propertyTitle}
                                        </Text>
                                    </View>
                                )}
                                <View style={styles.previewRow}>
                                    <Text style={[styles.chatPreview, isUnread && styles.chatPreviewUnread]} numberOfLines={1}>
                                        {item.lastMessage || "Start a conversation..."}
                                    </Text>
                                    {isUnread && (
                                        <View style={styles.unreadDot} />
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerGradient: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#FFFFFF",
    },
    headerSub: {
        fontSize: 14,
        color: "rgba(255,255,255,0.8)",
        marginTop: 4,
    },
    emptyWrap: {
        alignItems: "center",
        paddingTop: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#64748B",
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#94A3B8",
        marginTop: 4,
        textAlign: "center",
    },
    chatCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        padding: 14,
        borderRadius: 16,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
    },
    avatarGradient: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "700",
    },
    chatInfo: {
        flex: 1,
        marginLeft: 14,
    },
    chatRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    chatName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1E293B",
        flex: 1,
    },
    chatTime: {
        fontSize: 12,
        color: "#94A3B8",
        marginLeft: 8,
    },
    propertyBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EFF6FF",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        alignSelf: "flex-start",
        marginTop: 4,
    },
    propertyBadgeText: {
        fontSize: 11,
        color: "#3B82F6",
        fontWeight: "600",
        marginLeft: 4,
        maxWidth: 180,
    },
    chatPreview: {
        fontSize: 14,
        color: "#64748B",
        marginTop: 4,
        flex: 1,
    },
    previewRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    chatCardUnread: {
        backgroundColor: "#FEF2F2",
        borderLeftWidth: 3,
        borderLeftColor: "#EF4444",
    },
    chatNameUnread: {
        fontWeight: "700",
        color: "#0F172A",
    },
    chatTimeUnread: {
        color: "#EF4444",
        fontWeight: "600",
    },
    chatPreviewUnread: {
        color: "#374151",
        fontWeight: "500",
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#EF4444",
        marginLeft: 8,
    },
});
