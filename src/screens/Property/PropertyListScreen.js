import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Chip, useTheme } from "react-native-paper";
import PropertyCard from "../../components/PropertyCard";
import SearchBar from "../../components/SearchBar";
import PromoBanner from "../../components/PromoBanner";
import GradientText from "../../components/GradientText";
import theme from "../../theme/theme";
import api from "../../services/api";
import { getFavorites, toggleFavorite } from "../../utils/favorites";
// using plain View to avoid reanimated/moti runtime mismatch in Expo Go
import { View as RNView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PropertyListScreen({ navigation }) {
    const paper = useTheme();
    const insets = useSafeAreaInsets();
    const [properties, setProperties] = useState([]);
    const [query, setQuery] = useState("");
    const [favorites, setFavorites] = useState([]);
    const [filterType, setFilterType] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/properties");
                setProperties(res.data || []);
            } catch (e) {
                setProperties([]);
            }
            setFavorites(await getFavorites());
        })();
    }, []);

    const filtered = properties.filter((p) =>
        p.title?.toLowerCase().includes(query.toLowerCase())
    );

    const handleToggle = async (id) => {
        const updated = await toggleFavorite(id);
        setFavorites(updated);
    };

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: paper.colors.background },
            ]}
        >
            <FlatList
                contentContainerStyle={{ padding: 12, paddingBottom: 220 }}
                data={filtered}
                keyExtractor={(i) => i.id}
                ListHeaderComponent={() => (
                    <>
                        <View style={styles.hero}>
                            <GradientText
                                text="Find your next home with Bete"
                                fontSize={24}
                                fontFamily={theme.tokens.font.semi}
                                style={{ marginBottom: 6 }}
                            />
                            <Text style={styles.heroSub}>
                                Search, filter and discover properties handpicked for you
                            </Text>
                            <SearchBar
                                value={query}
                                onChangeText={setQuery}
                                placeholder="Search city, neighborhood or address"
                            />
                            <View style={styles.filtersRow}>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <TouchableOpacity
                                        activeOpacity={0.85}
                                        onPress={() =>
                                            setFilterType(filterType === "rent" ? null : "rent")
                                        }
                                        style={[
                                            styles.chip,
                                            filterType === "rent"
                                                ? styles.chipActive
                                                : styles.chipInactive,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.chipText,
                                                filterType === "rent" && styles.chipTextActive,
                                            ]}
                                        >
                                            Rent
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        activeOpacity={0.85}
                                        onPress={() =>
                                            setFilterType(filterType === "sale" ? null : "sale")
                                        }
                                        style={[
                                            styles.chip,
                                            { marginLeft: 10 },
                                            filterType === "sale"
                                                ? styles.chipActive
                                                : styles.chipInactive,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.chipText,
                                                filterType === "sale" && styles.chipTextActive,
                                            ]}
                                        >
                                            Sale
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity
                                    style={styles.postBtn}
                                    onPress={() => navigation.navigate("PostProperty")}
                                    activeOpacity={0.9}
                                >
                                    <Text style={styles.postBtnText}>+ Post</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <PromoBanner />
                        <View style={{ paddingHorizontal: 4, marginTop: 8, marginBottom: 12 }}>
                            <Text style={{ fontWeight: "700", fontSize: 16 }}>
                                Recommended for you
                            </Text>
                        </View>
                        <View style={{ height: 8 }} />
                    </>
                )}
                renderItem={({ item, index }) => (
                    <RNView style={{ marginBottom: 8 }}>
                        <PropertyCard
                            property={item}
                            onPress={() =>
                                navigation.navigate("PropertyDetail", {
                                    id: item.id,
                                })
                            }
                            onToggleFav={() => handleToggle(item.id)}
                            isFav={favorites.includes(item.id)}
                        />
                    </RNView>
                )}
                showsVerticalScrollIndicator={true}
            />
            {/* Removed floating FAB in favor of inline Post button */}
        </View>
    );
}

const styles = StyleSheet.create({
    hero: {
        padding: 16,
        paddingTop: 20,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 6,
    },
    heroSub: { color: "#6B7280", marginBottom: 12 },
    filtersRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    chipActive: {
        backgroundColor: "#0061FF",
        borderColor: "#0061FF",
    },
    chipInactive: {
        backgroundColor: "transparent",
        borderColor: "#E5E7EB",
    },
    chipText: { color: "#111827", fontWeight: "600" },
    chipTextActive: { color: "#FFFFFF" },
    postBtn: {
        backgroundColor: "#0061FF",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 22,
    },
    postBtnText: { color: "#fff", fontWeight: "700" },
});
