import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DokraLogo } from "@/components/DokraLogo";
import { useColors } from "@/hooks/useColors";

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

export default function SummaryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    distance: string;
    duration: string;
    avgSpeed: string;
    calories: string;
    type: string;
  }>();

  const distance = parseFloat(params.distance ?? "0");
  const duration = parseInt(params.duration ?? "0");
  const avgSpeed = parseFloat(params.avgSpeed ?? "0");
  const calories = parseInt(params.calories ?? "0");
  const actType = params.type ?? "running";

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const pace = distance > 0 && duration > 0 ? duration / 60 / distance : 0;

  const TYPE_COLORS: Record<string, string> = {
    running: "#E31E24",
    walking: "#C9A227",
    cycling: "#3B82F6",
  };
  const actColor = TYPE_COLORS[actType] || colors.primary;

  const STATS = [
    { label: "Distance", value: distance.toFixed(2), unit: "km", icon: "map", color: colors.accent },
    { label: "Duration", value: formatTime(duration), unit: "", icon: "time", color: "#3B82F6" },
    { label: "Avg Speed", value: avgSpeed.toFixed(1), unit: "km/h", icon: "speedometer", color: actColor },
    { label: "Avg Pace", value: pace.toFixed(1), unit: "min/km", icon: "hourglass", color: "#9B59B6" },
    { label: "Calories", value: calories.toString(), unit: "kcal", icon: "flame", color: "#FF6B35" },
  ];

  const getMessage = () => {
    if (distance >= 10) return "Outstanding! You're a champion! 🏆";
    if (distance >= 5) return "Amazing effort! Keep pushing! 💪";
    if (distance >= 1) return "Great run! Every step counts! 🏃";
    return "Good start! Keep it going! ⚡";
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[actColor + "33", "#0A0A0A"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 20, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <DokraLogo size="small" />
        </View>

        <View style={styles.heroSection}>
          <Text style={[styles.congrats, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            ACTIVITY COMPLETE!
          </Text>
          <Text style={[styles.message, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {getMessage()}
          </Text>
        </View>

        <View style={[styles.bigDistance, { borderColor: actColor }]}>
          <Text style={[styles.distanceNumber, { color: actColor, fontFamily: "Inter_700Bold" }]}>
            {distance.toFixed(2)}
          </Text>
          <Text style={[styles.distanceUnit, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
            KILOMETERS
          </Text>
        </View>

        <View style={styles.statsGrid}>
          {STATS.slice(1).map((s) => (
            <View
              key={s.label}
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <View style={[styles.statIcon, { backgroundColor: s.color + "22" }]}>
                <Ionicons name={s.icon as any} size={20} color={s.color} />
              </View>
              <Text style={[styles.statVal, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                {s.value}
              </Text>
              {s.unit ? (
                <Text style={[styles.statUnit, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {s.unit}
                </Text>
              ) : null}
              <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => router.replace("/(tabs)/")}
            style={[styles.homeBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
          >
            <Ionicons name="home" size={20} color="#fff" />
            <Text style={[styles.homeBtnText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
              BACK TO HOME
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.replace({ pathname: "/run", params: { type: actType } })}
            style={[styles.runAgainBtn, { borderColor: actColor, borderRadius: colors.radius }]}
          >
            <Ionicons name="play" size={20} color={actColor} />
            <Text style={[styles.runAgainText, { color: actColor, fontFamily: "Inter_700Bold" }]}>
              RUN AGAIN
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 24 },
  header: { alignItems: "center" },
  heroSection: { alignItems: "center", gap: 8 },
  congrats: { fontSize: 26, letterSpacing: 2 },
  message: { fontSize: 15, textAlign: "center" },
  bigDistance: {
    alignItems: "center",
    paddingVertical: 30,
    borderWidth: 2,
    borderRadius: 20,
    gap: 4,
  },
  distanceNumber: { fontSize: 64, lineHeight: 68 },
  distanceUnit: { fontSize: 16, letterSpacing: 3 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    width: "47%",
    padding: 14,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  statVal: { fontSize: 18 },
  statUnit: { fontSize: 11, marginTop: -2 },
  statLabel: { fontSize: 12 },
  actions: { gap: 12 },
  homeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 52,
  },
  homeBtnText: { fontSize: 15, letterSpacing: 1 },
  runAgainBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 52,
    borderWidth: 1.5,
  },
  runAgainText: { fontSize: 15, letterSpacing: 1 },
});
