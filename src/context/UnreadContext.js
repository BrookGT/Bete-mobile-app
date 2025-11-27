import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "./AuthContext";
import chatsApi from "../services/chats";

export const UnreadContext = createContext({
    unreadCount: 0,
    unreadChats: [],
    markChatAsRead: () => {},
    refreshUnread: () => {},
});

const STORAGE_KEY = "readChatIds";

export function UnreadProvider({ children }) {
    const { user } = useContext(AuthContext);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadChats, setUnreadChats] = useState([]);
    const [readChatIds, setReadChatIds] = useState([]);

    // Load read chat IDs from storage
    useEffect(() => {
        (async () => {
            try {
                const stored = await AsyncStorage.getItem(STORAGE_KEY);
                if (stored) {
                    setReadChatIds(JSON.parse(stored));
                }
            } catch {}
        })();
    }, []);

    // Refresh unread chats from API
    const refreshUnread = useCallback(async () => {
        if (!user?.id) {
            setUnreadCount(0);
            setUnreadChats([]);
            return;
        }
        try {
            const chats = await chatsApi.listChats();
            // Filter chats that have messages and aren't marked as read
            const unread = (chats || []).filter(
                (c) => c.lastMessage && !readChatIds.includes(c.id)
            );
            setUnreadChats(unread.map((c) => c.id));
            setUnreadCount(unread.length);
        } catch {
            setUnreadCount(0);
            setUnreadChats([]);
        }
    }, [user?.id, readChatIds]);

    // Refresh on mount and when readChatIds change
    useEffect(() => {
        refreshUnread();
    }, [refreshUnread]);

    // Mark a chat as read
    const markChatAsRead = useCallback(async (chatId) => {
        const newReadIds = [...readChatIds, chatId].filter(
            (id, i, arr) => arr.indexOf(id) === i
        );
        setReadChatIds(newReadIds);
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newReadIds));
        } catch {}
        // Update unread list
        setUnreadChats((prev) => prev.filter((id) => id !== chatId));
        setUnreadCount((prev) => Math.max(0, prev - 1));
    }, [readChatIds]);

    return (
        <UnreadContext.Provider
            value={{
                unreadCount,
                unreadChats,
                markChatAsRead,
                refreshUnread,
            }}
        >
            {children}
        </UnreadContext.Provider>
    );
}
