import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface StatCardProps {
  label: string;
  value: string;
  unit: string;
  iconName: string;
  color?: string;
}

export function StatCard({ label, value, unit, iconName, color }: StatCardProps) {
  const colors = useColors();
  const iconColor = color || colors.primary;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconColor + "22" }]}>
        <Ionicons name={iconName as any} size={22} color={iconColor} />
      </View>
      <Text
        style={[styles.value, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text style={[styles.unit, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
        {unit}
      </Text>
      <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 14,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    minWidth: 80,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  value: {
    fontSize: 22,
    lineHeight: 26,
  },
  unit: {
    fontSize: 11,
    marginTop: -2,
  },
  label: {
    fontSize: 12,
  },
});
