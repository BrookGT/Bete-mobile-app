import React from "react";
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function GradientButton({
  title,
  onPress,
  colors = ["#5B9DF9", "#7C4DFF"],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  style,
  textStyle,
  disabled,
  loading,
}) {
  const content = (
    <LinearGradient colors={colors} start={start} end={end} style={[styles.gradient, style]}>
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.text, textStyle]} numberOfLines={1}>
          {title}
        </Text>
      )}
    </LinearGradient>
  );

  if (disabled) {
    return (
      <View style={{ opacity: 0.6 }}>
        {content}
      </View>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    minHeight: 52,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
