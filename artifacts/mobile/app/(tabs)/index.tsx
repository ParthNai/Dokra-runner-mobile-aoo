import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityCard } from "@/components/ActivityCard";
import { DokraLogo } from "@/components/DokraLogo";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/context/AuthContext";
import { useActivity } from "@/context/ActivityContext";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

const ACTIVITY_TYPES = [
  { type: "running", label: "Run", icon: "walk", color: "#E31E24" },
  { type: "walking", label: "Walk", icon: "footsteps", color: "#C9A227" },
  { type: "cycling", label: "Cycle", icon: "bicycle", color: "#3B82F6" },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getActivitiesByUser, getTodayStats } = useActivity();

  const userId = user?.id ?? "";
  const stats = getTodayStats(userId);
  const recentActivities = getActivitiesByUser(userId).slice(0, 3);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const firstName = user?.fullName?.split(" ")[0] ?? "Runner";

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 16, paddingBottom: bottomPad + 100 },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Welcome back,
            </Text>
            <Text style={[styles.name, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {firstName} 👊
            </Text>
            {user?.clubName && (
              <Text style={[styles.club, { color: colors.accent, fontFamily: "Inter_500Medium" }]}>
                {user.clubName}
              </Text>
            )}
          </View>
          <DokraLogo size="small" />
        </View>

        <LinearGradient
          colors={[colors.primary + "33", "#0A0A0A"]}
          style={[styles.banner, { borderRadius: colors.radius }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[styles.bannerLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
            TODAY'S PROGRESS
          </Text>
          <Text style={[styles.bannerSteps, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            {stats.steps.toLocaleString()}
          </Text>
          <Text style={[styles.bannerUnit, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            steps
          </Text>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: `${Math.min((stats.steps / 10000) * 100, 100)}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressGoal, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Goal: 10,000 steps
          </Text>
        </LinearGradient>

        <View style={styles.statsGrid}>
          <StatCard
            label="Distance"
            value={stats.distance.toFixed(2)}
            unit="km"
            iconName="map"
            color={colors.accent}
          />
          <StatCard
            label="Calories"
            value={stats.calories.toString()}
            unit="kcal"
            iconName="flame"
            color="#FF6B35"
          />
          <StatCard
            label="Active Time"
            value={formatTime(stats.activeTime)}
            unit=""
            iconName="time"
            color="#3B82F6"
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          START ACTIVITY
        </Text>
        <View style={styles.activityTypes}>
          {ACTIVITY_TYPES.map((a) => (
            <Pressable
              key={a.type}
              onPress={() => router.push({ pathname: "/run", params: { type: a.type } })}
              style={({ pressed }) => [
                styles.actTypeBtn,
                {
                  backgroundColor: colors.card,
                  borderColor: a.color,
                  borderRadius: colors.radius,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <View style={[styles.actTypeIcon, { backgroundColor: a.color + "22" }]}>
                <Ionicons name={a.icon as any} size={28} color={a.color} />
              </View>
              <Text style={[styles.actTypeLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                {a.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.bigStartWrap}>
          <Pressable
            onPress={() => router.push({ pathname: "/run", params: { type: "running" } })}
            style={({ pressed }) => [
              styles.bigStart,
              { backgroundColor: colors.primary, borderRadius: colors.radius * 2, opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Ionicons name="play" size={28} color="#fff" />
            <Text style={[styles.bigStartText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
              START RUN
            </Text>
          </Pressable>
        </View>

        {recentActivities.length > 0 && (
          <>
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                RECENT ACTIVITIES
              </Text>
              <Pressable onPress={() => router.push("/(tabs)/activities")}>
                <Text style={[styles.seeAll, { color: colors.accent, fontFamily: "Inter_500Medium" }]}>
                  See all
                </Text>
              </Pressable>
            </View>
            {recentActivities.map((a) => (
              <ActivityCard key={a.id} activity={a} />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, gap: 16 },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  headerLeft: { gap: 2 },
  greeting: { fontSize: 13 },
  name: { fontSize: 24 },
  club: { fontSize: 12 },
  banner: { padding: 20, alignItems: "center", gap: 4 },
  bannerLabel: { fontSize: 11, letterSpacing: 2 },
  bannerSteps: { fontSize: 52, lineHeight: 56 },
  bannerUnit: { fontSize: 14 },
  progressBar: { width: "100%", height: 8, borderRadius: 4, marginTop: 8, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4 },
  progressGoal: { fontSize: 11, marginTop: 4 },
  statsGrid: { flexDirection: "row", gap: 10 },
  sectionTitle: { fontSize: 14, letterSpacing: 1.5 },
  activityTypes: { flexDirection: "row", gap: 10 },
  actTypeBtn: { flex: 1, alignItems: "center", padding: 14, gap: 8, borderWidth: 1 },
  actTypeIcon: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  actTypeLabel: { fontSize: 13 },
  bigStartWrap: { alignItems: "center" },
  bigStart: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 16, paddingHorizontal: 40 },
  bigStartText: { fontSize: 18, letterSpacing: 2 },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  seeAll: { fontSize: 13 },
});
