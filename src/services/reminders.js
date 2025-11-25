import api from "./api";

export async function listReminders() {
  const { data } = await api.get("/reminders");
  return data;
}

export async function createReminder(payload) {
  const { data } = await api.post("/reminders", payload);
  return data;
}

export async function updateReminder(id, payload) {
  const { data } = await api.patch(`/reminders/${id}`, payload);
  return data;
}

export async function deleteReminder(id) {
  const { data } = await api.delete(`/reminders/${id}`);
  return data;
}

export default { listReminders, createReminder, updateReminder, deleteReminder };
