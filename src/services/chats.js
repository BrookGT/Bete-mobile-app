import api from "./api";

export async function listChats() {
  const { data } = await api.get("/chats");
  return data;
}

export async function listMessages(chatId) {
  const { data } = await api.get(`/chats/${chatId}/messages`);
  return data;
}

export default { listChats, listMessages };
