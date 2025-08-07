import React, { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Text, Card, Button, Searchbar, Chip, FAB, ProgressBar, List, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { repository } from "../services/repository";
import { FoodEntry, SavedFood, UserProfile, DailyLog } from "../types";
import AddFoodModal from "../components/AddFoodModal";
import RingChart from "../components/RingChart";
import { usePaperTheme } from "../theme-context";

export default function HomeScreen() {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
    const [savedFoods, setSavedFoods] = useState<SavedFood[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [selectedSavedFood, setSelectedSavedFood] = useState<SavedFood | null>(null);
    const theme = usePaperTheme();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const profile = await repository.getUserProfile();
        setUserProfile(profile);

        const today = new Date().toISOString().split("T")[0];
        const log = await repository.getDailyLog(today);
        setDailyLog(log);

        const foods = await repository.getSavedFoods();
        setSavedFoods(foods);
    };

    const handleAddFood = async (foodName: string, proteinAmount: number, saveFood: boolean) => {
        const entry: FoodEntry = {
            id: Date.now().toString(),
            name: foodName,
            proteinAmount,
            timeEaten: new Date(),
            createdAt: new Date(),
        };

        await repository.addFoodEntry(entry);

        if (saveFood) {
            const savedFood: SavedFood = {
                id: Date.now().toString(),
                name: foodName,
                defaultProteinAmount: proteinAmount,
                createdAt: new Date(),
            };
            await repository.addSavedFood(savedFood);
            setSavedFoods((prev) => [...prev, savedFood]);
        }

        await loadData();
        setIsAddModalVisible(false);
    };

    const handleQuickAdd = (food: SavedFood) => {
        setSelectedSavedFood(food);
        setIsAddModalVisible(true);
    };

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const progress = userProfile && dailyLog ? Math.min(dailyLog.totalProtein / userProfile.dailyProteinGoal, 1) : 0;

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
                statsHeader: {
                    marginBottom: theme.custom.spacing,
                    borderRadius: theme.custom.radius,
                    backgroundColor: theme.colors.surface,
                    padding: theme.custom.spacing,
                },
                statsContent: {
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                },
                statsText: {
                    flex: 1,
                    marginLeft: theme.custom.spacing,
                },
                statsTitle: {
                    ...theme.custom.typography.h3,
                    color: theme.colors.onSurface,
                    marginBottom: theme.custom.smallSpacing,
                },
                statsSubtitle: {
                    ...theme.custom.typography.body,
                    color: theme.colors.outline,
                    marginBottom: theme.custom.smallSpacing,
                },
                progressCard: {
                    marginBottom: theme.custom.spacing,
                    borderRadius: theme.custom.radius,
                    backgroundColor: theme.colors.surface,
                },
                progressTitle: {
                    ...theme.custom.typography.h4,
                    textAlign: "center",
                    marginBottom: theme.custom.smallSpacing,
                    color: theme.colors.onSurface,
                },
                progressContainer: {
                    alignItems: "center",
                },
                progressText: {
                    ...theme.custom.typography.h2,
                    marginBottom: theme.custom.smallSpacing,
                    color: theme.colors.onSurface,
                },
                progressBar: {
                    width: "100%",
                    height: 8,
                    borderRadius: 4,
                },
                searchCard: {
                    marginBottom: theme.custom.spacing,
                    borderRadius: theme.custom.radius,
                    backgroundColor: theme.colors.surface,
                },
                searchbar: {
                    borderRadius: 8,
                    backgroundColor: theme.colors.surfaceVariant,
                },
                savedFoodsCard: {
                    marginBottom: theme.custom.spacing,
                    borderRadius: theme.custom.radius,
                    backgroundColor: theme.colors.surface,
                },
                sectionTitle: {
                    ...theme.custom.typography.h4,
                    marginBottom: theme.custom.smallSpacing,
                    color: theme.colors.onSurface,
                },
                chipContainer: {
                    flexDirection: "row",
                    paddingVertical: 8,
                },
                chip: {
                    marginRight: 8,
                    backgroundColor: theme.colors.primary + "22",
                    borderColor: theme.colors.primary,
                    borderWidth: 1,
                },
                chipText: {
                    color: theme.colors.onSurface,
                },
                logCard: {
                    marginBottom: theme.custom.spacing,
                    borderRadius: theme.custom.radius,
                    backgroundColor: theme.colors.surface,
                },
                logItem: {
                    paddingVertical: 4,
                },
                proteinAmount: {
                    fontWeight: "bold",
                    color: theme.colors.primary,
                },
                emptyText: {
                    ...theme.custom.typography.body,
                    textAlign: "center",
                    color: theme.colors.outline,
                    fontStyle: "italic",
                    paddingVertical: 20,
                },
                fab: {
                    position: "absolute",
                    margin: theme.custom.spacing,
                    right: 0,
                    bottom: 0,
                    backgroundColor: theme.colors.primary,
                },
            }),
        [theme]
    );

    const filteredSavedFoods = savedFoods.filter((food) => food.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.content}>
                    {/* Stats Header with Ring Chart */}
                    <Card style={styles.statsHeader}>
                        <Card.Content>
                            <View style={styles.statsContent}>
                                <View style={styles.statsText}>
                                    <Text style={styles.statsTitle}>Today's Progress</Text>
                                    <Text style={styles.statsSubtitle}>
                                        {dailyLog?.totalProtein || 0}g / {userProfile?.dailyProteinGoal || 160}g protein
                                    </Text>
                                </View>
                                <RingChart progress={progress} size={80} strokeWidth={6} />
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Search Section */}
                    <Card style={styles.searchCard}>
                        <Card.Content>
                            <Searchbar placeholder="Search saved foods..." onChangeText={setSearchQuery} value={searchQuery} style={styles.searchbar} />
                        </Card.Content>
                    </Card>

                    {/* Saved Foods Section */}
                    {filteredSavedFoods.length > 0 && (
                        <Card style={styles.savedFoodsCard}>
                            <Card.Content>
                                <Text style={styles.sectionTitle}>Quick Add</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View style={styles.chipContainer}>
                                        {filteredSavedFoods.map((food) => (
                                            <Chip key={food.id} onPress={() => handleQuickAdd(food)} style={styles.chip} textStyle={styles.chipText}>
                                                {food.name} ({food.defaultProteinAmount}g)
                                            </Chip>
                                        ))}
                                    </View>
                                </ScrollView>
                            </Card.Content>
                        </Card>
                    )}

                    {/* Today's Log Section */}
                    <Card style={styles.logCard}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>Today's Log</Text>
                            {dailyLog?.entries && dailyLog.entries.length > 0 ? (
                                dailyLog.entries
                                    .sort((a, b) => new Date(b.timeEaten).getTime() - new Date(a.timeEaten).getTime())
                                    .map((entry) => (
                                        <List.Item
                                            key={entry.id}
                                            title={entry.name}
                                            description={`🕗 ${formatTime(entry.timeEaten)}`}
                                            right={() => <Text style={styles.proteinAmount}>{entry.proteinAmount}g</Text>}
                                            style={styles.logItem}
                                        />
                                    ))
                            ) : (
                                <Text style={styles.emptyText}>No entries yet today</Text>
                            )}
                        </Card.Content>
                    </Card>
                </View>
            </ScrollView>

            {/* FAB for adding food */}
            <FAB icon="plus" style={styles.fab} onPress={() => setIsAddModalVisible(true)} />

            {/* Add Food Modal */}
            <AddFoodModal visible={isAddModalVisible} onDismiss={() => setIsAddModalVisible(false)} onAdd={handleAddFood} savedFood={selectedSavedFood} />
        </SafeAreaView>
    );
}
