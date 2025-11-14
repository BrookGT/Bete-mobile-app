import React, { useEffect, useState } from "react";
import { View, FlatList } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { getFavorites, toggleFavorite } from "../../utils/favorites";
import { getProperty } from "../../services/mockProperties";
import PropertyCard from "../../components/PropertyCard";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FavoritesScreen({ navigation }) {
    const paper = useTheme();
    const insets = useSafeAreaInsets();
    const [favorites, setFavorites] = useState([]);
    const [items, setItems] = useState([]);

    useEffect(() => {
        (async () => {
            const favs = await getFavorites();
            setFavorites(favs);
            setItems(favs.map((id) => getProperty(id)).filter(Boolean));
        })();
    }, []);

    const handleToggle = async (id) => {
        const updated = await toggleFavorite(id);
        setFavorites(updated);
        setItems(updated.map((i) => getProperty(i)).filter(Boolean));
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
            contentContainerStyle={{ padding: 12, paddingBottom: (insets.bottom || 0) + 200 }}
            data={items}
            keyExtractor={(i) => i.id}
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
                    isFav={true}
                />
            )}
        />
    );
}
