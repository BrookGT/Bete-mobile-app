import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import theme from "../../theme/theme";

const slides = [
  {
    key: "discover",
    title: "Discover homes near you",
    sub: "Search properties in any location with interactive maps.",
    source: require("../../../assets/house rent in any Location.json"),
  },
  {
    key: "manage",
    title: "Smart rent management",
    sub: "Track due dates and send reminders effortlessly.",
    source: require("../../../assets/rent_animation.json"),
  },
  {
    key: "chat",
    title: "Chat in real-time",
    sub: "Message owners and tenants instantly, all in your phone.",
    source: require("../../../assets/Hand scrolls the messages on the phone.json"),
  },
];

export default function OnboardingScreen({ navigation }) {
  const [index, setIndex] = useState(0);
  const ref = useRef(null);
  const { width } = Dimensions.get("window");

  const next = () => {
    if (index < slides.length - 1) {
      ref.current?.scrollToIndex({ index: index + 1, animated: true });
      setIndex(index + 1);
    } else {
      navigation.replace("Login");
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.slide, { width }]}> 
      <LottieView source={item.source} autoPlay loop style={{ width: width * 0.85, height: 320 }} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.sub}>{item.sub}</Text>
      {item.key === "chat" && (
        <TouchableOpacity style={styles.cta} activeOpacity={0.9} onPress={next}>
          <LinearGradient colors={["#7C3AED", "#A78BFA"]} style={styles.ctaInner}>
            <Text style={styles.ctaText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0ea5e9", "#8b5cf6"]} style={styles.bg} />
      <FlatList
        ref={ref}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(it) => it.key}
        renderItem={renderItem}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(i);
        }}
      />
      <View style={styles.dots}>
        {slides.map((s, i) => (
          <View key={s.key} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bg: { ...StyleSheet.absoluteFillObject },
  slide: { alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  title: { color: "#fff", fontSize: 28, fontWeight: "900", marginTop: 12, textAlign: "center" },
  sub: { color: "#F3E8FF", textAlign: "center", marginTop: 8, paddingHorizontal: 16, fontSize: 18, fontWeight: "700" },
  dots: { flexDirection: "row", justifyContent: "center", marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.4)", marginHorizontal: 4 },
  dotActive: { backgroundColor: "#fff", width: 22 },
  cta: { marginTop: 18 },
  ctaInner: { paddingVertical: 14, paddingHorizontal: 42, borderRadius: 14, alignItems: "center" },
  ctaText: { color: "#fff", fontWeight: "800", fontSize: 18 },
});
