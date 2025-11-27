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
import { LinearGradient } from "expo-linear-gradient";

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

    const initialMode = route?.params?.mode || "posts";
    const [showMine, setShowMine] = useState(initialMode === "mine");
    const mode = initialMode === "mine" ? "posts" : initialMode;

    // If we are already on the Posts screen and Account navigates here with
    // params.mode === "mine", turn on the toggle so the UI matches the intent.
    useEffect(() => {
        if (route?.params?.mode === "mine") {
            setShowMine(true);
        }
    }, [route?.params?.mode]);

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

            // If navigated here with mode === 'mine' (from Account), keep the
            // "My properties only" toggle in sync every time the screen focuses.
            if (route?.params?.mode === "mine") {
                setShowMine(true);
            }
        }, [route?.params?.mode])
    );

    const filtered = properties
        .filter((p) => {
            if (showMine && user?.id && p.ownerId !== user.id) return false;
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

    const handleDelete = (id) => {
        Alert.alert(
            "Delete property",
            "Are you sure you want to delete this property? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await api.delete(`/properties/${id}`);
                            setProperties((prev) => prev.filter((p) => p.id !== id));
                        } catch (e) {
                            Alert.alert("Error", "Could not delete property");
                        }
                    },
                },
            ]
        );
    };

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: paper.colors.background },
            ]}
        >
            {/* Decorative gradient shape at top - only for Posts screen */}
            {mode === "posts" && (
                <LinearGradient
                    colors={["#10B981", "#34D399"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.topGradient}
                />
            )}

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

                            {mode === "posts" && user?.id && (
                                <View style={{ marginTop: 10, marginBottom: 4 }}>
                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        onPress={() => setShowMine((prev) => !prev)}
                                        style={[
                                            styles.myToggle,
                                            showMine
                                                ? styles.myToggleActive
                                                : styles.myToggleInactive,
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.myToggleThumb,
                                                showMine
                                                    ? styles.myToggleThumbOn
                                                    : styles.myToggleThumbOff,
                                            ]}
                                        />
                                        <Text
                                            style={[
                                                styles.myToggleLabel,
                                                showMine && styles.myToggleLabelActive,
                                            ]}
                                        >
                                            My properties only
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}

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
                        {mode === "home" && (
                            <View style={{ marginBottom: 12 }}>
                                <PromoBanner />
                            </View>
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
                            onDelete={
                                user && item.ownerId === user.id
                                    ? () => handleDelete(item.id)
                                    : undefined
                            }
                        />
                    </RNView>
                )}
                ListEmptyComponent={
                    mode === "posts" && showMine
                        ? () => (
                              <View style={{ padding: 32, alignItems: "center" }}>
                                  <Text style={{ fontSize: 16, fontWeight: "600" }}>
                                      You havent posted anything yet.
                                  </Text>
                                  <Text style={{ marginTop: 4, color: "#6B7280" }}>
                                      Tap "+ Post" to create your first property.
                                  </Text>
                              </View>
                          )
                        : undefined
                }
                showsVerticalScrollIndicator={true}
            />
            {/* Removed floating FAB in favor of inline Post button */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    topGradient: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 120,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
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
    myToggle: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: "#F9FAFB",
    },
    myToggleActive: {
        borderColor: "#2563EB",
        backgroundColor: "#EFF6FF",
    },
    myToggleInactive: {},
    myToggleThumb: {
        width: 18,
        height: 18,
        borderRadius: 9,
        marginRight: 8,
        backgroundColor: "#D1D5DB",
    },
    myToggleThumbOn: {
        backgroundColor: "#2563EB",
    },
    myToggleThumbOff: {
        backgroundColor: "#D1D5DB",
    },
    myToggleLabel: {
        fontSize: 13,
        color: "#4B5563",
        fontWeight: "500",
    },
    myToggleLabelActive: {
        color: "#1D4ED8",
    },
});
