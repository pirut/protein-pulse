import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider as PaperProvider, Icon } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

import HomeScreen from "./src/screens/HomeScreen";
import SavedFoodsScreen from "./src/screens/SavedFoodsScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import AuthScreen from "./src/screens/AuthScreen";
import { ThemeProvider, usePaperTheme } from "./src/theme-context";
import { supabase } from "./src/services/supabase";

const Tab = createBottomTabNavigator();

function AppShell() {
    const theme = usePaperTheme();
    const [isAuthed, setIsAuthed] = useState<boolean>(false);

    useEffect(() => {
        if (!supabase) return;
        supabase.auth.getSession().then(({ data }) => setIsAuthed(!!data.session));
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => setIsAuthed(!!session));
        return () => {
            sub.subscription?.unsubscribe();
        };
    }, []);

    if (!isAuthed) {
        return (
            <PaperProvider theme={theme}>
                <AuthScreen onAuthenticated={() => setIsAuthed(true)} />
            </PaperProvider>
        );
    }

    return (
        <PaperProvider theme={theme}>
            <NavigationContainer>
                <Tab.Navigator
                    screenOptions={{
                        tabBarActiveTintColor: theme.colors.primary,
                        tabBarInactiveTintColor: theme.colors.outline,
                        headerStyle: {
                            backgroundColor: theme.colors.background,
                        },
                        headerTintColor: theme.colors.onBackground,
                        headerTitleStyle: { fontSize: theme.custom.headerTitleSize },
                        tabBarStyle: {
                            backgroundColor: theme.colors.surface,
                            borderTopWidth: 1,
                            borderTopColor: theme.colors.outline,
                            height: 60,
                        },
                        tabBarLabelStyle: {
                            paddingBottom: 6,
                        },
                    }}
                >
                    <Tab.Screen
                        name="Home"
                        component={HomeScreen}
                        options={{
                            title: "Protein Pulse",
                            tabBarLabel: "Home",
                            tabBarIcon: ({ color, size }) => <Icon source="home-variant-outline" size={size} color={color} />,
                        }}
                    />
                    <Tab.Screen
                        name="SavedFoods"
                        component={SavedFoodsScreen}
                        options={{
                            title: "Saved Foods",
                            tabBarLabel: "Saved",
                            tabBarIcon: ({ color, size }) => <Icon source="food-outline" size={size} color={color} />,
                        }}
                    />
                    <Tab.Screen
                        name="Profile"
                        component={ProfileScreen}
                        options={{
                            title: "Profile",
                            tabBarLabel: "Profile",
                            tabBarIcon: ({ color, size }) => <Icon source="account-circle-outline" size={size} color={color} />,
                        }}
                    />
                </Tab.Navigator>
            </NavigationContainer>
        </PaperProvider>
    );
}

export default function App() {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <AppShell />
            </ThemeProvider>
        </SafeAreaProvider>
    );
}
