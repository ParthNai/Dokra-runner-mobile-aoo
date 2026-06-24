import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityCard } from "@/components/ActivityCard";
import { useAuth } from "@/context/AuthContext";
import { useActivity, ActivityType } from "@/context/ActivityContext";
import { useColors } from "@/hooks/useColors";

const FILTERS: { label: string; value: ActivityType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Running", value: "running" },
  { label: "Walking", value: "walking" },
  { label: "Cycling", value: "cycling" },
];

export default function ActivitiesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getActivitiesByUser } = useActivity();
  const [filter, setFilter] = useState<ActivityType | "all">("all");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const all = getActivitiesByUser(user?.id ?? "");
  const filtered = filter === "all" ? all : all.filter((a) => a.type === filter);

  const totalDist = all.reduce((s, a) => s + a.distance, 0);
  const totalCal = all.reduce((s, a) => s + a.calories, 0);
  const totalTime = all.reduce((s, a) => s + a.duration, 0);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          ACTIVITIES
        </Text>

        <View style={styles.summaryRow}>
          {[
            { label: "Total Distance", value: `${totalDist.toFixed(1)} km` },
            { label: "Calories Burned", value: `${totalCal} kcal` },
            { label: "Active Time", value: formatTime(totalTime) },
          ].map((s) => (
            <View key={s.label} style={[styles.summaryItem, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
              <Text style={[styles.summaryVal, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
                {s.value}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.filters}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.value}
              onPress={() => setFilter(f.value)}
              style={[
                styles.filterBtn,
                {
                  backgroundColor: filter === f.value ? colors.primary : colors.card,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: filter === f.value ? "#fff" : colors.mutedForeground,
                    fontFamily: "Inter_500Medium",
                  },
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ActivityCard activity={item} />}
        contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === "web" ? 120 : 100 }]}
        scrollEnabled={!!filtered.length}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="walk-outline" size={60} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              No activities yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Start your first run to see it here
            </Text>
            <Pressable
              onPress={() => router.push({ pathname: "/run", params: { type: "running" } })}
              style={[styles.startBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
            >
              <Text style={[styles.startBtnText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                Start First Run
              </Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12, gap: 14 },
  title: { fontSize: 22, letterSpacing: 2 },
  summaryRow: { flexDirection: "row", gap: 8 },
  summaryItem: { flex: 1, padding: 10, alignItems: "center", gap: 2, borderWidth: 1 },
  summaryVal: { fontSize: 14 },
  summaryLabel: { fontSize: 10, textAlign: "center" },
  filters: { flexDirection: "row", gap: 8 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 8 },
  filterText: { fontSize: 13 },
  list: { paddingHorizontal: 16, paddingTop: 8 },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18 },
  emptyText: { fontSize: 14 },
  startBtn: { paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  startBtnText: { fontSize: 15, letterSpacing: 1 },
});
