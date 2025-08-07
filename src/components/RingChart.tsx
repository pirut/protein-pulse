import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import { usePaperTheme } from "../theme-context";

interface RingChartProps {
    progress: number; // 0 to 1
    size?: number;
    strokeWidth?: number;
    showPercentage?: boolean;
}

export default function RingChart({ progress, size = 120, strokeWidth = 8, showPercentage = true }: RingChartProps) {
    const theme = usePaperTheme();
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - progress * circumference;

    const styles = StyleSheet.create({
        container: {
            alignItems: "center",
            justifyContent: "center",
        },
    });

    return (
        <View style={styles.container}>
            <Svg width={size} height={size}>
                {/* Background circle */}
                <Circle cx={size / 2} cy={size / 2} r={radius} stroke={theme.colors.outline} strokeWidth={strokeWidth} fill="transparent" opacity={0.3} />
                {/* Progress circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={theme.colors.primary}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
                {/* Center text */}
                {showPercentage && (
                    <SvgText
                        x={size / 2}
                        y={size / 2 + 6}
                        fontSize={theme.custom.typography.h4.fontSize}
                        fontWeight={theme.custom.typography.h4.fontWeight}
                        fill={theme.colors.onSurface}
                        textAnchor="middle"
                    >
                        {Math.round(progress * 100)}%
                    </SvgText>
                )}
            </Svg>
        </View>
    );
}

