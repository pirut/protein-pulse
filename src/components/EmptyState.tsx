import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";
import { usePaperTheme } from "../theme-context";

interface EmptyStateProps {
    title: string;
    description: string;
    actionText: string;
    onAction: () => void;
    icon?: string;
}

export default function EmptyState({ title, description, actionText, onAction, icon = "🍽️" }: EmptyStateProps) {
    const theme = usePaperTheme();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: theme.custom.spacing * 2,
            paddingVertical: theme.custom.spacing * 3,
        },
        icon: {
            fontSize: 64,
            marginBottom: theme.custom.spacing,
        },
        title: {
            ...theme.custom.typography.h3,
            color: theme.colors.onSurface,
            textAlign: "center",
            marginBottom: theme.custom.smallSpacing,
        },
        description: {
            ...theme.custom.typography.body,
            color: theme.colors.outline,
            textAlign: "center",
            marginBottom: theme.custom.spacing * 2,
            lineHeight: 22,
        },
        button: {
            backgroundColor: theme.colors.primary,
        },
    });

    return (
        <View style={styles.container}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
            <Button mode="contained" onPress={onAction} style={styles.button}>
                {actionText}
            </Button>
        </View>
    );
}

