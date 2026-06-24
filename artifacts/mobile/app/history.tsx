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
import { useAuth } from "@/context/AuthContext";
import { useActivity, ActivityType, type Activity } from "@/context/ActivityContext";
import { useColors } from "@/hooks/useColors";

type Filter = "all" | ActivityType;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "running", label: "Running" },
  { key: "walking", label: "Walking" },
  { key: "cycling", label: "Cycling" },
];

const TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  running: { icon: "walk", color: "#E31E24", label: "Morning Run" },
  walking: { icon: "footsteps", color: "#C9A227", label: "Evening Walk" },
  cycling: { icon: "bicycle", color: "#3B82F6", label: "Cycling" },
};

function formatDuration(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getActivitiesByUser } = useActivity();
  const [filter, setFilter] = useState<Filter>("all");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const all = getActivitiesByUser(user?.id ?? "");
  const filtered = filter === "all" ? all : all.filter((a) => a.type === filter);

  const renderItem = ({ item }: { item: Activity }) => {
    const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.running;
    return (
      <Pressable
        onPress={() => router.push({ pathname: "/activity-detail", params: { id: item.id } })}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: 14,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <View style={[styles.cardIcon, { backgroundColor: cfg.color + "22" }]}>
          <Ionicons name={cfg.icon as any} size={24} color={cfg.color} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardType, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            {cfg.label}
          </Text>
          <Text style={[styles.cardDate, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {formatDate(item.date)}
          </Text>
        </View>
        <View style={styles.cardStats}>
          <Text style={[styles.cardDist, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
            {item.distance.toFixed(2)} km
          </Text>
          <Text style={[styles.cardDur, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {formatDuration(item.duration)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          History
        </Text>
        <Pressable style={styles.filterBtn}>
          <Ionicons name="funnel-outline" size={20} color={colors.foreground} />
        </Pressable>
      </View>

      {/* FILTER PILLS */}
      <View style={styles.pills}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[
              styles.pill,
              {
                backgroundColor: filter === f.key ? colors.primary : colors.card,
                borderColor: filter === f.key ? colors.primary : colors.border,
                borderRadius: 20,
              },
            ]}
          >
            <Text
              style={[
                styles.pillText,
                {
                  color: filter === f.key ? "#fff" : colors.mutedForeground,
                  fontFamily: filter === f.key ? "Inter_600SemiBold" : "Inter_400Regular",
                },
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === "web" ? 40 : 30 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="walk-outline" size={60} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              No activities yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Start tracking to see your history
            </Text>
            <Pressable
              onPress={() => router.push({ pathname: "/run", params: { type: "running" } })}
              style={[styles.startBtn, { backgroundColor: colors.primary, borderRadius: 10 }]}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, letterSpacing: 0.5 },
  filterBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  pills: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1 },
  pillText: { fontSize: 13 },
  list: { paddingHorizontal: 16, gap: 8 },
  card: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12, borderWidth: 1, marginBottom: 4 },
  cardIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  cardInfo: { flex: 1, gap: 3 },
  cardType: { fontSize: 15 },
  cardDate: { fontSize: 12 },
  cardStats: { alignItems: "flex-end", gap: 3 },
  cardDist: { fontSize: 15 },
  cardDur: { fontSize: 12 },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18 },
  emptyText: { fontSize: 14 },
  startBtn: { paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  startBtnText: { fontSize: 15 },
});
