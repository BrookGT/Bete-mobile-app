import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Image,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadImages } from "../../services/upload";
import api from "../../services/api";
import GradientButton from "../../components/GradientButton";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PostPropertyScreen({ navigation, route }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [city, setCity] = useState("");
    const [address, setAddress] = useState("");
    const [images, setImages] = useState([]); // array of { uri }
    const [loading, setLoading] = useState(false);
    const picked = route.params?.pickedLocation;
    const [location, setLocation] = useState(null);

    useEffect(() => {
        if (picked) setLocation(picked);
    }, [picked]);

    useEffect(() => {
        (async () => {
            const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Permission required",
                    "We need permission to access your photos to upload images."
                );
            }
        })();
    }, []);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setImages((prev) => [...prev, { uri: asset.uri }]);
            }
        } catch (e) {
            console.warn("image pick error", e.message);
            Alert.alert("Image error", "Could not pick the image.");
        }
    };

    const removeImage = (idx) => {
        setImages((prev) => prev.filter((_, i) => i !== idx));
    };

    const submit = async () => {
        if (!title || !price)
            return Alert.alert("Missing", "Please provide title and price");

        if (!location) {
            return Alert.alert(
                "Location required",
                "Please pick and confirm a location on the map before creating the property."
            );
        }
        setLoading(true);
        try {
            // upload images first (take the first URL for backend's imageUrl)
            const uris = images.map((i) => i.uri);
            const urls = await uploadImages(uris);
            const imageUrl = urls?.[0] || null;

            const locText = [city, address].filter(Boolean).join(", ");

            const body = {
                title,
                description,
                price: Number(price),
                imageUrl,
                location: locText,
                lat: location?.lat ?? undefined,
                lng: location?.lng ?? undefined,
            };
            const resp = await api.post("/properties", body);
            setLoading(false);
            Alert.alert(
                "Property created",
                "Your property was created successfully"
            );
            navigation.navigate("PropertyDetail", {
                id: resp.data.id,
            });
        } catch (e) {
            console.error("create property error", e.response || e.message);
            setLoading(false);
            Alert.alert(
                "Error",
                e.response?.data?.error ||
                    e.message ||
                    "Failed to create property"
            );
        }
    };

    const insets = useSafeAreaInsets();

    return (
        <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
            {/* Decorative gradient shape */}
            <LinearGradient
                colors={["#10B981", "#34D399"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.topGradient}
            />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 32 }]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Post a Property</Text>
                        <Text style={styles.subtitle}>Fill in the details to list your property</Text>
                    </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>
                    
                    <View style={styles.inputWrap}>
                        <MaterialIcons name="title" size={20} color="#9CA3AF" style={styles.inputIcon} />
                        <TextInput
                            placeholder="Property Title"
                            value={title}
                            onChangeText={setTitle}
                            style={styles.input}
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View style={styles.inputWrap}>
                        <MaterialIcons name="attach-money" size={20} color="#9CA3AF" style={styles.inputIcon} />
                        <TextInput
                            placeholder="Price (ETB)"
                            value={price}
                            onChangeText={setPrice}
                            style={styles.input}
                            keyboardType="numeric"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View style={styles.inputWrap}>
                        <MaterialIcons name="location-city" size={20} color="#9CA3AF" style={styles.inputIcon} />
                        <TextInput
                            placeholder="City"
                            value={city}
                            onChangeText={setCity}
                            style={styles.input}
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View style={styles.inputWrap}>
                        <MaterialIcons name="home" size={20} color="#9CA3AF" style={styles.inputIcon} />
                        <TextInput
                            placeholder="Street Address"
                            value={address}
                            onChangeText={setAddress}
                            style={styles.input}
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View style={[styles.inputWrap, { alignItems: "flex-start", paddingVertical: 12 }]}>
                        <MaterialIcons name="description" size={20} color="#9CA3AF" style={[styles.inputIcon, { marginTop: 2 }]} />
                        <TextInput
                            placeholder="Description"
                            value={description}
                            onChangeText={setDescription}
                            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                            multiline
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Location</Text>
                    <TouchableOpacity
                        style={styles.locationBtn}
                        onPress={() =>
                            navigation.navigate("MapPicker", {
                                initialLocation: location,
                            })
                        }
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={location ? ["#10B981", "#34D399"] : ["#3B82F6", "#60A5FA"]}
                            style={styles.locationGradient}
                        >
                            <MaterialIcons
                                name={location ? "check-circle" : "add-location"}
                                size={22}
                                color="#FFFFFF"
                            />
                            <Text style={styles.locationBtnText}>
                                {location ? "Location Selected" : "Pick Location on Map"}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    {location && (
                        <Text style={styles.locationCoords}>
                            📍 {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                        </Text>
                    )}
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Photos</Text>
                    <TouchableOpacity
                        style={styles.addPhotoBtn}
                        onPress={pickImage}
                        activeOpacity={0.85}
                    >
                        <MaterialIcons name="add-photo-alternate" size={32} color="#6366F1" />
                        <Text style={styles.addPhotoText}>Add Photos</Text>
                    </TouchableOpacity>

                    {images.length > 0 && (
                        <View style={styles.previewContainer}>
                            {images.map((img, idx) => (
                                <View key={idx} style={styles.previewItem}>
                                    <Image
                                        source={{ uri: img.uri }}
                                        style={styles.previewImage}
                                    />
                                    <TouchableOpacity
                                        style={styles.removeBtn}
                                        onPress={() => removeImage(idx)}
                                    >
                                        <MaterialIcons name="close" size={16} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                <View style={{ marginTop: 8 }}>
                    {loading ? (
                        <View style={styles.loadingWrap}>
                            <ActivityIndicator size="large" color="#6366F1" />
                            <Text style={styles.loadingText}>Creating property...</Text>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={submit} activeOpacity={0.9}>
                            <LinearGradient
                                colors={["#6366F1", "#8B5CF6"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.submitBtn}
                            >
                                <MaterialIcons name="publish" size={22} color="#FFFFFF" />
                                <Text style={styles.submitBtnText}>Post Property</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    topGradient: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 160,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    header: {
        marginBottom: 16,
    },
    title: {
        fontSize: 26,
        fontWeight: "800",
        color: "#1E293B",
    },
    subtitle: {
        fontSize: 14,
        color: "#64748B",
        marginTop: 4,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#374151",
        marginBottom: 12,
    },
    inputWrap: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 10,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 15,
        color: "#1F2937",
    },
    locationBtn: {
        borderRadius: 12,
        overflow: "hidden",
    },
    locationGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 12,
    },
    locationBtnText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
        marginLeft: 8,
    },
    locationCoords: {
        fontSize: 13,
        color: "#64748B",
        marginTop: 10,
        textAlign: "center",
    },
    addPhotoBtn: {
        borderWidth: 2,
        borderColor: "#E0E7FF",
        borderStyle: "dashed",
        borderRadius: 12,
        paddingVertical: 24,
        alignItems: "center",
        backgroundColor: "#F5F3FF",
    },
    addPhotoText: {
        color: "#6366F1",
        fontSize: 14,
        fontWeight: "600",
        marginTop: 8,
    },
    previewContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 12,
    },
    previewItem: {
        position: "relative",
        marginRight: 8,
        marginBottom: 8,
    },
    previewImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
    },
    removeBtn: {
        position: "absolute",
        top: -6,
        right: -6,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#EF4444",
        alignItems: "center",
        justifyContent: "center",
    },
    loadingWrap: {
        alignItems: "center",
        paddingVertical: 20,
    },
    loadingText: {
        marginTop: 8,
        color: "#6366F1",
        fontSize: 14,
    },
    submitBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderRadius: 14,
        shadowColor: "#6366F1",
        shadowOpacity: 0.4,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },
    submitBtnText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "700",
        marginLeft: 8,
    },
});
