import React, { useEffect, useState, useCallback } from "react";
import { View, FlatList, Alert, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { getFavorites, toggleFavorite } from "../../utils/favorites";
import PropertyCard from "../../components/PropertyCard";
import api from "../../services/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

export default function FavoritesScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [favorites, setFavorites] = useState([]);
    const [items, setItems] = useState([]);

    const loadFavorites = useCallback(async () => {
        try {
            const favs = await getFavorites();
            setFavorites(favs);
            const resp = await api.get("/properties");
            const all = resp.data || [];
            setItems(all.filter((p) => favs.includes(p.id)));
        } catch (e) {
            setItems([]);
        }
    }, []);

    useEffect(() => {
        loadFavorites();
    }, [loadFavorites]);

    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [loadFavorites])
    );

    const handleToggle = async (id) => {
        try {
            const updated = await toggleFavorite(id);
            setFavorites(updated);
            const numId = Number(id);
            const added = updated.includes(numId);
            Alert.alert(
                "Favorites",
                added ? "Item added to favorites" : "Item removed from favorites"
            );
            const resp = await api.get("/properties");
            const all = resp.data || [];
            setItems(all.filter((p) => updated.includes(p.id)));
        } catch (e) {
            Alert.alert("Favorites", "Could not update favorites");
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#F43F5E", "#FB7185"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
            >
                <View style={styles.headerRow}>
                    <MaterialIcons name="favorite" size={26} color="#FFFFFF" />
                    <Text style={styles.headerTitle}>Favorites</Text>
                </View>
                <Text style={styles.headerSub}>
                    {items.length} saved {items.length === 1 ? "property" : "properties"}
                </Text>
            </LinearGradient>

            <FlatList
                contentContainerStyle={styles.listContent}
                data={items}
                keyExtractor={(i) => String(i.id)}
                ListEmptyComponent={() => (
                    <View style={styles.emptyWrap}>
                        <MaterialIcons name="favorite-border" size={56} color="#FCA5A5" />
                        <Text style={styles.emptyTitle}>No favorites yet</Text>
                        <Text style={styles.emptySub}>
                            Tap the heart icon on properties you love to save them here
                        </Text>
                    </View>
                )}
                renderItem={({ item }) => (
                    <View style={styles.cardWrap}>
                        <PropertyCard
                            property={item}
                            onPress={() =>
                                navigation.navigate("Home", {
                                    screen: "PropertyDetail",
                                    params: { id: item.id },
                                })
                            }
                            onToggleFav={() => handleToggle(item.id)}
                            isFav={favorites.includes(Number(item.id))}
                        />
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    headerGradient: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#FFFFFF",
        marginLeft: 10,
    },
    headerSub: {
        fontSize: 14,
        color: "rgba(255,255,255,0.8)",
        marginTop: 4,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 120,
    },
    cardWrap: {
        marginBottom: 12,
    },
    emptyWrap: {
        alignItems: "center",
        paddingTop: 60,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#64748B",
        marginTop: 16,
    },
    emptySub: {
        fontSize: 14,
        color: "#94A3B8",
        marginTop: 8,
        textAlign: "center",
        lineHeight: 20,
    },
});
