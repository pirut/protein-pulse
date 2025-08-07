import React, { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Modal, Portal, Text, TextInput, Button, Checkbox, Card } from "react-native-paper";
import { SavedFood } from "../types";
import { usePaperTheme } from "../theme-context";

interface AddFoodModalProps {
    visible: boolean;
    onDismiss: () => void;
    onAdd: (foodName: string, proteinAmount: number, saveFood: boolean) => void;
    savedFood?: SavedFood | null;
}

export default function AddFoodModal({ visible, onDismiss, onAdd, savedFood }: AddFoodModalProps) {
    const [foodName, setFoodName] = useState("");
    const [proteinAmount, setProteinAmount] = useState("");
    const [saveFood, setSaveFood] = useState(false);
    const theme = usePaperTheme();

    useEffect(() => {
        if (savedFood) {
            setFoodName(savedFood.name);
            setProteinAmount(savedFood.defaultProteinAmount.toString());
        } else {
            setFoodName("");
            setProteinAmount("");
            setSaveFood(false);
        }
    }, [savedFood, visible]);

    const handleSubmit = () => {
        const name = foodName.trim();
        const amount = parseFloat(proteinAmount);

        if (!name) {
            return;
        }

        if (isNaN(amount) || amount <= 0) {
            return;
        }

        onAdd(name, amount, saveFood);
    };

    const isValid = foodName.trim() && !isNaN(parseFloat(proteinAmount)) && parseFloat(proteinAmount) > 0;

    const styles = useMemo(
        () =>
            StyleSheet.create({
                modal: {
                    flex: 1,
                    justifyContent: "center",
                    padding: 20,
                },
                card: {
                    borderRadius: theme.custom.radius,
                    backgroundColor: theme.colors.surface,
                },
                title: {
                    textAlign: "center",
                    marginBottom: 24,
                    color: theme.colors.onSurface,
                },
                input: {
                    marginBottom: 16,
                },
                checkboxContainer: {
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 24,
                },
                checkboxLabel: {
                    marginLeft: 8,
                    color: theme.colors.onSurface,
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

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="headlineSmall" style={styles.title}>
                            {savedFood ? "Quick Add Food" : "Add Food Entry"}
                        </Text>

                        <TextInput label="Food Name" value={foodName} onChangeText={setFoodName} style={styles.input} mode="outlined" />

                        <TextInput
                            label="Protein Amount (g)"
                            value={proteinAmount}
                            onChangeText={setProteinAmount}
                            keyboardType="numeric"
                            style={styles.input}
                            mode="outlined"
                        />

                        {!savedFood && (
                            <View style={styles.checkboxContainer}>
                                <Checkbox status={saveFood ? "checked" : "unchecked"} onPress={() => setSaveFood(!saveFood)} />
                                <Text style={styles.checkboxLabel}>Save this food for future use</Text>
                            </View>
                        )}

                        <View style={styles.buttonContainer}>
                            <Button mode="outlined" onPress={onDismiss} style={[styles.button, styles.cancelButton]}>
                                Cancel
                            </Button>
                            <Button mode="contained" onPress={handleSubmit} disabled={!isValid} style={[styles.button, styles.saveButton]}>
                                Save & Log
                            </Button>
                        </View>
                    </Card.Content>
                </Card>
            </Modal>
        </Portal>
    );
}
