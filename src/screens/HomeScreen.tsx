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
  Searchbar,
  Chip,
  FAB,
  ProgressBar,
  List,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StorageService } from '../services/storage';
import { FoodEntry, SavedFood, UserProfile, DailyLog } from '../types';
import AddFoodModal from '../components/AddFoodModal';

export default function HomeScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [savedFoods, setSavedFoods] = useState<SavedFood[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedSavedFood, setSelectedSavedFood] = useState<SavedFood | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const profile = await StorageService.getUserProfile();
    setUserProfile(profile);

    const today = new Date().toISOString().split('T')[0];
    const log = await StorageService.getDailyLog(today);
    setDailyLog(log);

    const foods = await StorageService.getSavedFoods();
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

    await StorageService.addFoodEntry(entry);

    if (saveFood) {
      const savedFood: SavedFood = {
        id: Date.now().toString(),
        name: foodName,
        defaultProteinAmount: proteinAmount,
        createdAt: new Date(),
      };
      await StorageService.addSavedFood(savedFood);
      setSavedFoods(prev => [...prev, savedFood]);
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
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const progress = userProfile && dailyLog 
    ? Math.min(dailyLog.totalProtein / userProfile.dailyProteinGoal, 1)
    : 0;

  const filteredSavedFoods = savedFoods.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Progress Section */}
        <Card style={styles.progressCard}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.progressTitle}>
              Today's Progress
            </Text>
            <View style={styles.progressContainer}>
              <Text variant="displaySmall" style={styles.progressText}>
                {dailyLog?.totalProtein || 0}g / {userProfile?.dailyProteinGoal || 160}g
              </Text>
              <ProgressBar 
                progress={progress} 
                color="#87CEEB" 
                style={styles.progressBar}
              />
            </View>
          </Card.Content>
        </Card>

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

        {/* Saved Foods Section */}
        {filteredSavedFoods.length > 0 && (
          <Card style={styles.savedFoodsCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Quick Add
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipContainer}>
                  {filteredSavedFoods.map((food) => (
                    <Chip
                      key={food.id}
                      onPress={() => handleQuickAdd(food)}
                      style={styles.chip}
                      textStyle={styles.chipText}
                    >
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
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Today's Log
            </Text>
            {dailyLog?.entries && dailyLog.entries.length > 0 ? (
              dailyLog.entries
                .sort((a, b) => new Date(b.timeEaten).getTime() - new Date(a.timeEaten).getTime())
                .map((entry) => (
                  <List.Item
                    key={entry.id}
                    title={entry.name}
                    description={`🕗 ${formatTime(entry.timeEaten)}`}
                    right={() => (
                      <Text variant="bodyLarge" style={styles.proteinAmount}>
                        {entry.proteinAmount}g
                      </Text>
                    )}
                    style={styles.logItem}
                  />
                ))
            ) : (
              <Text style={styles.emptyText}>No entries yet today</Text>
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
      <AddFoodModal
        visible={isAddModalVisible}
        onDismiss={() => setIsAddModalVisible(false)}
        onAdd={handleAddFood}
        savedFood={selectedSavedFood}
      />
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
  progressCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  progressTitle: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#2C3E50',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    marginBottom: 8,
    color: '#2C3E50',
    fontWeight: 'bold',
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
  },
  searchCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  searchbar: {
    borderRadius: 8,
  },
  savedFoodsCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    marginBottom: 12,
    color: '#2C3E50',
    fontWeight: '600',
  },
  chipContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  chip: {
    marginRight: 8,
    backgroundColor: '#87CEEB',
  },
  chipText: {
    color: '#2C3E50',
  },
  logCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  logItem: {
    paddingVertical: 4,
  },
  proteinAmount: {
    fontWeight: 'bold',
    color: '#87CEEB',
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
}); 