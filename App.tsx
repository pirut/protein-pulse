import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

import HomeScreen from "./src/screens/HomeScreen";
import SavedFoodsScreen from "./src/screens/SavedFoodsScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

const Tab = createBottomTabNavigator();

// Custom theme with pastel colors as specified in the spec
const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: "#87CEEB", // Baby blue
        secondary: "#F4D03F", // Soft sand
        accent: "#98D8C8", // Mint green
        background: "#FFFFFF",
        surface: "#FFFFFF",
        text: "#2C3E50",
        placeholder: "#95A5A6",
    },
};

export default function App() {
    return (
        <SafeAreaProvider>
            <PaperProvider theme={theme}>
                <NavigationContainer>
                    <Tab.Navigator
                        screenOptions={{
                            tabBarActiveTintColor: theme.colors.primary,
                            tabBarInactiveTintColor: theme.colors.placeholder,
                            headerStyle: {
                                backgroundColor: theme.colors.background,
                            },
                            headerTintColor: theme.colors.text,
                            tabBarStyle: {
                                backgroundColor: theme.colors.background,
                                borderTopWidth: 1,
                                borderTopColor: "#E8E8E8",
                            },
                        }}
                    >
                        <Tab.Screen
                            name="Home"
                            component={HomeScreen}
                            options={{
                                title: "Protein Pulse",
                                tabBarLabel: "Home",
                            }}
                        />
                        <Tab.Screen
                            name="SavedFoods"
                            component={SavedFoodsScreen}
                            options={{
                                title: "Saved Foods",
                                tabBarLabel: "Saved",
                            }}
                        />
                        <Tab.Screen
                            name="Profile"
                            component={ProfileScreen}
                            options={{
                                title: "Profile",
                                tabBarLabel: "Profile",
                            }}
                        />
                    </Tab.Navigator>
                </NavigationContainer>
            </PaperProvider>
        </SafeAreaProvider>
    );
}
