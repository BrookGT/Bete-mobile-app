import React, { useMemo, useState, useEffect, useContext } from "react";
import { View, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Platform } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RentalCard from "../../components/RentalCard";
import rentalsApi from "../../services/rentals";
import theme from "../../theme/theme";
import { AuthContext } from "../../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

function Segment({ value, onChange }) {
  const items = [
    { key: "renting", label: "I'm Renting" },
    { key: "rentedOut", label: "Rented Out" },
  ];
  return (
    <View style={styles.segmentWrap}>
      {items.map((it) => {
        const active = value === it.key;
        return (
          <TouchableOpacity key={it.key} onPress={() => onChange(it.key)} style={[styles.segmentBtn, active && styles.segmentBtnActive]}>
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{it.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function RentManagerScreen() {
  const paper = useTheme();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState("renting");
  const { user } = useContext(AuthContext);
  const [renting, setRenting] = useState([]);
  const [rentedOut, setRentedOut] = useState([]);
  const [guestRentals, setGuestRentals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ role: "tenant", counterparty: "", amount: "", dueDate: "" });

  useEffect(() => {
    (async () => {
      if (user?.id) {
        try {
          const mine = await rentalsApi.listMyRentals("renter");
          setRenting(mine || []);
        } catch (e) {
          setRenting([]);
        }
        try {
          const own = await rentalsApi.listMyRentals("owner");
          setRentedOut(own || []);
        } catch (e) {
          setRentedOut([]);
        }
      } else {
        // Load guest rentals from local storage
        try {
          const raw = await AsyncStorage.getItem("guest_rentals");
          setGuestRentals(raw ? JSON.parse(raw) : []);
        } catch {
          setGuestRentals([]);
        }
      }
    })();
  }, [user?.id]);

  const source = user?.id ? (tab === "renting" ? renting : rentedOut) : guestRentals.filter((g) => (tab === "renting" ? g.role === "tenant" : g.role === "owner"));

  // Map backend rentals to RentalCard props
  const list = user?.id
    ? source.map((r) => ({
        id: String(r.id),
        role: tab === "renting" ? "tenant" : "owner",
        propertyTitle: r.property?.title || `Property #${r.propertyId}`,
        counterparty: tab === "renting" ? (r.property?.ownerId ?? "Owner") : (r.borrowerId ?? "Tenant"),
        amount: r.rentAmount,
        nextDue: r.nextDueDate,
        status: r.isActive ? "active" : "ended",
        image: r.property?.imageUrl ? { uri: r.property.imageUrl } : require("../../../assets/lexury house.jpg"),
        cycleDays: 30,
      }))
    : source.map((g) => ({
        id: g.id,
        role: g.role,
        propertyTitle: g.propertyTitle || "My Rental",
        counterparty: g.counterparty || (g.role === "owner" ? "Tenant" : "Owner"),
        amount: g.amount,
        nextDue: g.nextDue,
        status: "active",
        image: require("../../../assets/lexury house.jpg"),
        cycleDays: 30,
      }));

  const openAdd = () => {
    setForm({ role: "tenant", counterparty: "", amount: "", dueDate: "" });
    setShowModal(true);
  };

  const saveGuestRental = async () => {
    try {
      const id = `${Date.now()}`;
      // Parse dueDate as YYYY-MM-DD or any valid date string
      const due = new Date(form.dueDate);
      if (isNaN(due.getTime())) return;
      const entry = {
        id,
        role: form.role,
        counterparty: form.counterparty,
        amount: Number(form.amount) || 0,
        nextDue: due.toISOString(),
        propertyTitle: "My Rental",
      };
      const updated = [...guestRentals, entry];
      setGuestRentals(updated);
      await AsyncStorage.setItem("guest_rentals", JSON.stringify(updated));
      setShowModal(false);
    } catch {}
  };

  return (
    <View style={{ flex: 1, backgroundColor: paper.colors.background }}>
      <FlatList
        data={list}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 12, paddingBottom: (insets.bottom || 0) + 200 }}
        ListHeaderComponent={() => (
          <>
            <View style={{ paddingHorizontal: 8, paddingTop: (insets.top || 0) + 8, paddingBottom: 12 }}>
              <Text style={styles.headerTitle}>Smart Rent Manager</Text>
              <Text style={styles.headerSub}>Track, remind and manage rent for your properties</Text>
              {!user?.id && (
                <View style={{ marginTop: 12 }}>
                  <TouchableOpacity onPress={openAdd} style={styles.addBtn}>
                    <Text style={styles.addBtnText}>Add Rental Reminder</Text>
                  </TouchableOpacity>
                  <Text style={styles.guestHint}>Sign in later to sync and manage together with your landlord/tenant.</Text>
                </View>
              )}
            </View>
            <Segment value={tab} onChange={setTab} />
            {list.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No active rentals</Text>
                <Text style={styles.emptySub}>Add a tenant from your property or start renting a place.</Text>
                {!user?.id && (
                  <TouchableOpacity onPress={openAdd} style={[styles.addBtn, { marginTop: 12 }]}>
                    <Text style={styles.addBtnText}>Add Rental Reminder</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}
        renderItem={({ item }) => (
          <RentalCard
            rental={item}
            onPress={() => {}}
            onRemind={async () => {
              if (user?.id) {
                try { await rentalsApi.createReminder(Number(item.id), item.nextDue); } catch (e) {}
              } else {
                // For guest, silently no-op or future local notification integration
              }
            }}
            onPay={async () => {
              // For now, owner can end rental; tenant could navigate to a payment screen if implemented
              if (user?.id && tab === "rentedOut") {
                try { await rentalsApi.endRental(Number(item.id)); } catch (e) {}
              }
            }}
          />
        )}
      />

      {/* Add Rental Modal for guest mode */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Rental Reminder</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity onPress={() => setForm({ ...form, role: "tenant" })} style={[styles.roleBtn, form.role === "tenant" && styles.roleBtnActive]}>
                <Text style={[styles.roleText, form.role === "tenant" && styles.roleTextActive]}>I'm Renting</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setForm({ ...form, role: "owner" })} style={[styles.roleBtn, form.role === "owner" && styles.roleBtnActive]}>
                <Text style={[styles.roleText, form.role === "owner" && styles.roleTextActive]}>Rented Out</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder={form.role === "tenant" ? "Owner name" : "Tenant name"}
              value={form.counterparty}
              onChangeText={(t) => setForm({ ...form, counterparty: t })}
              style={styles.input}
            />
            <TextInput
              placeholder="Monthly amount (e.g. 5000)"
              value={form.amount}
              onChangeText={(t) => setForm({ ...form, amount: t })}
              keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric"}
              style={styles.input}
            />
            <TextInput
              placeholder="Next due date (YYYY-MM-DD)"
              value={form.dueDate}
              onChangeText={(t) => setForm({ ...form, dueDate: t })}
              style={styles.input}
              autoCapitalize="none"
            />
            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <TouchableOpacity onPress={() => setShowModal(false)} style={[styles.modalBtn, { backgroundColor: "#E5E7EB" }]}>
                <Text style={[styles.modalBtnText, { color: theme.tokens.colors.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ width: 8 }} />
              <TouchableOpacity onPress={saveGuestRental} style={[styles.modalBtn, { backgroundColor: theme.tokens.colors.primary }]}>
                <Text style={[styles.modalBtnText, { color: "#fff" }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerTitle: { fontFamily: theme.tokens.font.semi, fontSize: 18, color: theme.tokens.colors.textPrimary },
  headerSub: { color: theme.tokens.colors.textSecondary, marginTop: 4 },
  segmentWrap: { flexDirection: "row", marginHorizontal: 12, backgroundColor: "#F1F5F9", padding: 4, borderRadius: 12, marginBottom: 12 },
  segmentBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  segmentBtnActive: { backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, elevation: 1 },
  segmentText: { color: theme.tokens.colors.textSecondary },
  segmentTextActive: { color: theme.tokens.colors.textPrimary, fontFamily: theme.tokens.font.semi },
  empty: { alignItems: "center", paddingVertical: 40 },
  emptyTitle: { fontFamily: theme.tokens.font.semi, color: theme.tokens.colors.textPrimary },
  emptySub: { color: theme.tokens.colors.textSecondary, marginTop: 6 },
  addBtn: { backgroundColor: theme.tokens.colors.primary, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  addBtnText: { color: "#fff", fontFamily: theme.tokens.font.semi },
  guestHint: { color: theme.tokens.colors.textSecondary, marginTop: 8, fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#fff", padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalTitle: { fontFamily: theme.tokens.font.semi, fontSize: 16, color: theme.tokens.colors.textPrimary, marginBottom: 8 },
  roleRow: { flexDirection: "row", backgroundColor: "#F3F4F6", padding: 4, borderRadius: 10, marginBottom: 8 },
  roleBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  roleBtnActive: { backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, elevation: 1 },
  roleText: { color: theme.tokens.colors.textSecondary },
  roleTextActive: { color: theme.tokens.colors.textPrimary, fontFamily: theme.tokens.font.semi },
  input: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, padding: 12, marginBottom: 8, backgroundColor: "#fff" },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
});
