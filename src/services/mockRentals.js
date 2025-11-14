import { Image } from "react-native";

// Mock rentals, payments, reminders
// role: "tenant" or "owner"
const rentals = [
  {
    id: "r1",
    propertyId: "p1",
    propertyTitle: "Sunny Loft, City Center",
    image: require("../../assets/lexury house 4.jpg"),
    ownerId: "u-owner",
    tenantId: "u-me",
    counterparty: "John Owner",
    role: "tenant",
    amount: 1200,
    cycleDays: 30,
    nextDue: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9).toISOString(),
    status: "unpaid",
  },
  {
    id: "r2",
    propertyId: "p2",
    propertyTitle: "Garden Apartment",
    image: require("../../assets/lexury house 2.jpg"),
    ownerId: "u-me",
    tenantId: "u-tenant-1",
    counterparty: "Sara Tenant",
    role: "owner",
    amount: 980,
    cycleDays: 30,
    nextDue: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    status: "unpaid",
  },
];

const payments = [
  { id: "pm1", rentalId: "r1", amount: 1200, date: "2025-09-01", status: "paid" },
  { id: "pm2", rentalId: "r2", amount: 980, date: "2025-09-03", status: "paid" },
];

const reminders = [
  { id: "rem1", rentalId: "r1", nextDue: rentals[0].nextDue, lastNotifiedAt: null },
  { id: "rem2", rentalId: "r2", nextDue: rentals[1].nextDue, lastNotifiedAt: null },
];

export function fetchRentals(userId) {
  // simulate segmentation
  return {
    renting: rentals.filter((r) => r.tenantId === userId).map((r) => ({ ...r, role: "tenant" })),
    rentedOut: rentals.filter((r) => r.ownerId === userId).map((r) => ({ ...r, role: "owner" })),
  };
}

export function fetchPayments(rentalId) {
  return payments.filter((p) => p.rentalId === rentalId);
}

export function fetchReminder(rentalId) {
  return reminders.find((r) => r.rentalId === rentalId) || null;
}

export function markPaid(rentalId) {
  // mock update
  const r = rentals.find((x) => x.id === rentalId);
  if (r) r.status = "paid";
  return r;
}

export function sendReminder(rentalId) {
  const rm = reminders.find((x) => x.rentalId === rentalId);
  if (rm) rm.lastNotifiedAt = new Date().toISOString();
  return rm;
}
