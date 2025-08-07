import React, { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Text, Card, Button, List, Switch, TextInput, Portal, Modal } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { repository } from "../services/repository";
import { UserProfile } from "../types";
import { usePaperTheme, useThemeMode } from "../theme-context";

export default function ProfileScreen() {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
    const [newGoal, setNewGoal] = useState("");
    const theme = usePaperTheme();
    const { setMode } = useThemeMode();

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        const profile = await repository.getUserProfile();
        setUserProfile(profile);
    };

    const handleUpdateGoal = async () => {
        const goal = parseFloat(newGoal);
        if (isNaN(goal) || goal <= 0) {
            return;
        }

        await repository.updateUserProfile({ dailyProteinGoal: goal });
        await loadUserProfile();
        setNewGoal("");
        setIsGoalModalVisible(false);
    };

    const handleToggleTheme = async () => {
        if (!userProfile) return;

        const newTheme = userProfile.theme === "light" ? "dark" : "light";
        await repository.updateUserProfile({ theme: newTheme });
        await loadUserProfile();
        setMode(newTheme);
    };

    const handleToggleUnits = async () => {
        if (!userProfile) return;

        const newUnits = userProfile.units === "grams" ? "ounces" : "grams";
        await repository.updateUserProfile({ units: newUnits });
        await loadUserProfile();
    };

    const handleLogout = () => {
        Alert.alert("Logout", "Are you sure you want to logout? This will clear all local data.", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                    await repository.updateUserProfile({
                        dailyProteinGoal: 160,
                        isSynced: false,
                        units: "grams",
                        theme: "light",
                    });
                    await loadUserProfile();
                },
            },
        ]);
    };

    const styles = useMemo(
        () =>
            StyleSheet.create({
                container: {
                    flex: 1,
                    backgroundColor: theme.colors.background,
                },
                scrollView: {
                    flex: 1,
                },
                content: {
                    padding: theme.custom.spacing,
                    paddingBottom: theme.custom.spacing * 4,
                    maxWidth: 820,
                    width: "100%",
                    alignSelf: "center",
                },
                loadingContainer: {
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                },
                card: {
                    marginBottom: theme.custom.spacing,
                    borderRadius: theme.custom.radius,
                    backgroundColor: theme.colors.surface,
                },
                sectionTitle: {
                    ...theme.custom.typography.h4,
                    marginBottom: theme.custom.smallSpacing,
                    color: theme.colors.onSurface,
                },
                listItem: {
                    paddingVertical: 4,
                },
                logoutButton: {
                    borderColor: "#E74C3C",
                    marginTop: 8,
                },
                modal: {
                    flex: 1,
                    justifyContent: "center",
                    padding: 20,
                },
                modalCard: {
                    borderRadius: theme.custom.radius,
                    backgroundColor: theme.colors.surface,
                },
                modalTitle: {
                    ...theme.custom.typography.h3,
                    textAlign: "center",
                    marginBottom: 24,
                    color: theme.colors.onSurface,
                },
                input: {
                    marginBottom: 16,
                },
                buttonContainer: {
                    flexDirection: "row",
                    justifyContent: "space-between",
                },
                button: {
                    flex: 1,
                    marginHorizontal: 4,
                },
                cancelButton: {
                    borderColor: theme.colors.outline,
                },
                saveButton: {
                    backgroundColor: theme.colors.primary,
                },
            }),
        [theme]
    );

    if (!userProfile) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={{ ...theme.custom.typography.body, color: theme.colors.onSurface }}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.content}>
                    {/* Daily Protein Goal */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>Daily Protein Goal</Text>
                            <List.Item
                                title={`${userProfile.dailyProteinGoal} ${userProfile.units}`}
                                description="Tap to change your daily protein goal"
                                left={(props) => <List.Icon {...props} icon="target" />}
                                onPress={() => {
                                    setNewGoal(userProfile.dailyProteinGoal.toString());
                                    setIsGoalModalVisible(true);
                                }}
                                style={styles.listItem}
                            />
                        </Card.Content>
                    </Card>

                    {/* Sync Status */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>Sync & Account</Text>
                            <List.Item
                                title={userProfile.email || "Not signed in"}
                                description={userProfile.isSynced ? "✔ Synced" : "⚠ Offline"}
                                left={(props) => <List.Icon {...props} icon="account" />}
                                style={styles.listItem}
                            />
                        </Card.Content>
                    </Card>

                    {/* Preferences */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>Preferences</Text>

                            <List.Item
                                title="Units"
                                description={`Currently using ${userProfile.units}`}
                                left={(props) => <List.Icon {...props} icon="ruler" />}
                                right={() => <Switch value={userProfile.units === "ounces"} onValueChange={handleToggleUnits} />}
                                style={styles.listItem}
                            />

                            <List.Item
                                title="Dark Mode"
                                description="Toggle between light and dark themes"
                                left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
                                right={() => <Switch value={userProfile.theme === "dark"} onValueChange={handleToggleTheme} />}
                                style={styles.listItem}
                            />
                        </Card.Content>
                    </Card>

                    {/* Actions */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>Actions</Text>

                            <Button mode="outlined" onPress={handleLogout} style={styles.logoutButton} textColor="#E74C3C">
                                Logout
                            </Button>
                        </Card.Content>
                    </Card>
                </View>
            </ScrollView>

            {/* Goal Update Modal */}
            <Portal>
                <Modal visible={isGoalModalVisible} onDismiss={() => setIsGoalModalVisible(false)} contentContainerStyle={styles.modal}>
                    <Card style={styles.modalCard}>
                        <Card.Content>
                            <Text style={styles.modalTitle}>Update Daily Protein Goal</Text>

                            <TextInput
                                label={`Goal (${userProfile.units})`}
                                value={newGoal}
                                onChangeText={setNewGoal}
                                keyboardType="numeric"
                                style={styles.input}
                                mode="outlined"
                            />

                            <View style={styles.buttonContainer}>
                                <Button mode="outlined" onPress={() => setIsGoalModalVisible(false)} style={[styles.button, styles.cancelButton]}>
                                    Cancel
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={handleUpdateGoal}
                                    disabled={!newGoal.trim() || !parseFloat(newGoal) || parseFloat(newGoal) <= 0}
                                    style={[styles.button, styles.saveButton]}
                                >
                                    Update
                                </Button>
                            </View>
                        </Card.Content>
                    </Card>
                </Modal>
            </Portal>
        </SafeAreaView>
    );
}
