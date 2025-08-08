import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = (process.env.EXPO_PUBLIC_SUPABASE_URL as string | undefined) || (process.env.SUPABASE_URL as string | undefined);
const SUPABASE_ANON_KEY = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string | undefined) || (process.env.SUPABASE_ANON_KEY as string | undefined);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("[Supabase] Missing Supabase URL or anon key. Set EXPO_PUBLIC_SUPABASE_URL/EXPO_PUBLIC_SUPABASE_ANON_KEY (preferred) or SUPABASE_URL/SUPABASE_ANON_KEY.");
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
