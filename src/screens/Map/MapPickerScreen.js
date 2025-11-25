import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import GradientButton from "../../components/GradientButton";

export default function MapPickerScreen({ navigation, route }) {
    const initial = route.params?.initialLocation;
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

    useEffect(() => {
        (async () => {
            if (!initial) {
                await useCurrentLocation();
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const useCurrentLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permission required",
                "Location permission is needed to use your current location."
            );
            return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setRegion({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        });
        setMarker({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
        });
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
                    title="Use my current location"
                    onPress={useCurrentLocation}
                    style={{ marginBottom: 8 }}
                />
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
});
