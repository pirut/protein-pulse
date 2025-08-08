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
    getUserProfile(): Promise<UserProfile> { return StorageService.getUserProfile(); }
    updateUserProfile(profile: Partial<UserProfile>): Promise<void> { return StorageService.updateUserProfile(profile); }
    getSavedFoods(): Promise<SavedFood[]> { return StorageService.getSavedFoods(); }
    addSavedFood(food: SavedFood): Promise<void> { return StorageService.addSavedFood(food); }
    deleteSavedFood(id: string): Promise<void> { return StorageService.deleteSavedFood(id); }
    getDailyLog(date: string): Promise<DailyLog | null> { return StorageService.getDailyLog(date); }
    addFoodEntry(entry: FoodEntry): Promise<void> { return StorageService.addFoodEntry(entry); }
}

class SupabaseRepository implements IDataRepository {
    private async cacheProfile(profile: UserProfile){ await StorageService.updateUserProfile(profile); }
    private async cacheSavedFoods(foods: SavedFood[]){
        // naive: clear and set
        const existing = await StorageService.getSavedFoods();
        for (const f of existing){ await StorageService.deleteSavedFood(f.id); }
        for (const f of foods){ await StorageService.addSavedFood(f); }
    }

    async getUserProfile(): Promise<UserProfile> {
        if (!supabase) return StorageService.getUserProfile();
        const { data: session } = await supabase.auth.getSession();
        const userId = session.session?.user.id;
        if (!userId) return StorageService.getUserProfile();
        const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
        if (error) throw error;
        if (!data) {
            const profile: UserProfile = { dailyProteinGoal: 160, isSynced: true, units: "grams", theme: "light", email: session.session?.user.email ?? undefined };
            await supabase.from("profiles").insert({ user_id: userId, email: session.session?.user.email, daily_protein_goal: 160, units: "grams", theme: "light" });
            await this.cacheProfile(profile);
            return profile;
        }
        const profile: UserProfile = {
            dailyProteinGoal: Number(data.daily_protein_goal || 160),
            email: data.email || undefined,
            isSynced: true,
            units: (data.units as "grams" | "ounces") ?? "grams",
            theme: (data.theme as "light" | "dark") ?? "light",
        };
        await this.cacheProfile(profile);
        return profile;
    }

    async updateUserProfile(profile: Partial<UserProfile>): Promise<void> {
        await StorageService.updateUserProfile(profile);
        if (!supabase) return;
        const { data: session } = await supabase.auth.getSession();
        const userId = session.session?.user.id; if (!userId) return;
        const patch: any = {};
        if (profile.dailyProteinGoal !== undefined) patch.daily_protein_goal = profile.dailyProteinGoal;
        if (profile.units !== undefined) patch.units = profile.units;
        if (profile.theme !== undefined) patch.theme = profile.theme;
        await supabase.from("profiles").upsert({ user_id: userId, ...patch });
    }

    async getSavedFoods(): Promise<SavedFood[]> {
        if (!supabase) return StorageService.getSavedFoods();
        const { data: session } = await supabase.auth.getSession();
        const userId = session.session?.user.id; if (!userId) return StorageService.getSavedFoods();
        const { data, error } = await supabase.from("saved_foods").select("*").eq("user_id", userId).order("created_at", { ascending: false });
        if (error) return StorageService.getSavedFoods();
        const foods = (data || []).map((r) => ({ id: r.id, name: r.name, defaultProteinAmount: Number(r.default_protein_amount), createdAt: new Date(r.created_at) }));
        await this.cacheSavedFoods(foods);
        return foods;
    }

    async addSavedFood(food: SavedFood): Promise<void> {
        await StorageService.addSavedFood(food);
        if (!supabase) return;
        const { data: session } = await supabase.auth.getSession();
        const userId = session.session?.user.id; if (!userId) return;
        await supabase.from("saved_foods").insert({ user_id: userId, name: food.name, default_protein_amount: food.defaultProteinAmount });
    }

    async deleteSavedFood(id: string): Promise<void> {
        await StorageService.deleteSavedFood(id);
        if (!supabase) return;
        await supabase.from("saved_foods").delete().match({ id });
    }

    async getDailyLog(date: string): Promise<DailyLog | null> {
        if (!supabase) return StorageService.getDailyLog(date);
        const { data: session } = await supabase.auth.getSession();
        const userId = session.session?.user.id; if (!userId) return StorageService.getDailyLog(date);
        const { data, error } = await supabase.from("food_entries").select("*").eq("user_id", userId).eq("log_date", date);
        if (error) return StorageService.getDailyLog(date);
        const entries: FoodEntry[] = (data || []).map((r) => ({ id: r.id, name: r.name, proteinAmount: Number(r.protein_amount), timeEaten: new Date(r.time_eaten), createdAt: new Date(r.created_at) }));
        const totalProtein = entries.reduce((sum, e) => sum + e.proteinAmount, 0);
        const log: DailyLog = { date, entries, totalProtein };
        // We don't currently cache per-day logs compactly; skip heavy local cache for now.
        return log;
    }

    async addFoodEntry(entry: FoodEntry): Promise<void> {
        await StorageService.addFoodEntry(entry);
        if (!supabase) return;
        const { data: session } = await supabase.auth.getSession();
        const userId = session.session?.user.id; if (!userId) return;
        const logDate = new Date(entry.timeEaten).toISOString().split("T")[0];
        await supabase.from("food_entries").insert({ user_id: userId, log_date: logDate, name: entry.name, protein_amount: entry.proteinAmount, time_eaten: new Date(entry.timeEaten).toISOString() });
    }
}

export const repository: IDataRepository = supabase ? new SupabaseRepository() : new LocalRepository();
