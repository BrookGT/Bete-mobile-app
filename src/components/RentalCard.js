import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import theme from "../theme/theme";

function ProgressBar({ progress = 0 }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, progress * 100))}%` }]} />
    </View>
  );
}

export default function RentalCard({ rental, onPress, onRemind, onPay, onInvite }) {
  const due = new Date(rental.nextDue);
  const now = new Date();
  const daysTotal = rental.cycleDays || 30;
  const daysLeft = Math.max(0, Math.ceil((due - now) / (1000 * 60 * 60 * 24)));
  const progress = 1 - Math.min(1, Math.max(0, daysLeft / daysTotal));
  const overdue = daysLeft <= 0 && rental.status !== "paid";

  // Animate the days-left label on change
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    pulse.setValue(0);
    Animated.timing(pulse, {
      toValue: 1,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [daysLeft]);
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <Image source={rental.image} style={styles.image} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {rental.propertyTitle}
            </Text>
            <View style={[styles.rolePill, rental.role === "owner" ? styles.ownerPill : styles.tenantPill]}>
              <Text style={styles.rolePillText}>{rental.role === "owner" ? "Owner" : "Tenant"}</Text>
            </View>
          </View>
          <Text style={styles.sub} numberOfLines={1}>
            {rental.role === "owner" ? `Tenant: ${rental.counterparty}` : `Owner: ${rental.counterparty}`}
          </Text>
          <View style={styles.metaRow}>
            <LinearGradient colors={["#3B82F6", "#8B5CF6"]} style={styles.badge}>
              <Text style={styles.badgeText}>${rental.amount}/mo</Text>
            </LinearGradient>
            <View style={{ marginLeft: 8 }} />
            <View style={[styles.dueWrap, overdue && { backgroundColor: "#FEE2E2", borderColor: "#FCA5A5" }]}>
              <MaterialIcons name="event" size={14} color={overdue ? "#B91C1C" : theme.tokens.colors.textSecondary} />
              <Text style={[styles.dueText, overdue && { color: "#B91C1C" }]}>Due {due.toDateString()}</Text>
            </View>
          </View>
          <View style={{ marginTop: 8 }}>
            <ProgressBar progress={progress} />
            <Animated.Text style={[styles.progressLabel, { transform: [{ scale }], opacity }]}>
              {overdue ? "Overdue" : `${daysLeft} days left`}
            </Animated.Text>
          </View>
          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={onRemind} style={styles.secondaryBtn}>
              <MaterialIcons name="notifications-none" size={16} color={theme.tokens.colors.primary} />
              <Text style={styles.secondaryText}>Remind</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            {rental.role === "owner" && onInvite && (
              <TouchableOpacity onPress={onInvite} style={[styles.secondaryBtn, { marginRight: 8 }] }>
                <MaterialIcons name="person-add-alt" size={16} color={theme.tokens.colors.primary} />
                <Text style={styles.secondaryText}>Invite</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onPay} style={styles.primaryBtn}>
              <Text style={styles.primaryText}>{rental.role === "owner" ? "View" : "Pay"}</Text>
              <MaterialIcons name="chevron-right" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.tokens.colors.surface,
    borderRadius: theme.tokens.radius.lg,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: theme.tokens.spacing.md,
  },
  row: { flexDirection: "row" },
  image: { width: 64, height: 64, borderRadius: 12 },
  titleRow: { flexDirection: "row", alignItems: "center" },
  title: { flex: 1, fontFamily: theme.tokens.font.semi, color: theme.tokens.colors.textPrimary },
  rolePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
  ownerPill: { borderColor: "#60A5FA", backgroundColor: "#EFF6FF" },
  tenantPill: { borderColor: "#A78BFA", backgroundColor: "#F5F3FF" },
  rolePillText: { fontSize: 12, color: theme.tokens.colors.textPrimary, fontFamily: theme.tokens.font.semi },
  sub: { color: theme.tokens.colors.textSecondary, marginTop: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeText: { color: "#fff", fontFamily: theme.tokens.font.semi, fontSize: 12 },
  dueWrap: { flexDirection: "row", alignItems: "center", backgroundColor: "#F3F4F6", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: "#E5E7EB" },
  dueText: { marginLeft: 6, color: theme.tokens.colors.textSecondary, fontSize: 12 },
  progressTrack: { height: 6, backgroundColor: "#E5E7EB", borderRadius: 999, overflow: "hidden" },
  progressFill: { height: 6, backgroundColor: "#8B5CF6" },
  progressLabel: { marginTop: 4, color: theme.tokens.colors.textSecondary, fontSize: 12 },
  actionsRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  secondaryBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: "#EEF2FF" },
  secondaryText: { marginLeft: 6, color: theme.tokens.colors.primary, fontFamily: theme.tokens.font.semi },
  primaryBtn: { flexDirection: "row", alignItems: "center", backgroundColor: theme.tokens.colors.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  primaryText: { color: "#fff", fontFamily: theme.tokens.font.semi, marginRight: 4 },
});
