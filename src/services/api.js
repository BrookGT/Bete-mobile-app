import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "./config";

const api = axios.create({ baseURL: API_URL, timeout: 10000 });

// attach token to requests
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("bete:token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default api;
