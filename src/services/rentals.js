import api from "./api";

export async function listMyRentals(role = "renter") {
  const { data } = await api.get(`/rentals/mine`, { params: { role } });
  return data;
}

export async function createReminder(rentalId, dueDate, status = "pending") {
  const { data } = await api.post(`/rentals/${rentalId}/reminders`, { dueDate, status });
  return data;
}

export async function endRental(rentalId) {
  const { data } = await api.post(`/rentals/${rentalId}/end`);
  return data;
}

export default { listMyRentals, createReminder, endRental };
