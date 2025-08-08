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

class SupabaseRepository implements IDataRepository {
    async getUserProfile(): Promise<UserProfile> {
        if (!supabase) return StorageService.getUserProfile();
        const { data: session } = await supabase.auth.getSession();
        const userId = session.session?.user.id;
        if (!userId) {
            // fallback default if not logged in yet
            return StorageService.getUserProfile();
        }
        const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
        if (error) throw error;
        if (!data) {
            // create default
            const profile: UserProfile = { dailyProteinGoal: 160, isSynced: true, units: "grams", theme: "light" };
            await supabase
                .from("profiles")
                .insert({ user_id: userId, email: session.session.user.email, daily_protein_goal: 160, units: "grams", theme: "light" });
            return profile;
        }
        return {
            dailyProteinGoal: Number(data.daily_protein_goal || 160),
            email: data.email || undefined,
            isSynced: true,
            units: (data.units as "grams" | "ounces") ?? "grams",
            theme: (data.theme as "light" | "dark") ?? "light",
        };
    }

    async updateUserProfile(profile: Partial<UserProfile>): Promise<void> {
        if (!supabase) return StorageService.updateUserProfile(profile);
        const { data: session } = await supabase.auth.getSession();
        const userId = session.session?.user.id;
        if (!userId) return;
        const patch: any = {};
        if (profile.dailyProteinGoal !== undefined) patch.daily_protein_goal = profile.dailyProteinGoal;
        if (profile.units !== undefined) patch.units = profile.units;
        if (profile.theme !== undefined) patch.theme = profile.theme;
        await supabase.from("profiles").upsert({ user_id: userId, ...patch });
    }

    async getSavedFoods(): Promise<SavedFood[]> {
        if (!supabase) return StorageService.getSavedFoods();
        const { data: session } = await supabase.auth.getSession();
        const userId = session.session?.user.id;
        if (!userId) return [];
        const { data, error } = await supabase.from("saved_foods").select("*").eq("user_id", userId).order("created_at", { ascending: false });
        if (error) throw error;
        return (data || []).map((r) => ({ id: r.id, name: r.name, defaultProteinAmount: Number(r.default_protein_amount), createdAt: new Date(r.created_at) }));
    }

    async addSavedFood(food: SavedFood): Promise<void> {
        if (!supabase) return StorageService.addSavedFood(food);
        const { data: session } = await supabase.auth.getSession();
        const userId = session.session?.user.id;
        if (!userId) return;
        await supabase.from("saved_foods").insert({ user_id: userId, name: food.name, default_protein_amount: food.defaultProteinAmount });
    }

    async deleteSavedFood(id: string): Promise<void> {
        if (!supabase) return StorageService.deleteSavedFood(id);
        const { data: session } = await supabase.auth.getSession();
        const userId = session.session?.user.id;
        if (!userId) return;
        await supabase.from("saved_foods").delete().match({ id });
    }

    async getDailyLog(date: string): Promise<DailyLog | null> {
        if (!supabase) return StorageService.getDailyLog(date);
        const { data: session } = await supabase.auth.getSession();
        const userId = session.session?.user.id;
        if (!userId) return null;
        const { data, error } = await supabase.from("food_entries").select("*").eq("user_id", userId).eq("log_date", date);
        if (error) throw error;
        const entries: FoodEntry[] = (data || []).map((r) => ({
            id: r.id,
            name: r.name,
            proteinAmount: Number(r.protein_amount),
            timeEaten: new Date(r.time_eaten),
            createdAt: new Date(r.created_at),
        }));
        const totalProtein = entries.reduce((sum, e) => sum + e.proteinAmount, 0);
        return { date, entries, totalProtein };
    }

    async addFoodEntry(entry: FoodEntry): Promise<void> {
        if (!supabase) return StorageService.addFoodEntry(entry);
        const { data: session } = await supabase.auth.getSession();
        const userId = session.session?.user.id;
        if (!userId) return;
        const logDate = new Date(entry.timeEaten).toISOString().split("T")[0];
        await supabase
            .from("food_entries")
            .insert({
                user_id: userId,
                log_date: logDate,
                name: entry.name,
                protein_amount: entry.proteinAmount,
                time_eaten: new Date(entry.timeEaten).toISOString(),
            });
    }
}

export const repository: IDataRepository = supabase ? new SupabaseRepository() : new LocalRepository();
