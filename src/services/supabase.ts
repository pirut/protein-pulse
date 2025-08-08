import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = (process.env.EXPO_PUBLIC_SUPABASE_URL as string | undefined) || "https://gurygtwhakmalwplhxgj.supabase.co";
const SUPABASE_ANON_KEY =
    (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string | undefined) ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1cnlndHdoYWttYWx3cGxoeGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NDMwMjYsImV4cCI6MjA3MDIxOTAyNn0.bqYtkElair7yrl48aZKM-0RYrtacGR2_SNc5x7O3LGc";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("[Supabase] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Supabase will not be initialized.");
}

export const supabase =
    SUPABASE_URL && SUPABASE_ANON_KEY
        ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
              auth: {
                  persistSession: true,
                  storageKey: "protein_pulse_auth",
              },
          })
        : null;
