export interface FoodEntry {
  id: string;
  name: string;
  proteinAmount: number;
  timeEaten: Date;
  createdAt: Date;
}

export interface SavedFood {
  id: string;
  name: string;
  defaultProteinAmount: number;
  createdAt: Date;
}

export interface UserProfile {
  dailyProteinGoal: number;
  email?: string;
  isSynced: boolean;
  units: 'grams' | 'ounces';
  theme: 'light' | 'dark';
}

export interface DailyLog {
  date: string; // YYYY-MM-DD format
  entries: FoodEntry[];
  totalProtein: number;
} 