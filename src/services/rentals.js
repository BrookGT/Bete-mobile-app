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

export async function createInvite(rentalId, inviteeEmail) {
  const { data } = await api.post(`/rentals/${rentalId}/invites`, inviteeEmail ? { inviteeEmail } : {});
  return data; // { id, code, ... }
}

export async function listInvites(rentalId) {
  const { data } = await api.get(`/rentals/${rentalId}/invites`);
  return data;
}

export async function acceptInvite(code) {
  const { data } = await api.post(`/rentals/invites/${code}/accept`);
  return data;
}

export default { listMyRentals, createReminder, endRental, createInvite, listInvites, acceptInvite };
