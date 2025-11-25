import React, { useMemo, useState, useEffect, useContext, useRef } from "react";
import { View, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Platform, Animated } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RentalCard from "../../components/RentalCard";
import rentalsApi from "../../services/rentals";
import remindersApi from "../../services/reminders";
import theme from "../../theme/theme";
import { AuthContext } from "../../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import Constants from "expo-constants";
let Notifications;
try {
  const isExpoGo = Constants?.appOwnership === "expo";
  Notifications = isExpoGo ? null : require("expo-notifications");
} catch (e) {
  Notifications = null;
}

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
  const [customReminders, setCustomReminders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ role: "tenant", counterparty: "", amount: "", dueDate: null });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const notifReadyRef = useRef(false);
  // Invite / Join state
  const [inviteModal, setInviteModal] = useState({ visible: false, rentalId: null, email: "", code: "", loading: false });
  const [joinModal, setJoinModal] = useState({ visible: false, code: "", loading: false, message: "" });

  const ensureNotifPermissions = async () => {
    if (!Notifications) return false;
    try {
      const settings = await Notifications.getPermissionsAsync();
      if (settings.status !== "granted") {
        const req = await Notifications.requestPermissionsAsync();
        notifReadyRef.current = req.status === "granted";
        return notifReadyRef.current;
      }
      notifReadyRef.current = true;
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("rent-reminders", {
          name: "Rent Reminders",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
      return true;
    } catch {
      return false;
    }
  };

  const scheduleReminderNotification = async (entry) => {
    if (!Notifications) return;
    try {
      const ok = await ensureNotifPermissions();
      if (!ok) return;
      const triggerDate = new Date(entry.nextDue);
      if (isNaN(triggerDate.getTime())) return;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Rent reminder",
          body: `${entry.role === "owner" ? "Collect" : "Pay"} ${entry.amount} on ${triggerDate.toDateString()}`,
        },
        trigger: triggerDate,
      });
    } catch {}
  };

  useEffect(() => {
    (async () => {
      if (user?.id) {
        // Logged-in: load rentals and custom reminders from backend
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
        try {
          const remote = await remindersApi.listReminders();
          const mapped = (remote || []).map((r) => ({
            id: String(r.id),
            role: r.role,
            propertyTitle: r.propertyTitle,
            counterparty: r.counterparty,
            amount: r.amount,
            dueDate: r.dueDate,
            createdAt: r.createdAt,
          }));
          setCustomReminders(mapped);
        } catch {
          setCustomReminders([]);
        }
      } else {
        // Guest: load rentals and custom reminders from local storage
        try {
          const raw = await AsyncStorage.getItem("guest_rentals");
          setGuestRentals(raw ? JSON.parse(raw) : []);
        } catch {
          setGuestRentals([]);
        }
        try {
          const stored = await AsyncStorage.getItem("rent_custom_reminders");
          setCustomReminders(stored ? JSON.parse(stored) : []);
        } catch {
          setCustomReminders([]);
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

  const openInvite = (rentalId) => {
    setInviteModal({ visible: true, rentalId, email: "", code: "", loading: false });
  };

  const createInvite = async () => {
    if (!user?.id || !inviteModal.rentalId) return;
    try {
      setInviteModal((s) => ({ ...s, loading: true }));
      const res = await rentalsApi.createInvite(Number(inviteModal.rentalId), inviteModal.email.trim() || undefined);
      setInviteModal((s) => ({ ...s, code: res.code || "", loading: false }));
    } catch (e) {
      setInviteModal((s) => ({ ...s, loading: false }));
    }
  };

  const openJoin = () => setJoinModal({ visible: true, code: "", loading: false, message: "" });
  const acceptInvite = async () => {
    const code = (joinModal.code || "").trim();
    if (!code) return;
    try {
      setJoinModal((s) => ({ ...s, loading: true, message: "" }));
      await rentalsApi.acceptInvite(code);
      // refresh lists
      if (user?.id) {
        try { setRenting(await rentalsApi.listMyRentals("renter") || []); } catch { }
        try { setRentedOut(await rentalsApi.listMyRentals("owner") || []); } catch { }
      }
      setJoinModal({ visible: false, code: "", loading: false, message: "" });
    } catch (e) {
      setJoinModal((s) => ({ ...s, loading: false, message: e.response?.data?.error || "Failed to join" }));
    }
  };

  const openAdd = () => {
    setForm({ role: "tenant", counterparty: "", amount: "", dueDate: null });
    setShowModal(true);
  };

  const saveGuestRental = async () => {
    try {
      const due = form.dueDate instanceof Date ? form.dueDate : null;
      if (!due || isNaN(due.getTime())) return;

      // Logged-in: create persistent custom reminder in backend
      if (user?.id) {
        const payload = {
          role: form.role,
          propertyTitle: form.counterparty || "My Rental",
          counterparty: form.counterparty || null,
          amount: form.amount ? Number(form.amount) : null,
          dueDate: due.toISOString(),
        };
        const created = await remindersApi.createReminder(payload);
        const reminder = {
          id: String(created.id),
          role: created.role,
          propertyTitle: created.propertyTitle,
          counterparty: created.counterparty,
          amount: created.amount,
          dueDate: created.dueDate,
          createdAt: created.createdAt,
        };
        const nextCustom = [...customReminders, reminder];
        setCustomReminders(nextCustom);
        const entry = {
          id: reminder.id,
          role: reminder.role,
          counterparty: reminder.counterparty,
          amount: reminder.amount || 0,
          nextDue: reminder.dueDate,
          propertyTitle: reminder.propertyTitle,
        };
        await scheduleReminderNotification(entry);
        setShowModal(false);
        return;
      }

      // Guest: keep existing local behaviour
      const id = `${Date.now()}`;
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
      const reminder = {
        id,
        role: form.role,
        propertyTitle: form.counterparty || "My Rental",
        dueDate: due.toISOString(),
        createdAt: new Date().toISOString(),
      };
      const nextCustom = [...customReminders, reminder];
      setCustomReminders(nextCustom);
      await AsyncStorage.setItem("rent_custom_reminders", JSON.stringify(nextCustom));
      await scheduleReminderNotification(entry);
      setShowModal(false);
    } catch {}
  };

  const ONE_DAY = 24 * 60 * 60 * 1000;

  const getDiffDays = (r) => {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const due = new Date(r.dueDate);
    if (isNaN(due.getTime())) return 0;
    const startOfDue = new Date(
      due.getFullYear(),
      due.getMonth(),
      due.getDate()
    );
    return Math.round(
      (startOfDue.getTime() - startOfToday.getTime()) / ONE_DAY
    );
  };

  const sortedCustomReminders = useMemo(
    () =>
      [...customReminders].sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      ),
    [customReminders]
  );

  const renderCountdownText = (r) => {
    const diffDays = getDiffDays(r);

    if (diffDays > 0) {
      return r.role === "owner"
        ? `${diffDays} day${diffDays > 1 ? "s" : ""} left to receive payment`
        : `${diffDays} day${diffDays > 1 ? "s" : ""} left to pay rent`;
    }
    if (diffDays === 0) {
      return r.role === "owner" ? "Payment is due today" : "Rent is due today";
    }
    const overdue = Math.abs(diffDays);
    return r.role === "owner"
      ? `Payment is overdue by ${overdue} day${overdue > 1 ? "s" : ""}`
      : `Rent is overdue by ${overdue} day${overdue > 1 ? "s" : ""}`;
  };

  const customAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (sortedCustomReminders.length > 0) {
      Animated.timing(customAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [sortedCustomReminders.length, customAnim]);

  const updateAndPersistReminders = async (next) => {
    setCustomReminders(next);
    if (!user?.id) {
      try {
        await AsyncStorage.setItem("rent_custom_reminders", JSON.stringify(next));
      } catch {}
    }
  };

  const handleMarkPaid = async (reminder) => {
    if (!reminder) return;
    const currentDue = new Date(reminder.dueDate);
    if (isNaN(currentDue.getTime())) return;
    const nextDue = new Date(currentDue.getTime() + 30 * ONE_DAY);
    try {
      if (user?.id) {
        await remindersApi.updateReminder(Number(reminder.id), {
          dueDate: nextDue.toISOString(),
        });
      }
      const next = customReminders.map((r) =>
        r.id === reminder.id ? { ...r, dueDate: nextDue.toISOString() } : r
      );
      await updateAndPersistReminders(next);
      const updated = next.find((r) => r.id === reminder.id) || null;
      if (updated && expandedId === reminder.id) {
        setExpandedId(updated.id);
      }
    } catch (e) {}
  };

  const handleDeleteReminder = async (reminder) => {
    if (!reminder) return;
    try {
      if (user?.id) {
        await remindersApi.deleteReminder(Number(reminder.id));
      }
      const next = customReminders.filter((r) => r.id !== reminder.id);
      await updateAndPersistReminders(next);
    } catch (e) {}
    if (expandedId === reminder.id) {
      setExpandedId(null);
    }
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
              {user?.id && (
                <View style={{ marginTop: 12, flexDirection: "row" }}>
                  <TouchableOpacity onPress={openJoin} style={[styles.addBtn, { flex: 1, backgroundColor: "#0EA5E9" }] }>
                    <Text style={styles.addBtnText}>Join by Code</Text>
                  </TouchableOpacity>
                  <View style={{ width: 8 }} />
                  <TouchableOpacity onPress={openAdd} style={[styles.addBtn, { flex: 1, backgroundColor: "#10B981" }] }>
                    <Text style={styles.addBtnText}>Add Custom Reminder</Text>
                  </TouchableOpacity>
                </View>
              )}
              {!user?.id && (
                <View style={{ marginTop: 12 }}>
                  <TouchableOpacity onPress={openAdd} style={styles.addBtn}>
                    <Text style={styles.addBtnText}>Add Custom Reminder</Text>
                  </TouchableOpacity>
                  <Text style={styles.guestHint}>Sign in later to sync and manage together with your landlord/tenant.</Text>
                </View>
              )}
            </View>
            <Segment value={tab} onChange={setTab} />
            {sortedCustomReminders.length > 0 && (
              <Animated.View
                style={{
                  marginTop: 16,
                  paddingHorizontal: 8,
                  opacity: customAnim,
                  transform: [
                    {
                      translateY: customAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [8, 0],
                      }),
                    },
                  ],
                }}
              >
                <Text style={styles.customHeaderTitle}>Rent Reminders</Text>
                {(tab === "renting"
                  ? sortedCustomReminders.filter((r) => r.role !== "owner")
                  : sortedCustomReminders.filter((r) => r.role === "owner")
                ).map((r) => {
                  const diff = getDiffDays(r);
                  const isOverdue = diff < 0;
                  const isSoon = !isOverdue && (diff === 0 || diff === 1 || diff === 2 || diff === 3);
                  const roleLabel = r.role === "owner" ? "TENANT" : "LANDLORD";
                  let statusText = "ACTIVE";
                  let statusStyle = styles.customStatusActive;
                  if (isOverdue) {
                    statusText = "OVERDUE";
                    statusStyle = styles.customStatusOverdue;
                  } else if (isSoon) {
                    statusText = "DUE SOON";
                    statusStyle = styles.customStatusSoon;
                  }

                  // circle color based on days left
                  let circleTone = styles.customCountdownCircleNeutral;
                  if (!isOverdue) {
                    if (diff > 20) circleTone = styles.customCountdownCircleSafe;
                    else if (diff > 10) circleTone = styles.customCountdownCircleCalm;
                    else if (diff >= 5) circleTone = styles.customCountdownCircleSoon;
                    else if (diff >= 2) circleTone = styles.customCountdownCircleWarning;
                    else circleTone = styles.customCountdownCircleDanger;
                  } else {
                    circleTone = styles.customCountdownCircleDanger;
                  }

                  return (
                    <TouchableOpacity
                      key={r.id}
                      style={[
                        styles.customCard,
                        isOverdue
                          ? styles.customCardOverdue
                          : isSoon
                          ? styles.customCardSoon
                          : styles.customCardActive,
                      ]}
                      activeOpacity={0.9}
                      onPress={() =>
                        setExpandedId(expandedId === r.id ? null : r.id)
                      }
                    >
                      <View style={{ flex: 1 }}>
                        {/* Header row: role + title on left, status + date on right */}
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.customRoleLabel}>{roleLabel}</Text>
                            <Text style={styles.customProperty}>{r.propertyTitle}</Text>
                          </View>
                          <View style={{ alignItems: "flex-end" }}>
                            <View style={statusStyle}>
                              <Text style={styles.customStatusText}>{statusText}</Text>
                            </View>
                            <Text style={[
                              styles.customDate,
                              isOverdue ? styles.customDateOverdue : null,
                            ]}>
                              {new Date(r.dueDate).toDateString()}
                            </Text>
                          </View>
                        </View>

                        {/* Role pill row (Owner/Tenant badge) */}
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                          <View
                            style={[
                              styles.customBadge,
                              r.role === "owner"
                                ? styles.customBadgeOwner
                                : styles.customBadgeTenant,
                            ]}
                          >
                            <Text style={styles.customBadgeText}>
                              {r.role === "owner" ? "Owner" : "Tenant"}
                            </Text>
                          </View>
                        </View>

                        {/* Countdown summary row */}
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
                          <Text style={styles.customIcon}>💰</Text>
                          <Text style={styles.customCountdown}>{renderCountdownText(r)}</Text>
                        </View>

                        {/* Due date row with clock icon */}
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Text style={styles.customIcon}>🕒</Text>
                          <Text style={styles.customDate}>
                            Due {new Date(r.dueDate).toDateString()}
                          </Text>
                        </View>

                        {expandedId === r.id && (
                          <View style={styles.expandedCardBody}>
                            <Text style={styles.expandedTitle}>Payment Due In:</Text>
                            <View style={styles.expandedDivider} />
                            <View style={styles.detailRow}>
                              <Text style={styles.detailRowLabel}>Contact:</Text>
                              <Text style={styles.detailRowValue}>
                                {r.counterparty || "—"}
                              </Text>
                            </View>
                            <View style={styles.detailRow}>
                              <Text style={styles.detailRowLabel}>Amount Due:</Text>
                              <Text style={styles.detailRowValueAmount}>
                                {r.amount != null ? `${r.amount}` : "—"}
                              </Text>
                            </View>
                            <View style={styles.detailRow}>
                              <Text style={styles.detailRowLabel}>Start Date:</Text>
                              <Text style={styles.detailRowValue}>
                                {r.createdAt ? new Date(r.createdAt).toDateString() : "—"}
                              </Text>
                            </View>
                            <View style={styles.detailRow}>
                              <Text style={styles.detailRowLabel}>Property:</Text>
                              <Text style={styles.detailRowValue}>
                                {r.propertyTitle || "—"}
                              </Text>
                            </View>
                            <View style={{ flexDirection: "row", marginTop: 16 }}>
                              <TouchableOpacity
                                onPress={() => handleDeleteReminder(r)}
                                style={[styles.modalBtn, { backgroundColor: "#FEE2E2", marginRight: 8 }]}
                              >
                                <Text style={[styles.modalBtnText, { color: "#B91C1C" }]}>Delete</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => handleMarkPaid(r)}
                                style={[styles.modalBtn, { backgroundColor: "#10B981" }]}
                              >
                                <Text style={[styles.modalBtnText, { color: "#fff" }]}>
                                  {r.role === "owner" ? "He paid" : "I've paid"}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}
                      </View>
                      <View style={[styles.customCountdownCircle, circleTone]}>
                        <Text style={styles.customCountdownDays}>
                          {diff > 0 ? diff : "!"}
                        </Text>
                        <Text style={styles.customCountdownLabel}>
                          {diff > 0 ? "days" : isOverdue ? "late" : "due"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </Animated.View>
            )}
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
            onInvite={user?.id && item.role === "owner" ? () => openInvite(item.id) : undefined}
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
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[styles.input, { justifyContent: "center" }]}
              activeOpacity={0.8}
            >
              <Text style={{ color: form.dueDate ? theme.tokens.colors.textPrimary : "#9CA3AF" }}>
                {form.dueDate ? form.dueDate.toDateString() : "Tap to pick due date"}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={form.dueDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(_, selectedDate) => {
                  if (Platform.OS !== "ios") setShowDatePicker(false);
                  if (selectedDate) {
                    setForm((prev) => ({ ...prev, dueDate: selectedDate }));
                  }
                }}
              />
            )}
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

      {/* Inline expanded details now live inside each custom reminder card; bottom sheet removed */}

      {/* Invite Modal */}
      <Modal visible={inviteModal.visible} transparent animationType="slide" onRequestClose={() => setInviteModal((s) => ({ ...s, visible: false }))}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Invite tenant/owner</Text>
            <TextInput
              placeholder="Invitee email (optional)"
              value={inviteModal.email}
              onChangeText={(t) => setInviteModal((s) => ({ ...s, email: t }))}
              style={styles.input}
              autoCapitalize="none"
            />
            {inviteModal.code ? (
              <View style={{ paddingVertical: 8 }}>
                <Text style={{ color: theme.tokens.colors.textSecondary }}>Share this code:</Text>
                <Text style={{ fontFamily: theme.tokens.font.semi, fontSize: 18, marginTop: 4 }}>{inviteModal.code}</Text>
              </View>
            ) : null}
            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <TouchableOpacity onPress={() => setInviteModal((s) => ({ ...s, visible: false }))} style={[styles.modalBtn, { backgroundColor: "#E5E7EB" }]}>
                <Text style={[styles.modalBtnText, { color: theme.tokens.colors.textPrimary }]}>Close</Text>
              </TouchableOpacity>
              <View style={{ width: 8 }} />
              <TouchableOpacity onPress={createInvite} style={[styles.modalBtn, { backgroundColor: theme.tokens.colors.primary, opacity: inviteModal.loading ? 0.7 : 1 }]} disabled={inviteModal.loading}>
                <Text style={[styles.modalBtnText, { color: "#fff" }]}>{inviteModal.code ? "Regenerate" : (inviteModal.loading ? "Creating..." : "Create Invite")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Join Modal */}
      <Modal visible={joinModal.visible} transparent animationType="slide" onRequestClose={() => setJoinModal({ visible: false, code: "", loading: false, message: "" })}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Join Rental</Text>
            <TextInput
              placeholder="Enter invite code"
              value={joinModal.code}
              onChangeText={(t) => setJoinModal((s) => ({ ...s, code: t }))}
              style={styles.input}
              autoCapitalize="characters"
            />
            {!!joinModal.message && (<Text style={{ color: "#B91C1C", marginBottom: 6 }}>{joinModal.message}</Text>)}
            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <TouchableOpacity onPress={() => setJoinModal({ visible: false, code: "", loading: false, message: "" })} style={[styles.modalBtn, { backgroundColor: "#E5E7EB" }]}>
                <Text style={[styles.modalBtnText, { color: theme.tokens.colors.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ width: 8 }} />
              <TouchableOpacity onPress={acceptInvite} style={[styles.modalBtn, { backgroundColor: "#0EA5E9", opacity: joinModal.loading ? 0.7 : 1 }]} disabled={joinModal.loading}>
                <Text style={[styles.modalBtnText, { color: "#fff" }]}>{joinModal.loading ? "Joining..." : "Join"}</Text>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
  },
  modalTitle: { fontFamily: theme.tokens.font.semi, fontSize: 16, color: theme.tokens.colors.textPrimary, marginBottom: 8 },
  roleRow: { flexDirection: "row", backgroundColor: "#F3F4F6", padding: 4, borderRadius: 10, marginBottom: 8 },
  roleBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  roleBtnActive: { backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, elevation: 1 },
  roleText: { color: theme.tokens.colors.textSecondary },
  roleTextActive: { color: theme.tokens.colors.textPrimary, fontFamily: theme.tokens.font.semi },
  input: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, padding: 12, marginBottom: 8, backgroundColor: "#fff" },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  modalBtnText: { fontFamily: theme.tokens.font.semi, fontSize: 14 },

  // Rent Reminders header
  customHeaderTitle: {
    fontFamily: theme.tokens.font.semi,
    fontSize: 16,
    color: theme.tokens.colors.textPrimary,
    marginBottom: 8,
  },

  // Reminder cards
  customCard: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 3,
  },
  customCardActive: { borderLeftColor: "#22C55E" },
  customCardSoon: { borderLeftColor: "#FACC15" },
  customCardOverdue: { borderLeftColor: "#EF4444" },

  customRoleLabel: {
    fontSize: 11,
    fontFamily: theme.tokens.font.semi,
    letterSpacing: 1,
    color: "#6B7280",
  },
  customProperty: {
    fontFamily: theme.tokens.font.semi,
    fontSize: 16,
    color: theme.tokens.colors.textPrimary,
    marginTop: 2,
  },

  customStatusActive: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#DCFCE7",
  },
  customStatusSoon: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#FEF9C3",
  },
  customStatusOverdue: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#FEE2E2",
  },
  customStatusText: {
    fontSize: 11,
    fontFamily: theme.tokens.font.semi,
    color: "#111827",
  },

  customDate: {
    marginTop: 4,
    fontSize: 12,
    color: "#6B7280",
  },
  customDateOverdue: {
    color: "#B91C1C",
  },

  customBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  customBadgeOwner: {
    backgroundColor: "#EFF6FF",
  },
  customBadgeTenant: {
    backgroundColor: "#ECFEFF",
  },
  customBadgeText: {
    fontSize: 11,
    fontFamily: theme.tokens.font.semi,
    color: "#1F2937",
  },

  customIcon: {
    marginRight: 6,
    fontSize: 13,
  },
  customCountdown: {
    fontSize: 13,
    color: theme.tokens.colors.textSecondary,
  },
  customCountdownCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  customCountdownDays: {
    fontFamily: theme.tokens.font.semi,
    fontSize: 16,
    color: theme.tokens.colors.textPrimary,
  },
  customCountdownLabel: {
    fontSize: 10,
    color: theme.tokens.colors.textSecondary,
  },

  // Expanded details section inside card
  expandedCardBody: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  expandedTitle: {
    textAlign: "center",
    fontFamily: theme.tokens.font.semi,
    fontSize: 14,
    color: theme.tokens.colors.textPrimary,
    marginBottom: 6,
  },
  expandedDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 8,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  detailRowLabel: {
    fontSize: 13,
    color: theme.tokens.colors.textSecondary,
  },
  detailRowValue: {
    fontSize: 13,
    color: theme.tokens.colors.textPrimary,
  },
  detailRowValueAmount: {
    fontSize: 13,
    fontFamily: theme.tokens.font.semi,
    color: "#16A34A",
  },
});
