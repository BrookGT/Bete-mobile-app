import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import api from "../../services/api";

export default function MapScreen({ navigation }) {
    const [markers, setMarkers] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const resp = await api.get("/properties");
                const props = resp.data.properties || [];
                const withCoords = props
                    .filter((p) => p.lat && p.lng)
                    .map((p) => ({
                        id: p.id,
                        title: p.title,
                        latitude: Number(p.lat),
                        longitude: Number(p.lng),
                    }));
                setMarkers(withCoords);
            } catch (e) {
                console.warn("map load failed", e.message);
            }
        })();
    }, []);

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 9.0,
                    longitude: 38.7,
                    latitudeDelta: 1,
                    longitudeDelta: 1,
                }}
            >
                {markers.map((m) => (
                    <Marker
                        key={m.id}
                        coordinate={{
                            latitude: m.latitude,
                            longitude: m.longitude,
                        }}
                        title={m.title}
                        onPress={() =>
                            navigation.navigate("PropertyDetail", {
                                id: m.id,
                            })
                        }
                    />
                ))}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({ container: { flex: 1 }, map: { flex: 1 } });
