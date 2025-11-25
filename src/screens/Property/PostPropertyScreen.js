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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadImages } from "../../services/upload";
import api from "../../services/api";
import GradientButton from "../../components/GradientButton";

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

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.title}>Post a property</Text>
            <TextInput
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
            />
            <TextInput
                placeholder="Price"
                value={price}
                onChangeText={setPrice}
                style={styles.input}
                keyboardType="numeric"
            />
            <TextInput
                placeholder="City"
                value={city}
                onChangeText={setCity}
                style={styles.input}
            />
            <TextInput
                placeholder="Address"
                value={address}
                onChangeText={setAddress}
                style={styles.input}
            />
            <TextInput
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                style={[styles.input, { height: 100 }]}
                multiline
            />

            <View style={{ marginVertical: 12 }}>
                <GradientButton title="Pick image" onPress={pickImage} />
            </View>

            <View style={{ marginVertical: 8 }}>
                <GradientButton
                    title={location ? "Change location" : "Pick location on map"}
                    onPress={() =>
                        navigation.navigate("MapPicker", {
                            initialLocation: location,
                        })
                    }
                />
                {location ? (
                    <Text style={{ marginTop: 8 }}>
                        Selected: {location.lat.toFixed(5)},{" "}
                        {location.lng.toFixed(5)}
                    </Text>
                ) : null}
            </View>

            <View style={styles.previewContainer}>
                {images.map((img, idx) => (
                    <View key={idx} style={styles.previewItem}>
                        <Image
                            source={{ uri: img.uri }}
                            style={styles.previewImage}
                        />
                        <GradientButton
                            title="Remove"
                            onPress={() => removeImage(idx)}
                            colors={["#FF6B6B", "#FF8E8E"]}
                            style={{ paddingVertical: 10, borderRadius: 8 }}
                        />
                    </View>
                ))}
            </View>

            {loading ? (
                <ActivityIndicator size="large" />
            ) : (
                <GradientButton title="Create property" onPress={submit} />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16, paddingBottom: 32 },
    title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
    },
    previewContainer: { flexDirection: "row", flexWrap: "wrap" },
    previewItem: { width: 120, marginRight: 8, marginBottom: 8 },
    previewImage: { width: 120, height: 90, borderRadius: 6, marginBottom: 4 },
});
