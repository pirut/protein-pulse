import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  FAB,
  List,
  IconButton,
  Searchbar,
  Portal,
  Modal,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StorageService } from '../services/storage';
import { SavedFood } from '../types';

export default function SavedFoodsScreen() {
  const [savedFoods, setSavedFoods] = useState<SavedFood[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingFood, setEditingFood] = useState<SavedFood | null>(null);
  const [newFoodName, setNewFoodName] = useState('');
  const [newProteinAmount, setNewProteinAmount] = useState('');

  useEffect(() => {
    loadSavedFoods();
  }, []);

  const loadSavedFoods = async () => {
    const foods = await StorageService.getSavedFoods();
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

    await StorageService.addSavedFood(newFood);
    await loadSavedFoods();
    
    setNewFoodName('');
    setNewProteinAmount('');
    setIsAddModalVisible(false);
  };

  const handleEditFood = async () => {
    if (!editingFood) return;

    const name = newFoodName.trim();
    const amount = parseFloat(newProteinAmount);

    if (!name || isNaN(amount) || amount <= 0) {
      return;
    }

    // For simplicity, we'll delete and recreate the food
    await StorageService.deleteSavedFood(editingFood.id);
    
    const updatedFood: SavedFood = {
      id: Date.now().toString(),
      name,
      defaultProteinAmount: amount,
      createdAt: editingFood.createdAt,
    };

    await StorageService.addSavedFood(updatedFood);
    await loadSavedFoods();
    
    setEditingFood(null);
    setNewFoodName('');
    setNewProteinAmount('');
    setIsEditModalVisible(false);
  };

  const handleDeleteFood = (food: SavedFood) => {
    Alert.alert(
      'Delete Saved Food',
      `Are you sure you want to delete "${food.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await StorageService.deleteSavedFood(food.id);
            await loadSavedFoods();
          },
        },
      ]
    );
  };

  const handleEdit = (food: SavedFood) => {
    setEditingFood(food);
    setNewFoodName(food.name);
    setNewProteinAmount(food.defaultProteinAmount.toString());
    setIsEditModalVisible(true);
  };

  const filteredFoods = savedFoods.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Search Section */}
        <Card style={styles.searchCard}>
          <Card.Content>
            <Searchbar
              placeholder="Search saved foods..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
            />
          </Card.Content>
        </Card>

        {/* Saved Foods List */}
        <Card style={styles.foodsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Saved Foods ({filteredFoods.length})
            </Text>
            {filteredFoods.length > 0 ? (
              filteredFoods.map((food) => (
                <List.Item
                  key={food.id}
                  title={food.name}
                  description={`Default: ${food.defaultProteinAmount}g protein`}
                  right={() => (
                    <View style={styles.actionButtons}>
                      <IconButton
                        icon="pencil"
                        size={20}
                        onPress={() => handleEdit(food)}
                      />
                      <IconButton
                        icon="delete"
                        size={20}
                        onPress={() => handleDeleteFood(food)}
                        iconColor="#E74C3C"
                      />
                    </View>
                  )}
                  style={styles.foodItem}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>
                {searchQuery ? 'No foods match your search' : 'No saved foods yet'}
              </Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* FAB for adding food */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setIsAddModalVisible(true)}
      />

      {/* Add Food Modal */}
      <Portal>
        <Modal
          visible={isAddModalVisible}
          onDismiss={() => setIsAddModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Card style={styles.modalCard}>
            <Card.Content>
              <Text variant="headlineSmall" style={styles.modalTitle}>
                Add New Saved Food
              </Text>
              
              <TextInput
                label="Food Name"
                value={newFoodName}
                onChangeText={setNewFoodName}
                style={styles.input}
                mode="outlined"
              />
              
              <TextInput
                label="Default Protein Amount (g)"
                value={newProteinAmount}
                onChangeText={setNewProteinAmount}
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
              />
              
              <View style={styles.buttonContainer}>
                <Button
                  mode="outlined"
                  onPress={() => setIsAddModalVisible(false)}
                  style={[styles.button, styles.cancelButton]}
                >
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
        <Modal
          visible={isEditModalVisible}
          onDismiss={() => setIsEditModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Card style={styles.modalCard}>
            <Card.Content>
              <Text variant="headlineSmall" style={styles.modalTitle}>
                Edit Saved Food
              </Text>
              
              <TextInput
                label="Food Name"
                value={newFoodName}
                onChangeText={setNewFoodName}
                style={styles.input}
                mode="outlined"
              />
              
              <TextInput
                label="Default Protein Amount (g)"
                value={newProteinAmount}
                onChangeText={setNewProteinAmount}
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
              />
              
              <View style={styles.buttonContainer}>
                <Button
                  mode="outlined"
                  onPress={() => setIsEditModalVisible(false)}
                  style={[styles.button, styles.cancelButton]}
                >
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  searchCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  searchbar: {
    borderRadius: 8,
  },
  foodsCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    marginBottom: 12,
    color: '#2C3E50',
    fontWeight: '600',
  },
  foodItem: {
    paddingVertical: 4,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  emptyText: {
    textAlign: 'center',
    color: '#95A5A6',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#87CEEB',
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 12,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#2C3E50',
  },
  input: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    borderColor: '#95A5A6',
  },
  saveButton: {
    backgroundColor: '#87CEEB',
  },
}); 