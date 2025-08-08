import React, { useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, TextInput, Button, Card } from "react-native-paper";
import { usePaperTheme } from "../theme-context";
import { supabase } from "../services/supabase";

export default function AuthScreen({ onAuthenticated }: { onAuthenticated: () => void }) {
    const theme = usePaperTheme();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mode, setMode] = useState<"signin" | "signup">("signin");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const styles = useMemo(
        () =>
            StyleSheet.create({
                container: { flex: 1, justifyContent: "center", padding: theme.custom.spacing },
                card: { borderRadius: theme.custom.radius, backgroundColor: theme.colors.surface, maxWidth: 420, width: "100%", alignSelf: "center" },
                title: { ...theme.custom.typography.h3, textAlign: "center", color: theme.colors.onSurface, marginBottom: theme.custom.spacing },
                input: { marginBottom: 12 },
                switchText: { textAlign: "center", marginTop: 8, color: theme.colors.outline },
            }),
        [theme]
    );

    const handleSubmit = async () => {
        if (!supabase) return;
        setLoading(true);
        setError(null);
        try {
            if (mode === "signin") {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
            }
            onAuthenticated();
        } catch (e: any) {
            setError(e.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.title}>{mode === "signin" ? "Sign In" : "Create Account"}</Text>
                    <TextInput
                        mode="outlined"
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        style={styles.input}
                    />
                    <TextInput mode="outlined" label="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
                    {error ? <Text style={{ color: "#ef4444", textAlign: "center", marginBottom: 8 }}>{error}</Text> : null}
                    <Button mode="contained" loading={loading} disabled={loading || !email || !password} onPress={handleSubmit}>
                        {mode === "signin" ? "Sign In" : "Sign Up"}
                    </Button>
                    <Text style={styles.switchText} onPress={() => setMode(mode === "signin" ? "signup" : "signin")}>
                        {mode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </Text>
                </Card.Content>
            </Card>
        </View>
    );
}
