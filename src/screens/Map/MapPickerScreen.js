import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import GradientButton from "../../components/GradientButton";

export default function MapPickerScreen({ navigation, route }) {
    const initial = route.params?.initialLocation;

    // Fallback region (centered roughly on Addis Ababa) so the map
    // never stays on an infinite loading state even if GPS fails.
    const defaultRegion = {
        latitude: 9.0084,
        longitude: 38.7636,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    const [region, setRegion] = useState(
        initial
            ? {
                  latitude: initial.lat,
                  longitude: initial.lng,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
              }
            : null
    );
    const [marker, setMarker] = useState(
        initial ? { latitude: initial.lat, longitude: initial.lng } : null
    );
    const [fetchingLocation, setFetchingLocation] = useState(false);

    useEffect(() => {
        (async () => {
            if (!initial) {
                await useCurrentLocation();
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const useCurrentLocation = async () => {
        setFetchingLocation(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Permission required",
                    "Location permission is needed to use your current location. You can still tap on the map to pick a place manually."
                );
                // Fall back to a default region so the user can still see the map.
                if (!region) {
                    setRegion(defaultRegion);
                }
                setFetchingLocation(false);
                return;
            }

            // Use lower accuracy for faster response, with timeout
            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
                timeInterval: 5000,
                mayShowUserSettingsDialog: true,
            });
            
            const newRegion = {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };
            setRegion(newRegion);
            setMarker({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            });
        } catch (e) {
            console.warn("useCurrentLocation error", e);
            Alert.alert(
                "Location error",
                "Could not get your current location. You can still tap on the map to choose a place."
            );
            if (!region) {
                setRegion(defaultRegion);
            }
        } finally {
            setFetchingLocation(false);
        }
    };

    const onMapPress = (e) => {
        const { latitude, longitude } = e.nativeEvent.coordinate;
        setMarker({ latitude, longitude });
    };

    const confirm = () => {
        if (!marker)
            return Alert.alert(
                "Select location",
                "Tap on the map to choose a location."
            );
        navigation.navigate("PostProperty", {
            pickedLocation: { lat: marker.latitude, lng: marker.longitude },
        });
    };

    if (!region)
        return (
            <View style={styles.center}>
                <Text>Loading map...</Text>
            </View>
        );

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={region}
                onPress={onMapPress}
                region={region}
            >
                {marker && <Marker coordinate={marker} />}
            </MapView>
            <View style={styles.actions}>
                <GradientButton
                    title={fetchingLocation ? "Getting location..." : "Use my current location"}
                    onPress={useCurrentLocation}
                    style={{ marginBottom: 8 }}
                    disabled={fetchingLocation}
                />
                {fetchingLocation && (
                    <View style={styles.loadingRow}>
                        <ActivityIndicator size="small" color="#10B981" />
                        <Text style={styles.loadingText}>Fetching your location...</Text>
                    </View>
                )}
                <GradientButton title="Use this location" onPress={confirm} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    map: { flex: 1 },
    actions: { position: "absolute", bottom: 20, left: 16, right: 16 },
    loadingRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
        backgroundColor: "rgba(255,255,255,0.9)",
        paddingVertical: 8,
        borderRadius: 8,
    },
    loadingText: {
        marginLeft: 8,
        color: "#374151",
        fontSize: 14,
    },
});
