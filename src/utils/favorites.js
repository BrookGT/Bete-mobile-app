import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "bete:favorites";

export async function getFavorites() {
    try {
        const raw = await AsyncStorage.getItem(KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed)
            ? parsed
                  .map((v) => Number(v))
                  .filter((v) => typeof v === "number" && !Number.isNaN(v))
            : [];
    } catch (e) {
        return [];
    }
}

export async function toggleFavorite(id) {
    try {
        const target = Number(id);
        let favs = await getFavorites();
        const idx = favs.indexOf(target);
        if (idx === -1) favs.push(target);
        else favs.splice(idx, 1);
        await AsyncStorage.setItem(KEY, JSON.stringify(favs));
        return favs;
    } catch (e) {
        return [];
    }
}
