import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "./config";

const api = axios.create({ baseURL: API_URL, timeout: 30000 }); // 30 seconds for cold start

// attach token to requests
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("bete:token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default api;
