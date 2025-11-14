import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    ScrollView,
    View,
    TouchableOpacity,
    Text,
} from "react-native";
import { Card, Title, Paragraph } from "react-native-paper";
import MapView, { Marker } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";
import api from "../../services/api";
import { getFavorites, toggleFavorite } from "../../utils/favorites";
import theme from "../../theme/theme";
import GradientButton from "../../components/GradientButton";

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

    useEffect(() => {
        (async () => {
            try {
                if (id) {
                    const resp = await api.get(`/properties/${id}`);
                    setProperty(resp.data);
                }
            } catch (e) {
                console.warn("fetch property failed", e.message);
            }
            const favs = await getFavorites();
            setIsFav(favs.includes(id));
        })();
    }, [id]);

    const handleToggle = async () => {
        const favs = await toggleFavorite(id);
        setIsFav(favs.includes(id));
    };

    if (!property)
        return (
            <Card style={styles.container}>
                <Card.Content>
                    <Paragraph>Property not found</Paragraph>
                </Card.Content>
            </Card>
        );

    return (
        <ScrollView contentContainerStyle={{ padding: 12 }}>
            <Card>
                {property.imageUrl && property.imageUrl.startsWith("http") ? (
                    <Card.Cover source={{ uri: property.imageUrl }} />
                ) : (
                    <Card.Cover source={pickLocal(property)} />
                )}
                <Card.Content>
                    <Title>{property.title}</Title>
                    <Paragraph style={styles.price}>
                        ${property.price}
                    </Paragraph>
                    <Paragraph style={{ marginTop: 12 }}>
                        {property.description}
                    </Paragraph>
                </Card.Content>
                {property.lat && property.lng ? (
                    <View style={{ height: 220 }}>
                        <MapView
                            style={{ flex: 1 }}
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
                    </View>
                ) : null}
                <Card.Actions>
                    <GradientButton
                        title={isFav ? "Remove favorite" : "Add to favorites"}
                        onPress={handleToggle}
                    />
                </Card.Actions>
            </Card>

            <TouchableOpacity
                style={styles.contactWrap}
                onPress={async () => {
                    try {
                        if (!property?.ownerId) return;
                        const resp = await api.post("/chats", { otherUserId: property.ownerId });
                        const chat = resp.data;
                        navigation?.navigate?.("Chats", { screen: "Chat", params: { chatId: chat.id, title: `Chat ${chat.id}` } });
                    } catch (e) {
                        console.warn("start chat failed", e.message);
                    }
                }}
            >
                <LinearGradient
                    colors={[
                        theme.tokens.colors.primary,
                        theme.tokens.colors.accent,
                    ]}
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
    contactWrap: { position: "absolute", right: 20, bottom: 30 },
    contactBtn: {
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 28,
        elevation: 6,
    },
    contactText: { color: "#fff", fontWeight: "700" },
});
