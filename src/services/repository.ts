import { StorageService } from "./storage";
import { supabase } from "./supabase";
import { DailyLog, FoodEntry, SavedFood, UserProfile } from "../types";

export interface IDataRepository {
    getUserProfile(): Promise<UserProfile>;
    updateUserProfile(profile: Partial<UserProfile>): Promise<void>;

    getSavedFoods(): Promise<SavedFood[]>;
    addSavedFood(food: SavedFood): Promise<void>;
    deleteSavedFood(id: string): Promise<void>;

    getDailyLog(date: string): Promise<DailyLog | null>;
    addFoodEntry(entry: FoodEntry): Promise<void>;
}

// For now, use AsyncStorage-backed implementation. Later, we can implement a SupabaseRepository.
export class LocalRepository implements IDataRepository {
    getUserProfile(): Promise<UserProfile> {
        return StorageService.getUserProfile();
    }

    updateUserProfile(profile: Partial<UserProfile>): Promise<void> {
        return StorageService.updateUserProfile(profile);
    }

    getSavedFoods(): Promise<SavedFood[]> {
        return StorageService.getSavedFoods();
    }

    addSavedFood(food: SavedFood): Promise<void> {
        return StorageService.addSavedFood(food);
    }

    deleteSavedFood(id: string): Promise<void> {
        return StorageService.deleteSavedFood(id);
    }

    getDailyLog(date: string): Promise<DailyLog | null> {
        return StorageService.getDailyLog(date);
    }

    addFoodEntry(entry: FoodEntry): Promise<void> {
        return StorageService.addFoodEntry(entry);
    }
}

export const repository: IDataRepository = new LocalRepository();

