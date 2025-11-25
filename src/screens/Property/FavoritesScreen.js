import React, { useEffect, useState } from "react";
import { View, FlatList, Alert } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { getFavorites, toggleFavorite } from "../../utils/favorites";
import PropertyCard from "../../components/PropertyCard";
import api from "../../services/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function FavoritesScreen({ navigation }) {
    const paper = useTheme();
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

    if (!items.length)
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Text style={{ color: paper.colors.text }}>
                    No favorites yet
                </Text>
            </View>
        );

    return (
        <FlatList
            contentContainerStyle={{ paddingHorizontal: 12, paddingTop: (insets.top || 0) + 24, paddingBottom: (insets.bottom || 0) + 200 }}
            data={items}
            keyExtractor={(i) => i.id}
            ListHeaderComponent={() => (
                <View style={{ marginBottom: 12 }}>
                    <Text style={{ fontSize: 20, fontWeight: "700", color: paper.colors.text }}>
                        Favorites
                    </Text>
                </View>
            )}
            renderItem={({ item }) => (
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
            )}
        />
    );
}
