import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useActivity } from "@/context/ActivityContext";
import { useColors } from "@/hooks/useColors";

function ConfettiDot({ color, delay, x }: { color: string; delay: number; x: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-10, 80] });
  const opacity = anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0, 1, 0] });

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: x,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: color,
        transform: [{ translateY }],
        opacity,
      }}
    />
  );
}

export default function ProfileSuccessScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getActivitiesByUser } = useActivity();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 5, tension: 100 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  if (!user) return null;

  const activities = getActivitiesByUser(user.id);
  const totalDist = user.totalDistance > 0
    ? user.totalDistance
    : activities.reduce((s, a) => s + a.distance, 0);
  const totalActivities = user.totalActivities > 0 ? user.totalActivities : activities.length;
  const totalSteps = user.totalSteps ?? 0;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 20 : insets.bottom;

  const confettiDots = [
    { color: colors.primary, x: 40, delay: 0 },
    { color: colors.accent, x: 80, delay: 200 },
    { color: "#22c55e", x: 130, delay: 100 },
    { color: colors.primary, x: 180, delay: 350 },
    { color: colors.accent, x: 230, delay: 50 },
    { color: "#22c55e", x: 280, delay: 250 },
    { color: colors.primary, x: 310, delay: 150 },
    { color: colors.accent, x: 60, delay: 300 },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad + 24 }]}>
      <View style={styles.confettiArea} pointerEvents="none">
        {confettiDots.map((d, i) => (
          <ConfettiDot key={i} color={d.color} x={d.x} delay={d.delay} />
        ))}
      </View>

      <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.checkCircle, { backgroundColor: "#22c55e" }]}>
          <Ionicons name="checkmark" size={44} color="#fff" />
        </View>
      </Animated.View>

      <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
        <Text style={[styles.successTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          Profile Updated!
        </Text>
        <Text style={[styles.successSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Your profile has been updated successfully.
        </Text>

        <View style={styles.profileBlock}>
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

          <Text style={[styles.profileName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
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
            { value: totalDist.toFixed(1), label: "Total KM" },
            { value: totalActivities.toString(), label: "Total Activities" },
            { value: Number(totalSteps).toLocaleString(), label: "Total Steps" },
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

        <View style={styles.buttons}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() => router.replace("/(tabs)/profile")}
          >
            <Text style={[styles.primaryBtnText, { fontFamily: "Inter_700Bold" }]}>
              VIEW PROFILE
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.secondaryBtn,
              { backgroundColor: colors.secondary, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() => router.replace("/(tabs)/index")}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              BACK TO HOME
            </Text>
          </Pressable>
        </View>
      </Animated.View>

      <View style={{ height: botPad + 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingHorizontal: 24 },
  confettiArea: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    height: 100,
    overflow: "hidden",
  },
  content: { alignItems: "center", marginBottom: 16 },
  checkCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  mainContent: { alignItems: "center", width: "100%", gap: 12 },
  successTitle: { fontSize: 26, textAlign: "center" },
  successSub: { fontSize: 14, textAlign: "center", marginTop: -4 },
  profileBlock: { alignItems: "center", gap: 6, marginVertical: 8 },
  avatarRing: {
    width: 86, height: 86, borderRadius: 43, padding: 3,
    alignItems: "center", justifyContent: "center",
  },
  avatar: { width: 78, height: 78, borderRadius: 39 },
  avatarFallback: {
    width: 78, height: 78, borderRadius: 39,
    alignItems: "center", justifyContent: "center",
  },
  avatarInitial: { fontSize: 32 },
  profileName: { fontSize: 20, marginTop: 6 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  locationText: { fontSize: 13 },
  clubName: { fontSize: 13, letterSpacing: 0.3 },
  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    width: "100%",
  },
  statItem: { flex: 1, alignItems: "center", gap: 3 },
  statValue: { fontSize: 18 },
  statLabel: { fontSize: 11, textAlign: "center" },
  statDivider: { width: 1, height: 32 },
  buttons: { width: "100%", gap: 12, marginTop: 4 },
  primaryBtn: {
    borderRadius: 12, paddingVertical: 16, alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontSize: 14, letterSpacing: 1.2 },
  secondaryBtn: {
    borderRadius: 12, paddingVertical: 16, alignItems: "center",
    borderWidth: 1,
  },
  secondaryBtnText: { fontSize: 14, letterSpacing: 1.2 },
});
