import React from "react";
import { StyleSheet } from "react-native";
import { Card, IconButton, Paragraph, Title } from "react-native-paper";

export default function PropertyCard({
    property,
    onPress,
    onToggleFav,
    isFav,
}) {
    return (
        <Card style={styles.card} onPress={onPress}>
            <Card.Cover
                source={
                    property.images && property.images.length > 0
                        ? { uri: property.images[0] }
                        : require("../../../assets/icon.png")
                }
                resizeMode="cover"
            />
            <Card.Content>
                <Title>{property.title}</Title>
                <Paragraph style={styles.price}>${property.price}</Paragraph>
            </Card.Content>
            <IconButton
                icon={isFav ? "heart" : "heart-outline"}
                color={isFav ? "red" : undefined}
                onPress={onToggleFav}
                style={styles.fav}
            />
        </Card>
    );
}

const styles = StyleSheet.create({
    card: { marginVertical: 8, borderRadius: 8, overflow: "hidden" },
    price: { color: "#0066ff", marginTop: 6 },
    fav: { position: "absolute", right: 8, top: 8 },
});
