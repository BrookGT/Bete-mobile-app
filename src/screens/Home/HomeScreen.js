import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, FlatList, Animated, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HeaderGreeting from "../../components/HeaderGreeting";
import SearchBar from "../../components/SearchBar";
import PromoBanner from "../../components/PromoBanner";
import PropertyCard from "../../components/PropertyCard";
import theme from "../../theme/theme";
import { fetchProperties } from "../../services/mockProperties";

export default function HomeScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [query, setQuery] = useState("");
    const [properties, setProperties] = useState([]);
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        setProperties(fetchProperties());
        Animated.timing(anim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    const renderItem = ({ item, index }) => (
        <Animated.View
            style={{
                opacity: anim,
                transform: [
                    {
                        translateY: anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [12, 0],
                        }),
                    },
                ],
            }}
        >
            <PropertyCard
                property={item}
                onPress={() =>
                    navigation.navigate("PropertyDetail", { id: item.id })
                }
            />
        </Animated.View>
    );

    return (
        <View style={styles.screen}>
            <FlatList
                style={{ flex: 1 }}
                data={properties}
                keyExtractor={(i) => i.id}
                renderItem={renderItem}
                initialNumToRender={6}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{
                    paddingBottom: (insets.bottom || 0) + 220,
                }}
                ListHeaderComponent={() => (
                    <>
                        <HeaderGreeting name="Nahom" />
                        <SearchBar
                            value={query}
                            onChangeText={setQuery}
                            onFilterPress={() =>
                                navigation.navigate("PropertyList")
                            }
                        />
                        <PromoBanner
                            style={{
                                marginTop: theme.tokens.spacing.sm,
                                marginBottom: theme.tokens.spacing.md,
                            }}
                        />

                        <View style={styles.sectionHeaderWrap}>
                            <Text style={styles.sectionTitle}>
                                Recommended for you
                            </Text>
                            <Text style={styles.sectionSub}>
                                Handpicked properties based on your search
                            </Text>
                        </View>
                        <View style={{ height: theme.tokens.spacing.md }} />
                    </>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.tokens.colors.background },
    sectionHeaderWrap: {
        paddingHorizontal: theme.tokens.spacing.md,
        marginTop: theme.tokens.spacing.md,
        marginBottom: theme.tokens.spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: theme.tokens.font.semi,
        color: theme.tokens.colors.textPrimary,
    },
    sectionSub: { color: theme.tokens.colors.textSecondary, marginTop: 4 },
    listWrap: {
        paddingHorizontal: theme.tokens.spacing.md,
        marginTop: theme.tokens.spacing.md,
    },
});
