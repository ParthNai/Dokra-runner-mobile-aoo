import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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
import { useAuth } from "@/context/AuthContext";
import { useActivity } from "@/context/ActivityContext";
import { useColors } from "@/hooks/useColors";

interface Badge {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
  condition: (km: number, acts: number) => boolean;
}

const BADGES: Badge[] = [
  { id: "first_run", icon: "footsteps", title: "First Step", description: "Complete your first activity", color: "#C9A227", condition: (_k, a) => a >= 1 },
  { id: "5km", icon: "walk", title: "5 KM Club", description: "Run a total of 5 km", color: "#E31E24", condition: (k) => k >= 5 },
  { id: "10km", icon: "trending-up", title: "10 KM Runner", description: "Run a total of 10 km", color: "#E31E24", condition: (k) => k >= 10 },
  { id: "25km", icon: "flash", title: "Quarter Century", description: "Run a total of 25 km", color: "#F97316", condition: (k) => k >= 25 },
  { id: "50km", icon: "medal", title: "50 KM Legend", description: "Run a total of 50 km", color: "#8B5CF6", condition: (k) => k >= 50 },
  { id: "100km", icon: "trophy", title: "Century Runner", description: "Run a total of 100 km", color: "#FFD700", condition: (k) => k >= 100 },
  { id: "500km", icon: "ribbon", title: "500 KM Elite", description: "Run a total of 500 km", color: "#E31E24", condition: (k) => k >= 500 },
  { id: "10acts", icon: "fitness", title: "Consistent", description: "Complete 10 activities", color: "#22c55e", condition: (_k, a) => a >= 10 },
  { id: "25acts", icon: "flame", title: "On Fire", description: "Complete 25 activities", color: "#F97316", condition: (_k, a) => a >= 25 },
  { id: "50acts", icon: "star", title: "Dedicated", description: "Complete 50 activities", color: "#FFD700", condition: (_k, a) => a >= 50 },
];

export default function AchievementsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getActivitiesByUser } = useActivity();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const activities = user ? getActivitiesByUser(user.id) : [];
  const totalKm = activities.reduce((s, a) => s + a.distance, 0);
  const totalActs = activities.length;
  const earned = BADGES.filter((b) => b.condition(totalKm, totalActs));
  const locked = BADGES.filter((b) => !b.condition(totalKm, totalActs));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          Achievements
        </Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <LinearGradient
          colors={["#1a0a00", "#0A0A0A"]}
          style={[styles.banner, { borderRadius: 16, borderColor: colors.border }]}
        >
          <Text style={[styles.bannerEmoji]}>🏆</Text>
          <View style={styles.bannerText}>
            <Text style={[styles.bannerTitle, { fontFamily: "Inter_700Bold" }]}>
              <Text style={{ color: "#FFD700" }}>{earned.length}</Text>
              <Text style={{ color: colors.foreground }}>/{BADGES.length} Badges Earned</Text>
            </Text>
            <Text style={[styles.bannerSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {totalKm.toFixed(1)} km · {totalActs} activities completed
            </Text>
          </View>
        </LinearGradient>

        {earned.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
              EARNED
            </Text>
            <View style={styles.badgeGrid}>
              {earned.map((b) => (
                <View key={b.id} style={[styles.badgeCard, { backgroundColor: colors.card, borderColor: b.color + "55", borderRadius: 14 }]}>
                  <View style={[styles.badgeIconWrap, { backgroundColor: b.color + "22" }]}>
                    <Ionicons name={b.icon as any} size={30} color={b.color} />
                  </View>
                  <Text style={[styles.badgeTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{b.title}</Text>
                  <Text style={[styles.badgeDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{b.description}</Text>
                  <View style={[styles.earnedBadge, { backgroundColor: "#22c55e22" }]}>
                    <Ionicons name="checkmark-circle" size={12} color="#22c55e" />
                    <Text style={[styles.earnedText, { fontFamily: "Inter_600SemiBold" }]}>Earned</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {locked.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
              LOCKED
            </Text>
            <View style={styles.badgeGrid}>
              {locked.map((b) => (
                <View key={b.id} style={[styles.badgeCard, styles.lockedCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 14 }]}>
                  <View style={[styles.badgeIconWrap, { backgroundColor: colors.border }]}>
                    <Ionicons name="lock-closed" size={28} color={colors.mutedForeground} />
                  </View>
                  <Text style={[styles.badgeTitle, { color: colors.mutedForeground, fontFamily: "Inter_700Bold" }]}>{b.title}</Text>
                  <Text style={[styles.badgeDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{b.description}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1,
  },
  iconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17 },
  scroll: { padding: 16, gap: 16, paddingBottom: 100 },
  banner: {
    flexDirection: "row", alignItems: "center", padding: 20, gap: 16, borderWidth: 1,
  },
  bannerEmoji: { fontSize: 48 },
  bannerText: { flex: 1, gap: 6 },
  bannerTitle: { fontSize: 18, lineHeight: 26 },
  bannerSub: { fontSize: 13 },
  sectionTitle: { fontSize: 11, letterSpacing: 2, marginTop: 4 },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  badgeCard: {
    width: "47%", alignItems: "center", padding: 16, gap: 8, borderWidth: 1.5,
  },
  lockedCard: { opacity: 0.5 },
  badgeIconWrap: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  badgeTitle: { fontSize: 13, textAlign: "center" },
  badgeDesc: { fontSize: 11, textAlign: "center", lineHeight: 15 },
  earnedBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  earnedText: { fontSize: 10, color: "#22c55e" },
});
