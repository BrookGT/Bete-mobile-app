import React from "react";
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Platform,
    Animated,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
// avoid moti/reanimated for Expo Go compatibility — use plain View
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import theme from "../theme/theme";

const tabs = [
    { key: "Home", label: "Home", iconName: "home" },
    { key: "Map", label: "Map", iconName: "place" },
    { key: "Chats", label: "Chat", iconName: "chat" },
    { key: "Favorites", label: "Favorites", iconName: "favorite" },
    { key: "Account", label: "Account", iconName: "person" },
];

export default function BottomTabBar({ state, descriptors, navigation }) {
    const activeIndex = state.index;
    const insets = useSafeAreaInsets();
    const bottomInset = insets.bottom || 0;
    const containerPaddingBottom = Platform.OS === "ios" ? bottomInset : Math.max(bottomInset, 8);

    return (
        <View style={styles.absoluteWrap} pointerEvents="box-none">
            <BlurView
                intensity={100}
                tint="light"
                style={[styles.blur, { paddingBottom: containerPaddingBottom }]}
                pointerEvents={"box-none"}
            >
                <LinearGradient
                    colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.65)"]}
                    style={styles.gradient}
                >
                    <View style={styles.row}>
                        {tabs.map((t, i) => {
                            const focused = i === activeIndex;
                            return (
                                <TouchableOpacity
                                    key={t.key}
                                    onPress={() => navigation.navigate(t.key)}
                                    style={styles.tab}
                                    activeOpacity={0.85}
                                    accessibilityRole="button"
                                    accessibilityLabel={t.label}
                                >
                                    <View
                                        style={{
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <View
                                            style={[
                                                styles.iconWrap,
                                                focused &&
                                                    styles.iconWrapActive,
                                            ]}
                                        >
                                            <AnimatedIcon
                                                name={t.iconName}
                                                focused={focused}
                                            />
                                        </View>
                                        <Text
                                            style={[
                                                styles.label,
                                                focused
                                                    ? styles.labelActive
                                                    : styles.labelInactive,
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {t.label}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </LinearGradient>
            </BlurView>
        </View>
    );
}

function AnimatedIcon({ name, focused }) {
    const scale = React.useRef(
        new Animated.Value(focused ? 1.08 : 0.96)
    ).current;
    React.useEffect(() => {
        Animated.timing(scale, {
            toValue: focused ? 1.08 : 0.96,
            duration: 160,
            useNativeDriver: true,
        }).start();
    }, [focused]);
    return (
        <Animated.View style={{ transform: [{ scale }], alignItems: "center" }}>
            <MaterialIcons
                name={name}
                size={20}
                color={
                    focused
                        ? theme.tokens.colors.primary
                        : theme.tokens.colors.textSecondary
                }
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    absoluteWrap: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 16,
        paddingBottom: 0,
    },
    blur: {
        borderRadius: 22,
        overflow: "hidden",
    },
    gradient: {
        borderRadius: 22,
        paddingHorizontal: 12,
        paddingVertical: 10,
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.6)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.45)",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
    },
    tab: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 4 },
    iconWrap: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
    },
    iconWrapActive: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        borderColor: theme.tokens.colors.primary,
        borderWidth: 2,
        shadowColor: "#000",
        shadowOpacity: 0.14,
        shadowRadius: 10,
        elevation: 6,
        transform: [{ translateY: -6 }],
    },
    label: { fontSize: 11, marginTop: 4 },
    labelActive: { color: theme.tokens.colors.primary, fontWeight: "700" },
    labelInactive: { color: theme.tokens.colors.textSecondary },
});
