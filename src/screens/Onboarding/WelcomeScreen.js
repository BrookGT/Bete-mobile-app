import React, { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import theme from "../../theme/theme";

export default function WelcomeScreen({ navigation }) {
  useEffect(() => {
    const t = setTimeout(() => navigation.replace("Onboarding"), 1800);
    return () => clearTimeout(t);
  }, [navigation]);
  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0ea5e9", "#8b5cf6"]} style={styles.bg} />
      <View style={styles.center}>
        <LottieView
          source={require("../../../assets/Home.json")}
          autoPlay
          loop
          style={{ width: Dimensions.get("window").width * 0.8, height: 260 }}
        />
        <Text style={styles.title}>Bete</Text>
        <Text style={styles.subtitle}>Find, chat and manage your next home—effortlessly.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { ...StyleSheet.absoluteFillObject },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  title: { color: "#fff", fontSize: 36, fontWeight: "800", marginTop: 8 },
  subtitle: { color: "#e5e7eb", textAlign: "center", marginTop: 8 },
});
