import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodEntry, SavedFood, UserProfile, DailyLog } from '../types';

const STORAGE_KEYS = {
  DAILY_LOGS: 'protein_pulse_daily_logs',
  SAVED_FOODS: 'protein_pulse_saved_foods',
  USER_PROFILE: 'protein_pulse_user_profile',
};

export class StorageService {
  // Daily Logs
  static async getDailyLog(date: string): Promise<DailyLog | null> {
    try {
      const logs = await this.getAllDailyLogs();
      return logs[date] || null;
    } catch (error) {
      console.error('Error getting daily log:', error);
      return null;
    }
  }

  static async getAllDailyLogs(): Promise<Record<string, DailyLog>> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting all daily logs:', error);
      return {};
    }
  }

  static async addFoodEntry(entry: FoodEntry): Promise<void> {
    try {
      const date = this.formatDate(entry.timeEaten);
      const logs = await this.getAllDailyLogs();
      
      if (!logs[date]) {
        logs[date] = {
          date,
          entries: [],
          totalProtein: 0,
        };
      }
      
      logs[date].entries.push(entry);
      logs[date].totalProtein += entry.proteinAmount;
      
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(logs));
    } catch (error) {
      console.error('Error adding food entry:', error);
    }
  }

  // Saved Foods
  static async getSavedFoods(): Promise<SavedFood[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_FOODS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting saved foods:', error);
      return [];
    }
  }

  static async addSavedFood(food: SavedFood): Promise<void> {
    try {
      const foods = await this.getSavedFoods();
      foods.push(food);
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_FOODS, JSON.stringify(foods));
    } catch (error) {
      console.error('Error adding saved food:', error);
    }
  }

  static async deleteSavedFood(id: string): Promise<void> {
    try {
      const foods = await this.getSavedFoods();
      const filteredFoods = foods.filter(food => food.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_FOODS, JSON.stringify(filteredFoods));
    } catch (error) {
      console.error('Error deleting saved food:', error);
    }
  }

  // User Profile
  static async getUserProfile(): Promise<UserProfile> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : {
        dailyProteinGoal: 160,
        isSynced: false,
        units: 'grams' as const,
        theme: 'light' as const,
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return {
        dailyProteinGoal: 160,
        isSynced: false,
        units: 'grams' as const,
        theme: 'light' as const,
      };
    }
  }

  static async updateUserProfile(profile: Partial<UserProfile>): Promise<void> {
    try {
      const currentProfile = await this.getUserProfile();
      const updatedProfile = { ...currentProfile, ...profile };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedProfile));
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  }

  // Utility methods
  private static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
} 