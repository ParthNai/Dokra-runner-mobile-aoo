import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useActivity, type Activity } from "@/context/ActivityContext";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

const ACTIVITY_TYPES = [
  { type: "walking", label: "Walking", icon: "footsteps", color: "#C9A227" },
  { type: "running", label: "Running", icon: "walk", color: "#E31E24" },
  { type: "cycling", label: "Cycling", icon: "bicycle", color: "#3B82F6" },
];

function formatDuration(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  running: { icon: "walk", color: "#E31E24", label: "Morning Run" },
  walking: { icon: "footsteps", color: "#C9A227", label: "Evening Walk" },
  cycling: { icon: "bicycle", color: "#3B82F6", label: "Cycling" },
};

function getHour(): string {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

function WeeklyChart({ data, colors }: { data: { day: string; distance: number }[]; colors: any }) {
  const maxDist = Math.max(...data.map((d) => d.distance), 1);
  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;
  const totalWeekly = data.reduce((s, d) => s + d.distance, 0);

  return (
    <View style={chartStyles.container}>
      <View style={chartStyles.header}>
        <Text style={[chartStyles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          WEEKLY PROGRESS
        </Text>
        <View style={chartStyles.headerRight}>
          <Text style={[chartStyles.weekLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            This Week
          </Text>
          <Text style={[chartStyles.weekTotal, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
            {totalWeekly.toFixed(2)} km
          </Text>
        </View>
      </View>

      <View style={chartStyles.chartArea}>
        <View style={chartStyles.yLabels}>
          {[Math.ceil(maxDist), Math.ceil(maxDist / 2), 0].map((v, i) => (
            <Text key={i} style={[chartStyles.yLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {v}
            </Text>
          ))}
        </View>
        <View style={chartStyles.bars}>
          {data.map((d, i) => {
            const isToday = i === todayIdx;
            const pct = maxDist > 0 ? (d.distance / maxDist) : 0;
            const BAR_MAX = 80;
            return (
              <View key={d.day} style={chartStyles.barCol}>
                <View style={chartStyles.barWrap}>
                  {d.distance > 0 && (
                    <View
                      style={[
                        chartStyles.bar,
                        {
                          height: Math.max(pct * BAR_MAX, 4),
                          backgroundColor: isToday ? colors.primary : colors.accent,
                          borderRadius: 4,
                        },
                      ]}
                    />
                  )}
                  {d.distance === 0 && (
                    <View style={[chartStyles.emptyBar, { backgroundColor: colors.border }]} />
                  )}
                </View>
                <Text style={[chartStyles.dayLabel, { color: isToday ? colors.primary : colors.mutedForeground, fontFamily: isToday ? "Inter_600SemiBold" : "Inter_400Regular" }]}>
                  {d.day.slice(0, 3)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getActivitiesByUser, getTodayStats, getWeeklyData } = useActivity();

  const userId = user?.id ?? "";
  const stats = getTodayStats(userId);
  const weeklyData = getWeeklyData(userId);
  const recentActivities = getActivitiesByUser(userId).slice(0, 3);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;
  const firstName = user?.fullName?.split(" ")[0] ?? "Runner";
  const greeting = getHour();

  const fmtActiveTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 8, paddingBottom: bottomPad + 100 }]}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="menu" size={26} color={colors.foreground} />
            <View style={styles.brandRow}>
              <Text style={[styles.brandName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                DOKRA
              </Text>
              <Text style={[styles.brandSub, { color: colors.accent, fontFamily: "Inter_600SemiBold" }]}>
                RUNNING CLUB
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Pressable>
              <Ionicons name="notifications-outline" size={24} color={colors.foreground} />
            </Pressable>
            <View style={[styles.avatarSmall, { backgroundColor: colors.primary }]}>
              {user?.profilePhoto ? (
                <Image source={{ uri: user.profilePhoto }} style={styles.avatarImg} />
              ) : (
                <Text style={[styles.avatarInitial, { fontFamily: "Inter_700Bold" }]}>
                  {(user?.fullName ?? "U").charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* GREETING */}
        <View style={styles.greetingRow}>
          <View>
            <Text style={[styles.greetingSmall, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Good {greeting},
            </Text>
            <Text style={[styles.greetingName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {firstName} 👋
            </Text>
            <Text style={[styles.greetingSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Ready to achieve your goals today?
            </Text>
          </View>
        </View>

        {/* TODAY'S ACTIVITY CARD */}
        <LinearGradient
          colors={["#1a0000", "#111"]}
          style={[styles.todayCard, { borderRadius: 16, borderColor: colors.border }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[styles.cardLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
            TODAY'S ACTIVITY
          </Text>
          <View style={styles.todayStats}>
            {[
              { label: "Steps", value: stats.steps.toLocaleString(), icon: "footsteps-outline" },
              { label: "Distance", value: `${stats.distance.toFixed(2)}`, icon: "map-outline" },
              { label: "Calories", value: `${stats.calories}`, icon: "flame-outline" },
              { label: "Active Time", value: fmtActiveTime(stats.activeTime), icon: "time-outline" },
            ].map((s) => (
              <View key={s.label} style={styles.todayStat}>
                <Text style={[styles.todayStatVal, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  {s.value}
                </Text>
                <Text style={[styles.todayStatLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* CHOOSE ACTIVITY */}
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            CHOOSE ACTIVITY
          </Text>
          <Pressable onPress={() => router.push("/(tabs)/activities")}>
            <Text style={[styles.viewAll, { color: colors.accent, fontFamily: "Inter_500Medium" }]}>
              View All
            </Text>
          </Pressable>
        </View>
        <Text style={[styles.sectionSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Select your activity to start
        </Text>
        <View style={styles.activityRow}>
          {ACTIVITY_TYPES.map((a) => (
            <Pressable
              key={a.type}
              onPress={() => router.push({ pathname: "/run", params: { type: a.type } })}
              style={({ pressed }) => [
                styles.actBtn,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: 14,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <View style={[styles.actBtnIcon, { backgroundColor: a.color + "22" }]}>
                <Ionicons name={a.icon as any} size={26} color={a.color} />
              </View>
              <Text style={[styles.actBtnLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                {a.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* WEEKLY PROGRESS CHART */}
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderRadius: 16, borderColor: colors.border }]}>
          <WeeklyChart data={weeklyData} colors={colors} />
        </View>

        {/* RECENT ACTIVITIES */}
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            RECENT ACTIVITIES
          </Text>
          <Pressable onPress={() => router.push("/history")}>
            <Text style={[styles.viewAll, { color: colors.accent, fontFamily: "Inter_500Medium" }]}>
              View All
            </Text>
          </Pressable>
        </View>

        {recentActivities.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 14 }]}>
            <Ionicons name="walk-outline" size={36} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              No activities yet. Start your first run!
            </Text>
          </View>
        ) : (
          recentActivities.map((a) => (
            <Pressable
              key={a.id}
              onPress={() => router.push({ pathname: "/activity-detail", params: { id: a.id } })}
              style={[styles.recentItem, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 14 }]}
            >
              <View style={[styles.recentIcon, { backgroundColor: TYPE_CONFIG[a.type]?.color + "22" }]}>
                <Ionicons name={TYPE_CONFIG[a.type]?.icon as any} size={22} color={TYPE_CONFIG[a.type]?.color} />
              </View>
              <View style={styles.recentInfo}>
                <Text style={[styles.recentType, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {TYPE_CONFIG[a.type]?.label}
                </Text>
                <Text style={[styles.recentDate, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {formatDate(a.date)}
                </Text>
              </View>
              <View style={styles.recentStats}>
                <Text style={[styles.recentDist, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
                  {a.distance.toFixed(2)} km
                </Text>
                <Text style={[styles.recentDur, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {formatDuration(a.duration)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: { padding: 16, gap: 14 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 13, letterSpacing: 1.5 },
  headerRight: { alignItems: "flex-end" },
  weekLabel: { fontSize: 11 },
  weekTotal: { fontSize: 15 },
  chartArea: { flexDirection: "row", gap: 8 },
  yLabels: { justifyContent: "space-between", alignItems: "flex-end", paddingBottom: 20, gap: 0 },
  yLabel: { fontSize: 9 },
  bars: { flex: 1, flexDirection: "row", alignItems: "flex-end", gap: 4 },
  barCol: { flex: 1, alignItems: "center", gap: 4 },
  barWrap: { height: 80, justifyContent: "flex-end", width: "100%" },
  bar: { width: "100%" },
  emptyBar: { height: 4, width: "100%", borderRadius: 2 },
  dayLabel: { fontSize: 10 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, gap: 14 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  brandRow: {},
  brandName: { fontSize: 16, letterSpacing: 2 },
  brandSub: { fontSize: 9, letterSpacing: 3, marginTop: -2 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatarSmall: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  avatarImg: { width: 36, height: 36, borderRadius: 18 },
  avatarInitial: { color: "#fff", fontSize: 15 },
  greetingRow: { marginTop: 4 },
  greetingSmall: { fontSize: 13 },
  greetingName: { fontSize: 26 },
  greetingSub: { fontSize: 12, marginTop: 2 },
  todayCard: { padding: 16, borderWidth: 1 },
  cardLabel: { fontSize: 11, letterSpacing: 2, marginBottom: 12 },
  todayStats: { flexDirection: "row" },
  todayStat: { flex: 1, alignItems: "center", gap: 3 },
  todayStatVal: { fontSize: 16 },
  todayStatLabel: { fontSize: 10, textAlign: "center" },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  sectionTitle: { fontSize: 13, letterSpacing: 1.5 },
  sectionSub: { fontSize: 12, marginTop: -10 },
  viewAll: { fontSize: 13 },
  activityRow: { flexDirection: "row", gap: 10 },
  actBtn: { flex: 1, alignItems: "center", paddingVertical: 16, gap: 8, borderWidth: 1 },
  actBtnIcon: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center" },
  actBtnLabel: { fontSize: 12 },
  chartCard: { borderWidth: 1 },
  emptyCard: { padding: 24, alignItems: "center", gap: 10, borderWidth: 1 },
  emptyText: { fontSize: 13, textAlign: "center" },
  recentItem: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12, borderWidth: 1, marginBottom: 6 },
  recentIcon: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  recentInfo: { flex: 1, gap: 3 },
  recentType: { fontSize: 14 },
  recentDate: { fontSize: 12 },
  recentStats: { alignItems: "flex-end", gap: 2 },
  recentDist: { fontSize: 15 },
  recentDur: { fontSize: 12 },
});
