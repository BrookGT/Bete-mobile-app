import React, { useState, useEffect, useRef, useContext } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Image,
} from "react-native";
import MessageBubble from "../../components/chat/MessageBubble";
import chatsApi from "../../services/chats";
import { createSocket } from "../../services/socket";
import { AuthContext } from "../../context/AuthContext";
import { UnreadContext } from "../../context/UnreadContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

export default function ChatScreen({ route, navigation }) {
    const { chatId, otherUserName, otherUserAvatar, propertyTitle, propertyImage } = route.params || {};
    const { user, token } = useContext(AuthContext);
    const { markChatAsRead } = useContext(UnreadContext);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const flatRef = useRef();
    const socketRef = useRef(null);
    const insets = useSafeAreaInsets();

    // Mark chat as read when opened
    useEffect(() => {
        if (chatId) {
            markChatAsRead(chatId);
        }
    }, [chatId, markChatAsRead]);

    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((s) => s[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    };

    useEffect(() => {
        (async () => {
            try {
                const data = await chatsApi.listMessages(chatId);
                const mapped = (data || []).map((m) => ({
                    id: m.id?.toString?.() || String(m.id),
                    text: m.content || "",
                    fromMe: user ? m.senderId === user.id : false,
                }));
                setMessages(mapped);
            } catch (e) {
                setMessages([]);
            }
        })();
    }, [chatId, user?.id]);

    useEffect(() => {
        if (!token) return;
        const s = createSocket(token);
        socketRef.current = s;
        s.on("connect", () => {
            s.emit("chat:join", { chatId });
        });
        s.on("message:new", (msg) => {
            if (msg.chatId !== Number(chatId)) return;
            setMessages((prev) => [
                ...prev,
                {
                    id: msg.id?.toString?.() || String(msg.id),
                    text: msg.content || "",
                    fromMe: user ? msg.senderId === user.id : false,
                },
            ]);
        });
        return () => {
            s.disconnect();
        };
    }, [chatId, token, user?.id]);

    const send = () => {
        if (!text.trim()) return;
        const payload = { chatId, content: text.trim() };
        socketRef.current?.emit("message:send", payload);
        setText("");
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
            >
                {/* Colorful Header */}
                <LinearGradient
                    colors={["#667EEA", "#764BA2"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
                >
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backBtn}
                        activeOpacity={0.8}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    {otherUserAvatar ? (
                        <Image
                            source={{ uri: otherUserAvatar }}
                            style={styles.headerAvatar}
                        />
                    ) : (
                        <View style={styles.headerAvatarFallback}>
                            <Text style={styles.headerAvatarText}>
                                {getInitials(otherUserName)}
                            </Text>
                        </View>
                    )}

                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.headerName} numberOfLines={1}>
                            {otherUserName || "User"}
                        </Text>
                        {propertyTitle ? (
                            <View style={styles.propertyRow}>
                                <MaterialIcons name="home" size={12} color="rgba(255,255,255,0.9)" />
                                <Text style={styles.propertyText} numberOfLines={1}>
                                    {propertyTitle}
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.onlineRow}>
                                <View style={styles.onlineDot} />
                                <Text style={styles.onlineText}>Active now</Text>
                            </View>
                        )}
                    </View>
                </LinearGradient>

                {/* Messages */}
                <FlatList
                    ref={flatRef}
                    data={messages}
                    keyExtractor={(i) => i.id}
                    renderItem={({ item }) => (
                        <MessageBubble
                            message={item}
                            otherUserAvatar={otherUserAvatar}
                            otherUserName={otherUserName}
                        />
                    )}
                    contentContainerStyle={styles.messageList}
                    onContentSizeChange={() =>
                        flatRef.current?.scrollToEnd({ animated: true })
                    }
                    ListEmptyComponent={() => (
                        <View style={styles.emptyChat}>
                            <MaterialIcons name="chat" size={48} color="#CBD5E1" />
                            <Text style={styles.emptyChatText}>No messages yet</Text>
                            <Text style={styles.emptyChatSub}>
                                Say hi to start the conversation!
                            </Text>
                        </View>
                    )}
                />

                {/* Input Area */}
                <View style={[styles.inputRow, { paddingBottom: insets.bottom + 8 }]}>
                    <View style={styles.inputWrap}>
                        <TextInput
                            value={text}
                            onChangeText={setText}
                            placeholder="Type a message..."
                            placeholderTextColor="#94A3B8"
                            style={styles.input}
                            multiline
                        />
                    </View>
                    <TouchableOpacity
                        onPress={send}
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={["#667EEA", "#764BA2"]}
                            style={styles.sendBtn}
                        >
                            <MaterialIcons name="send" size={20} color="#FFFFFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    headerGradient: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    backBtn: {
        padding: 4,
        marginRight: 8,
    },
    headerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.4)",
    },
    headerAvatarFallback: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.25)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.4)",
    },
    headerAvatarText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
    headerName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    onlineRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 2,
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#4ADE80",
        marginRight: 6,
    },
    onlineText: {
        fontSize: 12,
        color: "rgba(255,255,255,0.85)",
    },
    propertyRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 2,
    },
    propertyText: {
        fontSize: 12,
        color: "rgba(255,255,255,0.9)",
        marginLeft: 4,
        flex: 1,
    },
    messageList: {
        padding: 16,
        paddingBottom: 8,
        flexGrow: 1,
    },
    emptyChat: {
        alignItems: "center",
        paddingTop: 80,
    },
    emptyChatText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#64748B",
        marginTop: 16,
    },
    emptyChatSub: {
        fontSize: 14,
        color: "#94A3B8",
        marginTop: 4,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 12,
        paddingTop: 10,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderColor: "#E2E8F0",
    },
    inputWrap: {
        flex: 1,
        backgroundColor: "#F1F5F9",
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 4,
        marginRight: 10,
    },
    input: {
        fontSize: 15,
        color: "#1E293B",
        maxHeight: 100,
        paddingVertical: 8,
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#667EEA",
        shadowOpacity: 0.4,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },
});
