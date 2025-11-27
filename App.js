import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import RootNavigator from "./src/navigation/RootNavigator";
import { Provider as PaperProvider } from "react-native-paper";
import theme from "./src/theme/theme";
import { AuthProvider } from "./src/context/AuthContext";
import { ToastProvider } from "./src/context/ToastContext";
import { UnreadProvider } from "./src/context/UnreadContext";
import { useFonts } from "@expo-google-fonts/poppins";
import {
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
} from "@expo-google-fonts/poppins";

export default function App() {
    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_600SemiBold,
        Poppins_700Bold,
    });

    if (!fontsLoaded) return null;

    return (
        <PaperProvider theme={theme.paperTheme}>
            <SafeAreaProvider>
                <AuthProvider>
                    <UnreadProvider>
                        <ToastProvider>
                            <NavigationContainer>
                                <RootNavigator />
                            </NavigationContainer>
                        </ToastProvider>
                    </UnreadProvider>
                </AuthProvider>
                <StatusBar style="dark" backgroundColor="#F8FAFC" />
            </SafeAreaProvider>
        </PaperProvider>
    );
}
