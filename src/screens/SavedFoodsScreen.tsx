import React, { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Text, Card, Button, FAB, List, IconButton, Searchbar, Portal, Modal, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { repository } from "../services/repository";
import { SavedFood } from "../types";
import { usePaperTheme } from "../theme-context";
import EmptyState from "../components/EmptyState";

export default function SavedFoodsScreen() {
    const [savedFoods, setSavedFoods] = useState<SavedFood[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingFood, setEditingFood] = useState<SavedFood | null>(null);
    const [newFoodName, setNewFoodName] = useState("");
    const [newProteinAmount, setNewProteinAmount] = useState("");
    const theme = usePaperTheme();

    useEffect(() => {
        loadSavedFoods();
    }, []);

    const loadSavedFoods = async () => {
        const foods = await repository.getSavedFoods();
        setSavedFoods(foods);
    };

    const handleAddFood = async () => {
        const name = newFoodName.trim();
        const amount = parseFloat(newProteinAmount);

        if (!name || isNaN(amount) || amount <= 0) {
            return;
        }

        const newFood: SavedFood = {
            id: Date.now().toString(),
            name,
            defaultProteinAmount: amount,
            createdAt: new Date(),
        };

        await repository.addSavedFood(newFood);
        await loadSavedFoods();

        setNewFoodName("");
        setNewProteinAmount("");
        setIsAddModalVisible(false);
    };

    const handleEditFood = async () => {
        if (!editingFood) return;

        const name = newFoodName.trim();
        const amount = parseFloat(newProteinAmount);

        if (!name || isNaN(amount) || amount <= 0) {
            return;
        }

        // Simple approach: delete and recreate
        await repository.deleteSavedFood(editingFood.id);

        const updatedFood: SavedFood = {
            id: Date.now().toString(),
            name,
            defaultProteinAmount: amount,
            createdAt: editingFood.createdAt,
        };

        await repository.addSavedFood(updatedFood);
        await loadSavedFoods();

        setEditingFood(null);
        setNewFoodName("");
        setNewProteinAmount("");
        setIsEditModalVisible(false);
    };

    const handleDeleteFood = (food: SavedFood) => {
        Alert.alert("Delete Saved Food", `Are you sure you want to delete "${food.name}"?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    await repository.deleteSavedFood(food.id);
                    await loadSavedFoods();
                },
            },
        ]);
    };

    const handleEdit = (food: SavedFood) => {
        setEditingFood(food);
        setNewFoodName(food.name);
        setNewProteinAmount(food.defaultProteinAmount.toString());
        setIsEditModalVisible(true);
    };

    const filteredFoods = savedFoods.filter((food) => food.name.toLowerCase().includes(searchQuery.toLowerCase()));

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
                searchCard: {
                    marginBottom: theme.custom.spacing,
                    borderRadius: theme.custom.radius,
                    backgroundColor: theme.colors.surface,
                },
                searchbar: {
                    borderRadius: 8,
                    backgroundColor: theme.colors.surfaceVariant,
                },
                foodsCard: {
                    marginBottom: theme.custom.spacing,
                    borderRadius: theme.custom.radius,
                    backgroundColor: theme.colors.surface,
                },
                sectionTitle: {
                    ...theme.custom.typography.h4,
                    marginBottom: theme.custom.smallSpacing,
                    color: theme.colors.onSurface,
                },
                foodItem: {
                    paddingVertical: 4,
                },
                actionButtons: {
                    flexDirection: "row",
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

    // Show empty state if no saved foods and no search query
    if (savedFoods.length === 0 && !searchQuery) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <EmptyState
                        title="No Saved Foods Yet"
                        description="Start by adding your favorite foods to make logging protein quick and easy."
                        actionText="Add Your First Food"
                        onAction={() => setIsAddModalVisible(true)}
                        icon="🍽️"
                    />
                </View>
                {/* Add Food Modal */}
                <Portal>
                    <Modal visible={isAddModalVisible} onDismiss={() => setIsAddModalVisible(false)} contentContainerStyle={styles.modal}>
                        <Card style={styles.modalCard}>
                            <Card.Content>
                                <Text style={styles.modalTitle}>Add New Saved Food</Text>

                                <TextInput label="Food Name" value={newFoodName} onChangeText={setNewFoodName} style={styles.input} mode="outlined" />

                                <TextInput
                                    label="Default Protein Amount (g)"
                                    value={newProteinAmount}
                                    onChangeText={setNewProteinAmount}
                                    keyboardType="numeric"
                                    style={styles.input}
                                    mode="outlined"
                                />

                                <View style={styles.buttonContainer}>
                                    <Button mode="outlined" onPress={() => setIsAddModalVisible(false)} style={[styles.button, styles.cancelButton]}>
                                        Cancel
                                    </Button>
                                    <Button
                                        mode="contained"
                                        onPress={handleAddFood}
                                        disabled={!newFoodName.trim() || !parseFloat(newProteinAmount) || parseFloat(newProteinAmount) <= 0}
                                        style={[styles.button, styles.saveButton]}
                                    >
                                        Save
                                    </Button>
                                </View>
                            </Card.Content>
                        </Card>
                    </Modal>
                </Portal>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.content}>
                    {/* Search Section */}
                    <Card style={styles.searchCard}>
                        <Card.Content>
                            <Searchbar placeholder="Search saved foods..." onChangeText={setSearchQuery} value={searchQuery} style={styles.searchbar} />
                        </Card.Content>
                    </Card>

                    {/* Saved Foods List */}
                    <Card style={styles.foodsCard}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>Saved Foods ({filteredFoods.length})</Text>
                            {filteredFoods.length > 0 ? (
                                filteredFoods.map((food) => (
                                    <List.Item
                                        key={food.id}
                                        title={food.name}
                                        description={`Default: ${food.defaultProteinAmount}g protein`}
                                        right={() => (
                                            <View style={styles.actionButtons}>
                                                <IconButton icon="pencil" size={20} onPress={() => handleEdit(food)} />
                                                <IconButton icon="delete" size={20} onPress={() => handleDeleteFood(food)} iconColor="#E74C3C" />
                                            </View>
                                        )}
                                        style={styles.foodItem}
                                    />
                                ))
                            ) : (
                                <Text style={styles.emptyText}>{searchQuery ? "No foods match your search" : "No saved foods yet"}</Text>
                            )}
                        </Card.Content>
                    </Card>
                </View>
            </ScrollView>

            {/* FAB for adding food */}
            <FAB icon="plus" style={styles.fab} onPress={() => setIsAddModalVisible(true)} />

            {/* Add Food Modal */}
            <Portal>
                <Modal visible={isAddModalVisible} onDismiss={() => setIsAddModalVisible(false)} contentContainerStyle={styles.modal}>
                    <Card style={styles.modalCard}>
                        <Card.Content>
                            <Text style={styles.modalTitle}>Add New Saved Food</Text>

                            <TextInput label="Food Name" value={newFoodName} onChangeText={setNewFoodName} style={styles.input} mode="outlined" />

                            <TextInput
                                label="Default Protein Amount (g)"
                                value={newProteinAmount}
                                onChangeText={setNewProteinAmount}
                                keyboardType="numeric"
                                style={styles.input}
                                mode="outlined"
                            />

                            <View style={styles.buttonContainer}>
                                <Button mode="outlined" onPress={() => setIsAddModalVisible(false)} style={[styles.button, styles.cancelButton]}>
                                    Cancel
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={handleAddFood}
                                    disabled={!newFoodName.trim() || !parseFloat(newProteinAmount) || parseFloat(newProteinAmount) <= 0}
                                    style={[styles.button, styles.saveButton]}
                                >
                                    Save
                                </Button>
                            </View>
                        </Card.Content>
                    </Card>
                </Modal>
            </Portal>

            {/* Edit Food Modal */}
            <Portal>
                <Modal visible={isEditModalVisible} onDismiss={() => setIsEditModalVisible(false)} contentContainerStyle={styles.modal}>
                    <Card style={styles.modalCard}>
                        <Card.Content>
                            <Text style={styles.modalTitle}>Edit Saved Food</Text>

                            <TextInput label="Food Name" value={newFoodName} onChangeText={setNewFoodName} style={styles.input} mode="outlined" />

                            <TextInput
                                label="Default Protein Amount (g)"
                                value={newProteinAmount}
                                onChangeText={setNewProteinAmount}
                                keyboardType="numeric"
                                style={styles.input}
                                mode="outlined"
                            />

                            <View style={styles.buttonContainer}>
                                <Button mode="outlined" onPress={() => setIsEditModalVisible(false)} style={[styles.button, styles.cancelButton]}>
                                    Cancel
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={handleEditFood}
                                    disabled={!newFoodName.trim() || !parseFloat(newProteinAmount) || parseFloat(newProteinAmount) <= 0}
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
