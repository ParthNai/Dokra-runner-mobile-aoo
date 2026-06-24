import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityCard } from "@/components/ActivityCard";
import { useAuth } from "@/context/AuthContext";
import { useActivity } from "@/context/ActivityContext";
import { useColors } from "@/hooks/useColors";

const ACHIEVEMENTS = [
  { id: "1", icon: "walk", label: "First Run", unlocked: true },
  { id: "2", icon: "medal", label: "5K Club", unlocked: false },
  { id: "3", icon: "trophy", label: "10K Hero", unlocked: false },
  { id: "4", icon: "flame", label: "7 Day Streak", unlocked: false },
  { id: "5", icon: "ribbon", label: "Community Star", unlocked: false },
  { id: "6", icon: "star", label: "Speed Demon", unlocked: false },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { getActivitiesByUser } = useActivity();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const activities = getActivitiesByUser(user?.id ?? "");
  const totalDist = activities.reduce((s, a) => s + a.distance, 0);
  const totalCal = activities.reduce((s, a) => s + a.calories, 0);
  const recentActivities = activities.slice(0, 3);

  const achievements = ACHIEVEMENTS.map((a) => ({
    ...a,
    unlocked: a.id === "1" ? activities.length > 0 : false,
  }));

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/splash");
        },
      },
    ]);
  };

  if (!user) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 16, paddingBottom: Platform.OS === "web" ? 120 : 100 },
        ]}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            PROFILE
          </Text>
          <Pressable onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={colors.primary} />
          </Pressable>
        </View>

        <View style={[styles.profileCard, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
          <View style={styles.avatarRow}>
            {user.profilePhoto ? (
              <Image source={{ uri: user.profilePhoto }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                <Text style={[styles.avatarInitial, { fontFamily: "Inter_700Bold" }]}>
                  {user.fullName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                {user.fullName}
              </Text>
              <Text style={[styles.userClub, { color: colors.accent, fontFamily: "Inter_500Medium" }]}>
                {user.clubName || "DOKRA Running Club"}
              </Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={colors.mutedForeground} />
                <Text style={[styles.location, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {[user.city, user.state].filter(Boolean).join(", ") || "India"}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.statsRow}>
            {[
              { label: "Total Distance", value: `${totalDist.toFixed(1)} km` },
              { label: "Activities", value: activities.length.toString() },
              { label: "Calories", value: `${totalCal}` },
            ].map((s) => (
              <View key={s.label} style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
                  {s.value}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.infoSection}>
          {[
            { icon: "mail-outline", label: "Email", value: user.email },
            { icon: "phone-portrait-outline", label: "Mobile", value: user.mobile || "Not set" },
            { icon: "person-outline", label: "Gender", value: user.gender || "Not set" },
            { icon: "calendar-outline", label: "Date of Birth", value: user.dateOfBirth || "Not set" },
          ].map((row) => (
            <View key={row.label} style={[styles.infoRow, { borderColor: colors.border }]}>
              <Ionicons name={row.icon as any} size={18} color={colors.mutedForeground} />
              <View style={styles.infoText}>
                <Text style={[styles.infoLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {row.label}
                </Text>
                <Text style={[styles.infoValue, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  {row.value}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          ACHIEVEMENTS
        </Text>
        <View style={styles.achievementsGrid}>
          {achievements.map((a) => (
            <View
              key={a.id}
              style={[
                styles.badge,
                {
                  backgroundColor: a.unlocked ? colors.accent + "22" : colors.card,
                  borderColor: a.unlocked ? colors.accent : colors.border,
                  borderRadius: colors.radius,
                  opacity: a.unlocked ? 1 : 0.5,
                },
              ]}
            >
              <Ionicons
                name={a.icon as any}
                size={26}
                color={a.unlocked ? colors.accent : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.badgeLabel,
                  {
                    color: a.unlocked ? colors.foreground : colors.mutedForeground,
                    fontFamily: "Inter_500Medium",
                  },
                ]}
              >
                {a.label}
              </Text>
            </View>
          ))}
        </View>

        {recentActivities.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              RECENT ACTIVITIES
            </Text>
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
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 22, letterSpacing: 2 },
  profileCard: { padding: 16, gap: 14, borderWidth: 1 },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: { width: 70, height: 70, borderRadius: 35 },
  avatarPlaceholder: { width: 70, height: 70, borderRadius: 35, alignItems: "center", justifyContent: "center" },
  avatarInitial: { color: "#fff", fontSize: 30 },
  userInfo: { flex: 1, gap: 4 },
  userName: { fontSize: 20 },
  userClub: { fontSize: 13 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  location: { fontSize: 12 },
  divider: { height: 1 },
  statsRow: { flexDirection: "row" },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 18 },
  statLabel: { fontSize: 11, textAlign: "center" },
  infoSection: { gap: 0 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  infoText: { gap: 1 },
  infoLabel: { fontSize: 11 },
  infoValue: { fontSize: 14 },
  sectionTitle: { fontSize: 14, letterSpacing: 1.5 },
  achievementsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badge: { width: "30%", alignItems: "center", padding: 12, gap: 6, borderWidth: 1, minWidth: 90 },
  badgeLabel: { fontSize: 11, textAlign: "center" },
});
