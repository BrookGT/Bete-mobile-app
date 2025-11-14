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
} from "react-native";
import MessageBubble from "../../components/chat/MessageBubble";
import chatsApi from "../../services/chats";
import { createSocket } from "../../services/socket";
import { AuthContext } from "../../context/AuthContext";

export default function ChatScreen({ route }) {
    const { chatId, title } = route.params || {};
    const { user, token } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const flatRef = useRef();
    const socketRef = useRef(null);

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
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={90}
        >
            <View style={styles.container}>
                <Text style={styles.header}>{title || "Chat"}</Text>
                <FlatList
                    ref={flatRef}
                    data={messages}
                    keyExtractor={(i) => i.id}
                    renderItem={({ item }) => <MessageBubble message={item} />}
                    contentContainerStyle={{ padding: 12 }}
                />

                <View style={styles.inputRow}>
                    <TextInput
                        value={text}
                        onChangeText={setText}
                        placeholder="Write a message..."
                        style={styles.input}
                    />
                    <TouchableOpacity onPress={send} style={styles.sendBtn}>
                        <Text style={{ color: "white" }}>Send</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        padding: 12,
        fontSize: 18,
        fontWeight: "600",
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    inputRow: {
        flexDirection: "row",
        padding: 8,
        borderTopWidth: 1,
        borderColor: "#eee",
        alignItems: "center",
    },
    input: {
        flex: 1,
        padding: 10,
        backgroundColor: "#f7f7f7",
        borderRadius: 8,
    },
    sendBtn: {
        marginLeft: 8,
        paddingVertical: 10,
        paddingHorizontal: 14,
        backgroundColor: "#0066ff",
        borderRadius: 8,
    },
});
