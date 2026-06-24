import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Activity } from "@/context/ActivityContext";
import { useColors } from "@/hooks/useColors";

interface ActivityCardProps {
  activity: Activity;
}

const TYPE_CONFIG = {
  running: { icon: "walk", label: "Running", color: "#E31E24" },
  walking: { icon: "footsteps", label: "Walking", color: "#C9A227" },
  cycling: { icon: "bicycle", label: "Cycling", color: "#3B82F6" },
};

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const colors = useColors();
  const config = TYPE_CONFIG[activity.type] || TYPE_CONFIG.running;

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
      <View style={[styles.iconWrap, { backgroundColor: config.color + "22" }]}>
        <Ionicons name={config.icon as any} size={26} color={config.color} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.type, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
          {config.label}
        </Text>
        <Text style={[styles.date, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {formatDate(activity.date)}
        </Text>
      </View>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
            {activity.distance.toFixed(2)}
          </Text>
          <Text style={[styles.statUnit, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            km
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            {formatDuration(activity.duration)}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            {activity.calories}
          </Text>
          <Text style={[styles.statUnit, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            cal
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 4,
  },
  type: {
    fontSize: 15,
  },
  date: {
    fontSize: 12,
  },
  stats: {
    alignItems: "flex-end",
    gap: 2,
  },
  stat: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  statValue: {
    fontSize: 15,
  },
  statUnit: {
    fontSize: 11,
  },
});
