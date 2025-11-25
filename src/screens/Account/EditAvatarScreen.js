import React, { useContext, useEffect, useState } from "react";
import { View, StyleSheet, Image, Text, Alert, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { AuthContext } from "../../context/AuthContext";
import GradientButton from "../../components/GradientButton";
import { uploadImage } from "../../services/upload";
import api from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EditAvatarScreen({ navigation }) {
  const { user, refreshMe } = useContext(AuthContext);
  const paper = useTheme();
  const [working, setWorking] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const storageKey = user?.id ? `@avatar_history_${user.id}` : null;

  useEffect(() => {
    const loadHistory = async () => {
      if (!storageKey) return;
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        const parsed = stored ? JSON.parse(stored) : [];
        const current = user?.avatarUrl;
        let merged = parsed;
        if (current && !parsed.includes(current)) {
          merged = [current, ...parsed];
        }
        setHistory(merged);
        setCurrentIndex(0);
      } catch {}
    };
    loadHistory();
  }, [storageKey, user?.avatarUrl]);

  const applyAvatarFromHistory = async (url, index) => {
    if (!url) return;
    try {
      await api.put("/users/me", { avatarUrl: url });
      await refreshMe();
      if (storageKey) {
        const next = [url, ...history.filter((h) => h !== url)].slice(0, 10);
        setHistory(next);
        setCurrentIndex(0);
        try {
          await AsyncStorage.setItem(storageKey, JSON.stringify(next));
        } catch {}
      } else {
        setCurrentIndex(index ?? 0);
      }
    } catch (e) {
      console.warn("avatar apply error", e?.message || e);
      Alert.alert("Avatar", "Could not update avatar. Please try again.");
    }
  };

  const handleChangeAvatar = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;

      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (picked.canceled) return;
      const uri = picked.assets?.[0]?.uri;
      if (!uri) return;

      setWorking(true);
      const url = await uploadImage(uri);
      if (!url) {
        setWorking(false);
        return;
      }

      await api.put("/users/me", { avatarUrl: url });
      await refreshMe();

      // update local avatar history (new first, unique, max 10)
      if (storageKey) {
        const next = [url, ...history.filter((h) => h !== url)].slice(0, 10);
        setHistory(next);
        setCurrentIndex(0);
        try {
          await AsyncStorage.setItem(storageKey, JSON.stringify(next));
        } catch {}
      }
      setWorking(false);
      navigation.goBack();
    } catch (e) {
      setWorking(false);
      console.warn("avatar change error", e?.message || e);
      Alert.alert("Avatar", "Could not update avatar. Please try again.");
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
    : "U";

  const activeUrl = history.length ? history[currentIndex] : user?.avatarUrl;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.avatarPager}>
        {activeUrl ? (
          <Image
            source={{ uri: activeUrl }}
            style={styles.avatarImage}
            resizeMode="contain"
          />
        ) : (
          <View
            style={[
              styles.avatarPlaceholder,
              { backgroundColor: paper.colors.primary },
            ]}
          >
            <Text style={styles.initials}>{initials}</Text>
          </View>
        )}
        {history.length > 1 && (
          <View style={styles.counterWrap}>
            <Text style={styles.counterText}>
              {currentIndex + 1}/{history.length}
            </Text>
          </View>
        )}
      </View>

      {/* Basic info under avatar */}
      <Text style={styles.name}>{user?.name || "Guest"}</Text>
      <Text style={styles.email}>{user?.email || "Not signed in"}</Text>

      {/* Primary action placed high on the screen, away from bottom nav */}
      <View style={styles.buttonWrap}>
        {working ? (
          <ActivityIndicator size="large" />
        ) : (
          <GradientButton
            title="Change avatar"
            onPress={handleChangeAvatar}
            style={{ alignSelf: "stretch" }}
          />
        )}
      </View>

      {history.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbRow}
        >
          {history.map((url, idx) => (
            <TouchableOpacity
              key={url + idx}
              onPress={() => {
                // Only preview this avatar locally; do not update backend
                setCurrentIndex(idx);
              }}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.thumb,
                  idx === currentIndex && styles.thumbActive,
                ]}
              >
                <Image
                  source={{ uri: url }}
                  style={styles.thumbImage}
                  resizeMode="cover"
                />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 24,
    paddingBottom: 32,
  },
  avatarPager: {
    marginTop: 24,
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#00000010",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: "#fff",
    fontSize: 64,
    fontWeight: "800",
  },
  name: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: "700",
  },
  email: {
    marginTop: 4,
    fontSize: 14,
    color: "#6b7280",
  },
  buttonWrap: {
    marginTop: 24,
    width: "100%",
  },
  counterWrap: {
    position: "absolute",
    right: 12,
    bottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  counterText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  thumbRow: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    marginRight: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbActive: {
    borderColor: "#4F46E5",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
});
