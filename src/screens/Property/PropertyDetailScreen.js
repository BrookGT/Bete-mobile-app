import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    ScrollView,
    View,
    TouchableOpacity,
    Text,
    Image,
    Alert,
} from "react-native";
import { Card, Title, Paragraph } from "react-native-paper";
import MapView, { Marker } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import api from "../../services/api";
import { getFavorites, toggleFavorite } from "../../utils/favorites";
import theme from "../../theme/theme";
import GradientButton from "../../components/GradientButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// local images
const localImages = [
    require("../../../assets/lexury house.jpg"),
    require("../../../assets/lexury house 2.jpg"),
    require("../../../assets/lexury house 4.jpg"),
    require("../../../assets/lexury house 3.webp"),
];

function pickLocal(property) {
    const key = property?.id || property?.title || "0";
    let sum = 0;
    for (let i = 0; i < String(key).length; i++)
        sum += String(key).charCodeAt(i);
    return localImages[sum % localImages.length];
}

export default function PropertyDetailScreen({ route, navigation }) {
    const { id } = route.params || {};
    const [property, setProperty] = useState(null);
    const [isFav, setIsFav] = useState(false);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        (async () => {
            try {
                if (id != null) {
                    const resp = await api.get(`/properties/${id}`);
                    setProperty(resp.data);
                }
            } catch (e) {
                console.warn("fetch property failed", e.message);
            }
            const favs = await getFavorites();
            const numId = Number(id);
            setIsFav(favs.includes(numId));
        })();
    }, [id]);

    const handleToggle = async () => {
        try {
            const favs = await toggleFavorite(id);
            const numId = Number(id);
            const added = favs.includes(numId);
            setIsFav(added);
            Alert.alert(
                "Favorites",
                added
                    ? "Item added to favorites"
                    : "Item removed from favorites"
            );
        } catch (e) {
            Alert.alert("Favorites", "Could not update favorites");
        }
    };

    if (!property)
        return (
            <Card style={styles.container}>
                <Card.Content>
                    <Paragraph>Property not found</Paragraph>
                </Card.Content>
            </Card>
        );

    const images = [];
    if (property.imageUrl) images.push(property.imageUrl);
    if (Array.isArray(property.images)) {
        property.images.forEach((u) => {
            if (u && typeof u === "string" && !images.includes(u)) images.push(u);
        });
    }

    const hasImages = images.length > 0;
    const singleUri = hasImages ? images[0] : null;

    return (
        <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 32 }}>
            <Card>
                <View style={styles.galleryWrap}>
                    {hasImages && images.length === 1 ? (
                        <Image
                            source={
                                singleUri && typeof singleUri === "string"
                                    ? { uri: singleUri }
                                    : pickLocal(property)
                            }
                            style={styles.galleryImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                        >
                            {(hasImages ? images : [null]).map((uri, idx) => (
                                <View key={uri || idx} style={styles.galleryItem}>
                                    {uri && typeof uri === "string" ? (
                                        <Image
                                            source={{ uri }}
                                            style={styles.galleryImage}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <Image
                                            source={pickLocal(property)}
                                            style={styles.galleryImage}
                                            resizeMode="cover"
                                        />
                                    )}
                                </View>
                            ))}
                        </ScrollView>
                    )}
                    <TouchableOpacity
                        onPress={handleToggle}
                        style={styles.heartWrap}
                        activeOpacity={0.85}
                    >
                        <MaterialIcons
                            name={isFav ? "favorite" : "favorite-border"}
                            size={22}
                            color={isFav ? "#EF4444" : "#F97316"}
                        />
                    </TouchableOpacity>
                </View>
                <Card.Content>
                    <Title>{property.title}</Title>
                    <Paragraph style={styles.price}>${property.price}</Paragraph>
                    <Paragraph style={{ marginTop: 12 }}>
                        {property.description}
                    </Paragraph>
                </Card.Content>
                {property.lat && property.lng ? (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() =>
                            navigation.navigate("PropertyMapFull", {
                                lat: Number(property.lat),
                                lng: Number(property.lng),
                                title: property.title,
                            })
                        }
                        style={{ height: 160 }}
                    >
                        <MapView
                            style={{ flex: 1 }}
                            pointerEvents="none"
                            initialRegion={{
                                latitude: Number(property.lat),
                                longitude: Number(property.lng),
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                        >
                            <Marker
                                coordinate={{
                                    latitude: Number(property.lat),
                                    longitude: Number(property.lng),
                                }}
                            />
                        </MapView>
                    </TouchableOpacity>
                ) : null}
            </Card>

            <TouchableOpacity
                style={styles.contactWrap}
                onPress={async () => {
                    try {
                        if (!property?.ownerId) return;
                        const resp = await api.post("/chats", {
                            otherUserId: property.ownerId,
                        });
                        const chat = resp.data;
                        navigation?.navigate?.("Chats", {
                            screen: "Chat",
                            params: {
                                chatId: chat.id,
                                title: `Chat ${chat.id}`,
                            },
                        });
                    } catch (e) {
                        console.warn("start chat failed", e.message);
                    }
                }}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={["#00C6FF", "#5B9DF9", "#7C4DFF", "#C084FC"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.contactBtn}
                >
                    <Text style={styles.contactText}>Contact Owner</Text>
                </LinearGradient>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", justifyContent: "center" },
    title: { fontSize: 20, fontWeight: "700" },
    price: { color: "#0066ff", marginTop: 8 },
    galleryWrap: {
        width: "100%",
        height: 240,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        overflow: "hidden",
        position: "relative",
    },
    galleryItem: {
        width: "100%",
        height: "100%",
    },
    galleryImage: {
        width: "100%",
        height: "100%",
    },
    heartWrap: {
        position: "absolute",
        left: 16,
        top: 16,
        backgroundColor: "rgba(255,255,255,0.95)",
        padding: 8,
        borderRadius: 20,
        elevation: 4,
    },
    contactWrap: {
        marginTop: 20,
        alignSelf: "center",
    },
    contactBtn: {
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 28,
        elevation: 6,
    },
    contactText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
