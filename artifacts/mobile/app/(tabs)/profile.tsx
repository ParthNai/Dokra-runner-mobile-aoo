import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
import { useAuth } from "@/context/AuthContext";
import { useActivity } from "@/context/ActivityContext";
import { useColors } from "@/hooks/useColors";

const MENU_ITEMS = [
  { id: "edit", icon: "person-outline", label: "Edit Profile", route: "/edit-profile" },
  { id: "achievements", icon: "trophy-outline", label: "Achievements", route: "/achievements" },
  { id: "activities", icon: "walk-outline", label: "My Activities", route: "/history" },
  { id: "settings", icon: "settings-outline", label: "Settings", route: "/settings" },
  { id: "support", icon: "help-circle-outline", label: "Help & Support", route: "/help-support" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { getActivitiesByUser } = useActivity();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const activities = user ? getActivitiesByUser(user.id) : [];
  const totalDist = activities.reduce((s, a) => s + a.distance, 0);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout from DOKRA Running Club?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/(auth)/splash");
          },
        },
      ]
    );
  };

  const handleMenuPress = (item: (typeof MENU_ITEMS)[0]) => {
    if (item.route) {
      router.push(item.route as any);
    } else {
      Alert.alert("Coming Soon", `${item.label} will be available soon.`);
    }
  };

  if (!user) return null;

  const displayDist = (user.totalDistance > 0 ? user.totalDistance : totalDist).toFixed(1);
  const displayActivities = user.totalActivities > 0 ? user.totalActivities : activities.length;
  const displaySteps = user.totalSteps ?? 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 12, paddingBottom: Platform.OS === "web" ? 120 : 100 },
        ]}
      >
        <View style={styles.headerRow}>
          <Pressable style={styles.headerIcon}>
            <Ionicons name="notifications-outline" size={22} color={colors.foreground} />
          </Pressable>
          <View style={styles.logoBlock}>
            <Text style={[styles.logoMain, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
              DOKRA
            </Text>
            <Text style={[styles.logoSub, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
              RUNNING CLUB
            </Text>
          </View>
          <Pressable style={styles.headerIcon} onPress={() => router.push("/settings" as any)}>
            <Ionicons name="settings-outline" size={22} color={colors.foreground} />
          </Pressable>
        </View>

        <View style={styles.profileCenter}>
          <View style={styles.avatarWrapper}>
            <LinearGradient
              colors={[colors.accent, colors.primary]}
              style={styles.avatarRing}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {user.profilePhoto ? (
                <Image source={{ uri: user.profilePhoto }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarFallback, { backgroundColor: colors.card }]}>
                  <Text style={[styles.avatarInitial, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
                    {user.fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </LinearGradient>
          </View>

          <Text style={[styles.userName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            {user.fullName}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={13} color={colors.mutedForeground} />
            <Text style={[styles.locationText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {[user.city, user.state].filter(Boolean).join(", ") || "India"}
            </Text>
          </View>
          <Text style={[styles.clubName, { color: colors.accent, fontFamily: "Inter_600SemiBold" }]}>
            {user.clubName || "DOKRA Running Club"}
          </Text>
        </View>

        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { value: displayDist, label: "Total KM" },
            { value: displayActivities.toString(), label: "Total Activities" },
            { value: Number(displaySteps).toLocaleString(), label: "Total Steps" },
          ].map((s, i, arr) => (
            <React.Fragment key={s.label}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
                  {s.value}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {s.label}
                </Text>
              </View>
              {i < arr.length - 1 && (
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              )}
            </React.Fragment>
          ))}
        </View>

        <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {MENU_ITEMS.map((item, idx) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.menuItem,
                { borderColor: colors.border },
                idx < MENU_ITEMS.length - 1 && styles.menuItemBorder,
                pressed && { backgroundColor: colors.border + "40" },
              ]}
              onPress={() => handleMenuPress(item)}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconWrap, { backgroundColor: colors.secondary }]}>
                  <Ionicons name={item.icon as any} size={18} color={colors.primary} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  {item.label}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
            </Pressable>
          ))}

          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && { backgroundColor: colors.border + "40" },
            ]}
            onPress={handleLogout}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconWrap, { backgroundColor: "#E31E2422" }]}>
                <Ionicons name="log-out-outline" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
                Logout
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, gap: 20 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIcon: { padding: 4 },
  logoBlock: { alignItems: "center" },
  logoMain: { fontSize: 18, letterSpacing: 3 },
  logoSub: { fontSize: 9, letterSpacing: 2.5, marginTop: -2 },
  profileCenter: { alignItems: "center", gap: 6 },
  avatarWrapper: { marginBottom: 4 },
  avatarRing: {
    width: 94,
    height: 94,
    borderRadius: 47,
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: { width: 86, height: 86, borderRadius: 43 },
  avatarFallback: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { fontSize: 36 },
  userName: { fontSize: 22, marginTop: 2 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  locationText: { fontSize: 13 },
  clubName: { fontSize: 13, letterSpacing: 0.5 },
  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 8,
  },
  statItem: { flex: 1, alignItems: "center", gap: 3 },
  statValue: { fontSize: 20 },
  statLabel: { fontSize: 11, textAlign: "center" },
  statDivider: { width: 1, height: 36 },
  menuCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  menuItemBorder: { borderBottomWidth: 1 },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { fontSize: 15 },
});
