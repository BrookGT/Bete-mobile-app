import React, { useEffect, useState, useContext } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { Text, Chip, useTheme } from "react-native-paper";
import PropertyCard from "../../components/PropertyCard";
import SearchBar from "../../components/SearchBar";
import PromoBanner from "../../components/PromoBanner";
import GradientText from "../../components/GradientText";
import theme from "../../theme/theme";
import { MaterialIcons } from "@expo/vector-icons";
import api from "../../services/api";
import { getFavorites, toggleFavorite } from "../../utils/favorites";
// using plain View to avoid reanimated/moti runtime mismatch in Expo Go
import { View as RNView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function PropertyListScreen({ navigation, route }) {
    const paper = useTheme();
    const insets = useSafeAreaInsets();
    const { user } = useContext(AuthContext);
    const [properties, setProperties] = useState([]);
    const [query, setQuery] = useState("");
    const [favorites, setFavorites] = useState([]);
    const [filterType, setFilterType] = useState(null);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [locationFilter, setLocationFilter] = useState("");

    const mode = route?.params?.mode || "posts";
    const ownerIdParam =
        mode === "mine" && user?.id ? user.id : route?.params?.ownerId;

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

    useFocusEffect(
        useCallback(() => {
            (async () => {
                setFavorites(await getFavorites());
            })();
        }, [])
    );

    const filtered = properties
        .filter((p) => {
            if (ownerIdParam && p.ownerId !== ownerIdParam) return false;
            if (
                query &&
                !`${p.title} ${p.description}`
                    .toLowerCase()
                    .includes(query.toLowerCase())
            )
                return false;
            if (filterType === "rent" && p.price && p.price >= 50000) return false;
            if (filterType === "sale" && p.price && p.price < 50000) return false;
            if (minPrice && p.price && p.price < Number(minPrice)) return false;
            if (maxPrice && p.price && p.price > Number(maxPrice)) return false;
            if (
                locationFilter &&
                !p.location?.toLowerCase().includes(locationFilter.toLowerCase())
            )
                return false;
            return true;
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
        } catch (e) {
            Alert.alert("Favorites", "Could not update favorites");
        }
    };

    const demoHomes = [
        {
            id: "demo-1",
            title: "Modern Loft in Bole",
            price: 18000,
            location: "Bole, Addis Ababa",
            description: "Bright 2BR loft close to cafes and the airport.",
        },
        {
            id: "demo-2",
            title: "Family Villa with Garden",
            price: 4200000,
            location: "CMC, Addis Ababa",
            description: "Spacious 4BR villa with private garden and parking.",
        },
    ];

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: paper.colors.background },
            ]}
        >
            {/* Filters modal */}
            <Modal
                visible={filterModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setFilterModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Filters</Text>
                        <TextInput
                            placeholder="Min price"
                            keyboardType="numeric"
                            value={minPrice}
                            onChangeText={setMinPrice}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Max price"
                            keyboardType="numeric"
                            value={maxPrice}
                            onChangeText={setMaxPrice}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Location"
                            value={locationFilter}
                            onChangeText={setLocationFilter}
                            style={styles.input}
                        />
                        <View style={{ flexDirection: "row", marginTop: 12 }}>
                            <TouchableOpacity
                                style={[styles.modalBtn, { marginRight: 8 }]}
                                onPress={() => {
                                    setMinPrice("");
                                    setMaxPrice("");
                                    setLocationFilter("");
                                    setFilterType(null);
                                }}
                            >
                                <Text>Reset</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: "#111827" }]}
                                onPress={() => setFilterModalVisible(false)}
                            >
                                <Text style={{ color: "#fff" }}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <FlatList
                contentContainerStyle={{ padding: 12, paddingBottom: 220 }}
                data={filtered}
                keyExtractor={(i) => i.id}
                ListHeaderComponent={() => (
                    <>
                        <View style={styles.hero}>
                            {mode !== "posts" && (
                                <>
                                    <GradientText
                                        text="Find your next home with Bete"
                                        fontSize={24}
                                        fontFamily={theme.tokens.font.semi}
                                        style={{ marginBottom: 6 }}
                                    />
                                    <Text style={styles.heroSub}>
                                        Search, filter and discover properties handpicked for you
                                    </Text>
                                </>
                            )}
                            <SearchBar
                                value={query}
                                onChangeText={setQuery}
                                placeholder="Search city, neighborhood or address"
                                onFilterPress={() => setFilterModalVisible(true)}
                                onFocus={
                                    mode === "home"
                                        ? () => navigation.navigate("Posts")
                                        : undefined
                                }
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
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <TouchableOpacity
                                        style={styles.mapBtn}
                                        onPress={() => navigation.navigate("ExploreMap")}
                                        activeOpacity={0.9}
                                    >
                                        <MaterialIcons
                                            name="map"
                                            size={18}
                                            color="#0061FF"
                                            style={{ marginRight: 4 }}
                                        />
                                        <Text style={styles.mapBtnText}>Map</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.postBtn}
                                        onPress={() => navigation.navigate("PostProperty")}
                                        activeOpacity={0.9}
                                    >
                                        <Text style={styles.postBtnText}>+ Post</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        {mode !== "posts" && (
                            <>
                                <PromoBanner />
                                <View
                                    style={{
                                        paddingHorizontal: 4,
                                        marginTop: 8,
                                        marginBottom: 12,
                                    }}
                                >
                                    <Text style={{ fontWeight: "700", fontSize: 16 }}>
                                        Recommended for you
                                    </Text>
                                </View>
                                {demoHomes.map((item) => (
                                    <RNView key={item.id} style={{ marginBottom: 8 }}>
                                        <PropertyCard
                                            property={item}
                                            onPress={() =>
                                                navigation.navigate("PropertyDetail", {
                                                    id: item.id,
                                                    fromDemo: true,
                                                })
                                            }
                                            onToggleFav={() => {}}
                                            isFav={false}
                                        />
                                    </RNView>
                                ))}
                                <View style={{ height: 8 }} />
                            </>
                        )}
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
                            isFav={favorites.includes(Number(item.id))}
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
    mapBtn: {
        borderRadius: 22,
        borderWidth: 1,
        borderColor: "#DBEAFE",
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 8,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EFF6FF",
    },
    mapBtnText: { color: "#1D4ED8", fontWeight: "600" },
    postBtn: {
        backgroundColor: "#0061FF",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 22,
    },
    postBtnText: { color: "#fff", fontWeight: "700" },
});
