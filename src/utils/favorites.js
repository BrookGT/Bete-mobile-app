import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "bete:favorites";

export async function getFavorites() {
    try {
        const raw = await AsyncStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

export async function toggleFavorite(id) {
    try {
        const favs = await getFavorites();
        const idx = favs.indexOf(id);
        if (idx === -1) favs.push(id);
        else favs.splice(idx, 1);
        await AsyncStorage.setItem(KEY, JSON.stringify(favs));
        return favs;
    } catch (e) {
        return [];
    }
}
