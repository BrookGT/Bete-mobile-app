import { io } from "socket.io-client";
import { API_URL } from "./config";

// Create a Socket.IO client with JWT header
export function createSocket(token) {
  const socket = io(API_URL, {
    transports: ["websocket"],
    extraHeaders: { Authorization: `Bearer ${token}` },
  });
  return socket;
}

export default { createSocket };
