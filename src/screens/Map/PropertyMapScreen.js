import React, { useMemo } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Alert, Platform, Linking } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PropertyMapScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { lat, lng, title } = route.params || {};
  const latitude = Number(lat);
  const longitude = Number(lng);

  const region = useMemo(
    () => ({
      latitude: latitude || 9.0,
      longitude: longitude || 38.7,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }),
    [latitude, longitude]
  );

  const openDirections = async () => {
    if (!latitude || !longitude) {
      Alert.alert("Location", "This property does not have coordinates.");
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Location permission is needed to start directions."
        );
        return;
      }
    } catch (e) {
      // even if permission check fails, still try to open maps app with destination only
    }

    const scheme = Platform.select({ ios: "maps://", android: "google.navigation:" });
    const iosUrl = `http://maps.apple.com/?daddr=${latitude},${longitude}`;
    const androidUrl = `google.navigation:q=${latitude},${longitude}`;
    const url = Platform.OS === "ios" ? iosUrl : androidUrl;

    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      const fallback = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      Linking.openURL(fallback);
      return;
    }
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }] }>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <MaterialIcons name="arrow-back" size={22} color="#111827" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {title || "Property location"}
        </Text>
        <View style={{ width: 64 }} />
      </View>
      <MapView style={styles.map} initialRegion={region}>
        {latitude && longitude && (
          <Marker
            coordinate={{ latitude, longitude }}
            title={title || "Property"}
          />
        )}
      </MapView>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.directionsBtn}
          onPress={openDirections}
          activeOpacity={0.9}
        >
          <MaterialIcons name="directions" size={18} color="#fff" />
          <Text style={styles.directionsText}>Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  backBtn: { flexDirection: "row", alignItems: "center" },
  backText: { marginLeft: 6, color: "#111827", fontWeight: "600" },
  title: {
    flex: 1,
    textAlign: "center",
    fontWeight: "700",
    color: "#111827",
    marginHorizontal: 8,
  },
  map: { flex: 1 },
  actions: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    alignItems: "center",
  },
  directionsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#111827",
  },
  directionsText: { color: "#fff", fontWeight: "700", marginLeft: 6 },
});
