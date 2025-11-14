import React from "react";
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Text,
    Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import theme from "../theme/theme";

export default function SearchBar({
    value,
    onChangeText,
    onFilterPress,
    placeholder,
}) {
    const [focused, setFocused] = React.useState(false);
    const showClear = Boolean(value && value.length > 0);
    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.inputWrap,
                    focused && {
                        borderColor: theme.tokens.colors.primary,
                        borderWidth: 1.5,
                        shadowOpacity: 0.1,
                        shadowRadius: 10,
                        elevation: 3,
                    },
                ]}
            >
                <MaterialIcons
                    name="search"
                    size={22}
                    color={
                        focused
                            ? theme.tokens.colors.primary
                            : theme.tokens.colors.textSecondary
                    }
                />
                <TextInput
                    placeholder={
                        placeholder || "Search properties, city or address"
                    }
                    placeholderTextColor={theme.tokens.colors.textSecondary}
                    value={value}
                    onChangeText={onChangeText}
                    style={styles.input}
                    underlineColorAndroid="transparent"
                    accessibilityLabel="Search properties"
                    returnKeyType="search"
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />
                {showClear && (
                    <TouchableOpacity
                        onPress={() => onChangeText && onChangeText("")}
                        accessibilityRole="button"
                        accessibilityLabel="Clear search"
                        style={{ paddingHorizontal: 6, paddingVertical: 4 }}
                    >
                        <MaterialIcons
                            name="close"
                            size={18}
                            color={theme.tokens.colors.textSecondary}
                        />
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    onPress={onFilterPress}
                    style={styles.filterBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Open filters"
                >
                    <View style={styles.filterInner}>
                        <MaterialIcons name="tune" size={16} color="white" />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: theme.tokens.spacing.md,
        marginTop: theme.tokens.spacing.sm,
    },
    inputWrap: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F1F5F9",
        borderRadius: 22,
        paddingVertical: Platform.OS === "ios" ? 14 : 10,
        paddingHorizontal: 14,
        borderWidth: 0,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
    },
    input: {
        flex: 1,
        marginLeft: 12,
        fontFamily: theme.tokens.font.regular,
        fontSize: 16,
        color: theme.tokens.colors.textPrimary,
    },
    filterBtn: { marginLeft: 10 },
    filterInner: {
        backgroundColor: theme.tokens.colors.primary,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 16,
    },
});
