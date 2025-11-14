import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const t = await AsyncStorage.getItem("bete:token");
            if (t) {
                setToken(t);
                try {
                    const resp = await api.get("/users/me");
                    setUser(resp.data);
                } catch (e) {
                    console.warn("Failed to fetch /me", e.message);
                }
            }
            setLoading(false);
        })();
    }, []);

    const signup = async (email, password, name) => {
        const resp = await api.post("/auth/register", { name, email, password });
        await AsyncStorage.setItem("bete:token", resp.data.token);
        setToken(resp.data.token);
        // fetch fresh user profile to stay consistent with /users/me shape
        const me = await api.get("/users/me");
        setUser(me.data);
        return resp.data;
    };

    const login = async (email, password) => {
        const resp = await api.post("/auth/login", { email, password });
        await AsyncStorage.setItem("bete:token", resp.data.token);
        setToken(resp.data.token);
        const me = await api.get("/users/me");
        setUser(me.data);
        return resp.data;
    };

    const refreshMe = async () => {
        try {
            const me = await api.get("/users/me");
            setUser(me.data);
            return me.data;
        } catch (e) {
            return null;
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem("bete:token");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, signup, login, logout, refreshMe }}>
            {children}
        </AuthContext.Provider>
    );
}
