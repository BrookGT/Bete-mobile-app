import React from "react";
import { View, FlatList, TouchableOpacity } from "react-native";
import { Avatar, Card, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "react-native";
import { useEffect, useState } from "react";
import chatsApi from "../../services/chats";

export default function ChatListScreen({ navigation }) {
    const paper = useTheme();
    const insets = useSafeAreaInsets();
    const [items, setItems] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const data = await chatsApi.listChats();
                setItems(data || []);
            } catch (e) {
                setItems([]);
            }
        })();
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: paper.colors.background }}>
            <FlatList
                data={items}
                keyExtractor={(item) => item.id?.toString?.() || String(item.id)}
                contentContainerStyle={{
                    paddingBottom: (insets.bottom || 0) + 180,
                    paddingHorizontal: 12,
                }}
                ListHeaderComponent={() => (
                    <View
                        style={{
                            paddingTop: (insets.top || 0) + 8,
                            paddingBottom: 8,
                            paddingHorizontal: 4,
                        }}
                    >
                        <Text
                            style={{
                                paddingVertical: 4,
                                fontSize: 22,
                                fontWeight: "700",
                                color: paper.colors.onBackground || paper.colors.text,
                            }}
                        >
                            Messages
                        </Text>
                        <Text style={{ paddingBottom: 4, color: paper.colors.backdrop || "#6B7280", marginTop: 4 }}>
                            Your recent conversations
                        </Text>
                    </View>
                )}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate("Chat", {
                                chatId: item.id,
                                title: item.title || `Chat ${item.id}`,
                            })
                        }
                        style={{ marginBottom: 10 }}
                    >
                        <Card>
                            <Card.Title
                                title={item.title || `Chat ${item.id}`}
                                subtitle={item.last || ""}
                                left={(props) => (
                                    <Avatar.Text
                                        {...props}
                                        label={(item.title || `Chat ${item.id}`)
                                            .split(" ")
                                            .map((s) => s[0])
                                            .join("")
                                            .slice(0, 2)}
                                    />
                                )}
                            />
                        </Card>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}
