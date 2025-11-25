import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PropertyListScreen from "../screens/Property/PropertyListScreen";
import PropertyDetailScreen from "../screens/Property/PropertyDetailScreen";
import PostPropertyScreen from "../screens/Property/PostPropertyScreen";
import MapPickerScreen from "../screens/Map/MapPickerScreen";
import MapScreen from "../screens/Map/MapScreen";
import PropertyMapScreen from "../screens/Map/PropertyMapScreen";
import ChatListScreen from "../screens/Chat/ChatListScreen";
import ChatScreen from "../screens/Chat/ChatScreen";
import FavoritesScreen from "../screens/Property/FavoritesScreen";
import AccountScreen from "../screens/Account/AccountScreen";
import EditAvatarScreen from "../screens/Account/EditAvatarScreen";
import LoginScreen from "../screens/Auth/LoginScreen";
import SignupScreen from "../screens/Auth/SignupScreen";
import RentManagerScreen from "../screens/Rent/RentManagerScreen";
import { MaterialIcons } from "@expo/vector-icons";
import BottomTabBar from "../components/BottomTabBar";
import AppHeader from "../components/AppHeader";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="HomeList"
                component={PropertyListScreen}
                options={{
                    header: (props) => <AppHeader {...props} />,
                }}
                initialParams={{ mode: "home" }}
            />
            <Stack.Screen
                name="PropertyDetail"
                component={PropertyDetailScreen}
                options={{ title: "Property" }}
            />
            <Stack.Screen
                name="PropertyMapFull"
                component={PropertyMapScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="ExploreMap"
                component={MapScreen}
                options={{ title: "Map" }}
            />
        </Stack.Navigator>
    );
}

function PostsStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="PostsList"
                component={PropertyListScreen}
                options={{
                    headerShown: false,
                }}
                initialParams={{ mode: "posts" }}
            />
            <Stack.Screen
                name="PostProperty"
                component={PostPropertyScreen}
                options={{ title: "Post Property" }}
            />
            <Stack.Screen
                name="MapPicker"
                component={MapPickerScreen}
                options={{ title: "Pick location" }}
            />
            <Stack.Screen
                name="PropertyDetail"
                component={PropertyDetailScreen}
                options={{ title: "Property" }}
            />
            <Stack.Screen
                name="ExploreMap"
                component={MapScreen}
                options={{ title: "Map" }}
            />
        </Stack.Navigator>
    );
}

function ChatStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="ChatList" component={ChatListScreen} options={{ title: "Messages" }} />
            <Stack.Screen name="Chat" component={ChatScreen} options={{ title: "Chat" }} />
        </Stack.Navigator>
    );
}

function AccountStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="AccountMain"
                component={AccountScreen}
                options={{ title: "Account" }}
            />
            <Stack.Screen
                name="EditAvatar"
                component={EditAvatarScreen}
                options={{ title: "Profile photo" }}
            />
            <Stack.Screen
                name="RentManager"
                component={RentManagerScreen}
                options={{ title: "Smart Rent Manager" }}
            />
            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ title: "Sign in" }}
            />
            <Stack.Screen
                name="Signup"
                component={SignupScreen}
                options={{ title: "Create account" }}
            />
        </Stack.Navigator>
    );
}

export default function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{ headerShown: false }}
            tabBar={(props) => <BottomTabBar {...props} />}
        >
            <Tab.Screen
                name="Home"
                component={HomeStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Posts"
                component={PostsStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="dynamic-feed" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Chats"
                component={ChatStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="chat" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Favorites"
                component={FavoritesScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons
                            name="favorite"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Account"
                component={AccountStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons
                            name="person"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
