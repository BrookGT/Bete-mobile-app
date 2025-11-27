import React, { useEffect, useState, useContext, useRef } from "react";
import {
    StyleSheet,
    ScrollView,
    View,
    TouchableOpacity,
    Text,
    Image,
    Alert,
    Dimensions,
    FlatList,
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
import { AuthContext } from "../../context/AuthContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const insets = useSafeAreaInsets();
    const { user } = useContext(AuthContext);
    const flatListRef = useRef(null);
    
    // These refs must be declared before any early returns to follow Rules of Hooks
    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setActiveImageIndex(viewableItems[0].index || 0);
        }
    }).current;
    const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

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

    const handleDelete = () => {
        if (!property) return;
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
                            await api.delete(`/properties/${property.id}`);
                            // Go back to the previous screen (usually the list)
                            navigation.goBack();
                        } catch (e) {
                            Alert.alert("Error", "Could not delete property");
                        }
                    },
                },
            ]
        );
    };

    if (!property)
        return (
            <Card style={styles.container}>
                <Card.Content>
                    <Paragraph>Property not found</Paragraph>
                </Card.Content>
            </Card>
        );

    // Build images array
    const images = [];
    if (property.imageUrl) images.push(property.imageUrl);
    if (Array.isArray(property.images)) {
        property.images.forEach((u) => {
            if (u && typeof u === "string" && !images.includes(u)) images.push(u);
        });
    }
    // If no images, use local fallback
    if (images.length === 0) images.push(null);

    const renderImageItem = ({ item, index }) => (
        <View style={styles.imageSlide}>
            <Image
                source={item ? { uri: item } : pickLocal(property)}
                style={styles.slideImage}
                resizeMode="cover"
            />
        </View>
    );

    // Parse location from description or use placeholder
    const locationText = property.location || property.address || "Location not specified";
    const cityText = property.city || "City";

    return (
        <View style={styles.screenContainer}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Image Carousel */}
                <View style={styles.carouselContainer}>
                    <FlatList
                        ref={flatListRef}
                        data={images}
                        renderItem={renderImageItem}
                        keyExtractor={(item, index) => `img-${index}`}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                        bounces={false}
                    />
                    
                    {/* Favorite Button */}
                    <TouchableOpacity
                        onPress={handleToggle}
                        style={styles.heartBtn}
                        activeOpacity={0.85}
                    >
                        <MaterialIcons
                            name={isFav ? "favorite" : "favorite-border"}
                            size={24}
                            color={isFav ? "#EF4444" : "#FFFFFF"}
                        />
                    </TouchableOpacity>

                    {/* Back Button */}
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backBtn}
                        activeOpacity={0.85}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* Image Counter */}
                    {images.length > 1 && (
                        <View style={styles.imageCounter}>
                            <Text style={styles.imageCounterText}>
                                {activeImageIndex + 1} / {images.length}
                            </Text>
                        </View>
                    )}

                </View>

                {/* Image Thumbnails */}
                {images.length > 1 && (
                    <View style={styles.thumbnailContainer}>
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.thumbnailScroll}
                        >
                            {images.map((uri, index) => (
                                <TouchableOpacity
                                    key={index}
                                    activeOpacity={0.8}
                                    onPress={() => {
                                        setActiveImageIndex(index);
                                        flatListRef.current?.scrollToIndex({ index, animated: true });
                                    }}
                                    style={[
                                        styles.thumbnail,
                                        index === activeImageIndex && styles.thumbnailActive,
                                    ]}
                                >
                                    <Image
                                        source={uri ? { uri } : pickLocal(property)}
                                        style={styles.thumbnailImage}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Content Card */}
                <View style={styles.contentCard}>
                    {/* Price Badge */}
                    <LinearGradient
                        colors={["#10B981", "#34D399"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.priceBadge}
                    >
                        <Text style={styles.priceText}>${property.price?.toLocaleString()}</Text>
                        <Text style={styles.priceLabel}>/month</Text>
                    </LinearGradient>

                    {/* Title */}
                    <Text style={styles.propertyTitle}>{property.title}</Text>

                    {/* Quick Info Row */}
                    <View style={styles.quickInfoRow}>
                        <View style={styles.quickInfoItem}>
                            <MaterialIcons name="king-bed" size={20} color="#6B7280" />
                            <Text style={styles.quickInfoText}>{property.bedrooms || 2} Beds</Text>
                        </View>
                        <View style={styles.quickInfoItem}>
                            <MaterialIcons name="bathtub" size={20} color="#6B7280" />
                            <Text style={styles.quickInfoText}>{property.bathrooms || 1} Bath</Text>
                        </View>
                        <View style={styles.quickInfoItem}>
                            <MaterialIcons name="square-foot" size={20} color="#6B7280" />
                            <Text style={styles.quickInfoText}>{property.area || "N/A"} sqft</Text>
                        </View>
                    </View>

                    {/* Description Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.descriptionText}>
                            {property.description || "No description provided."}
                        </Text>
                    </View>

                    {/* Location Section with Map */}
                    {property.lat && property.lng && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Location</Text>
                            <View style={styles.locationRow}>
                                {/* Address Info */}
                                <View style={styles.addressInfo}>
                                    <View style={styles.addressItem}>
                                        <MaterialIcons name="location-city" size={22} color="#3B82F6" />
                                        <View style={styles.addressTextWrap}>
                                            <Text style={styles.addressLabel}>City</Text>
                                            <Text style={styles.addressValue}>{cityText}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.addressItem}>
                                        <MaterialIcons name="place" size={22} color="#EF4444" />
                                        <View style={styles.addressTextWrap}>
                                            <Text style={styles.addressLabel}>Address</Text>
                                            <Text style={styles.addressValue} numberOfLines={2}>
                                                {locationText}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.viewMapBtn}
                                        activeOpacity={0.8}
                                        onPress={() =>
                                            navigation.navigate("PropertyMapFull", {
                                                lat: Number(property.lat),
                                                lng: Number(property.lng),
                                                title: property.title,
                                            })
                                        }
                                    >
                                        <MaterialIcons name="fullscreen" size={18} color="#3B82F6" />
                                        <Text style={styles.viewMapText}>View Full Map</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Mini Map */}
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={() =>
                                        navigation.navigate("PropertyMapFull", {
                                            lat: Number(property.lat),
                                            lng: Number(property.lng),
                                            title: property.title,
                                        })
                                    }
                                    style={styles.miniMapWrap}
                                >
                                    <MapView
                                        style={styles.miniMap}
                                        scrollEnabled={false}
                                        zoomEnabled={false}
                                        rotateEnabled={false}
                                        pitchEnabled={false}
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
                                    <View style={styles.mapOverlay}>
                                        <MaterialIcons name="touch-app" size={20} color="#FFFFFF" />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Action Buttons - Inside scroll content */}
                    <View style={styles.actionsContainer}>
                        {/* Contact Owner - only show if NOT the owner */}
                        {(!user || property.ownerId !== user.id) && (
                            <TouchableOpacity
                                style={styles.contactWrap}
                                onPress={async () => {
                                    try {
                                        if (!property?.ownerId) return;
                                        const resp = await api.post("/chats", {
                                            otherUserId: property.ownerId,
                                            propertyId: property.id, // Link chat to this property
                                        });
                                        const chat = resp.data;
                                        let ownerName = "Property Owner";
                                        let ownerAvatar = null;
                                        try {
                                            const ownerResp = await api.get(`/users/${property.ownerId}`);
                                            ownerName = ownerResp.data?.name || "Property Owner";
                                            ownerAvatar = ownerResp.data?.avatarUrl || null;
                                        } catch {}
                                        navigation?.navigate?.("Chats", {
                                            screen: "Chat",
                                            params: {
                                                chatId: chat.id,
                                                otherUserName: ownerName,
                                                otherUserAvatar: ownerAvatar,
                                                propertyTitle: property.title,
                                                propertyImage: property.imageUrl,
                                            },
                                        });
                                    } catch (e) {
                                        console.warn("start chat failed", e.message);
                                        Alert.alert("Error", "Could not start chat. Please try again.");
                                    }
                                }}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={["#667EEA", "#764BA2"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.contactBtn}
                                >
                                    <MaterialIcons name="chat" size={20} color="#FFFFFF" />
                                    <Text style={styles.contactText}>Contact Owner</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                        {/* Delete - only show if IS the owner */}
                        {user && property.ownerId === user.id && (
                            <TouchableOpacity
                                style={styles.deleteBtnFull}
                                onPress={handleDelete}
                                activeOpacity={0.9}
                            >
                                <MaterialIcons name="delete-outline" size={22} color="#EF4444" />
                                <Text style={styles.deleteText}>Delete Property</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", justifyContent: "center" },
    screenContainer: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    scrollContent: {
        paddingBottom: 40,
    },
    // Image Carousel
    carouselContainer: {
        width: SCREEN_WIDTH,
        height: 300,
        position: "relative",
    },
    imageSlide: {
        width: SCREEN_WIDTH,
        height: 300,
    },
    slideImage: {
        width: "100%",
        height: "100%",
    },
    backBtn: {
        position: "absolute",
        top: 50,
        left: 16,
        backgroundColor: "rgba(0,0,0,0.4)",
        padding: 10,
        borderRadius: 25,
    },
    heartBtn: {
        position: "absolute",
        top: 50,
        right: 16,
        backgroundColor: "rgba(0,0,0,0.4)",
        padding: 10,
        borderRadius: 25,
    },
    imageCounter: {
        position: "absolute",
        top: 50,
        alignSelf: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    imageCounterText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "600",
    },
    // Image Thumbnails
    thumbnailContainer: {
        backgroundColor: "#FFFFFF",
        paddingVertical: 12,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: -20,
    },
    thumbnailScroll: {
        paddingHorizontal: 16,
        gap: 10,
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 10,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "transparent",
    },
    thumbnailActive: {
        borderColor: "#3B82F6",
    },
    thumbnailImage: {
        width: "100%",
        height: "100%",
    },
    // Content Card
    contentCard: {
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
    },
    priceBadge: {
        flexDirection: "row",
        alignItems: "baseline",
        alignSelf: "flex-start",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        marginBottom: 16,
    },
    priceText: {
        fontSize: 24,
        fontWeight: "800",
        color: "#FFFFFF",
    },
    priceLabel: {
        fontSize: 14,
        color: "rgba(255,255,255,0.8)",
        marginLeft: 4,
    },
    propertyTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 16,
    },
    quickInfoRow: {
        flexDirection: "row",
        backgroundColor: "#F1F5F9",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    quickInfoItem: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    quickInfoText: {
        fontSize: 13,
        color: "#4B5563",
        marginLeft: 6,
        fontWeight: "500",
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 14,
        color: "#64748B",
        lineHeight: 22,
    },
    // Location Section
    locationRow: {
        flexDirection: "row",
        backgroundColor: "#F8FAFC",
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    addressInfo: {
        flex: 1,
        paddingRight: 12,
    },
    addressItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    addressTextWrap: {
        marginLeft: 10,
        flex: 1,
    },
    addressLabel: {
        fontSize: 11,
        color: "#94A3B8",
        fontWeight: "500",
        textTransform: "uppercase",
    },
    addressValue: {
        fontSize: 14,
        color: "#334155",
        fontWeight: "600",
        marginTop: 2,
    },
    viewMapBtn: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    viewMapText: {
        fontSize: 13,
        color: "#3B82F6",
        fontWeight: "600",
        marginLeft: 4,
    },
    miniMapWrap: {
        width: 130,
        height: 130,
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
    },
    miniMap: {
        width: "100%",
        height: "100%",
    },
    mapOverlay: {
        position: "absolute",
        bottom: 8,
        right: 8,
        backgroundColor: "rgba(0,0,0,0.5)",
        padding: 6,
        borderRadius: 8,
    },
    // Action Buttons
    actionsContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 24,
        marginBottom: 20,
        gap: 12,
    },
    contactWrap: {
        flex: 1,
    },
    contactBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 28,
        gap: 8,
    },
    contactText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 16,
    },
    deleteBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 28,
        backgroundColor: "#FEF2F2",
        borderWidth: 1,
        borderColor: "#FECACA",
        gap: 6,
    },
    deleteBtnFull: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 28,
        backgroundColor: "#FEF2F2",
        borderWidth: 1,
        borderColor: "#FECACA",
        gap: 8,
    },
    deleteText: {
        color: "#EF4444",
        fontWeight: "600",
        fontSize: 15,
    },
});
