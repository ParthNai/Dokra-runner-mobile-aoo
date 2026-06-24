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
import { DokraLogo } from "@/components/DokraLogo";
import { useColors } from "@/hooks/useColors";

const ACTIVITIES = [
  {
    type: "walking",
    label: "Walking",
    description: "Track your walks and stay healthy",
    icon: "footsteps",
    color: "#C9A227",
    gradient: ["#1a1400", "#0A0A0A"] as const,
  },
  {
    type: "running",
    label: "Running",
    description: "Track your runs and improve",
    icon: "walk",
    color: "#E31E24",
    gradient: ["#1a0000", "#0A0A0A"] as const,
  },
  {
    type: "cycling",
    label: "Cycling",
    description: "Track your rides and go beyond",
    icon: "bicycle",
    color: "#3B82F6",
    gradient: ["#00091a", "#0A0A0A"] as const,
  },
];

export default function ActivitySelectionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <DokraLogo size="small" />
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 100 : 90 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          SELECT ACTIVITY
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Choose your activity type
        </Text>

        <View style={styles.cards}>
          {ACTIVITIES.map((a) => (
            <Pressable
              key={a.type}
              onPress={() => router.push({ pathname: "/run", params: { type: a.type } })}
              style={({ pressed }) => [styles.cardWrap, { opacity: pressed ? 0.9 : 1 }]}
            >
              <LinearGradient
                colors={a.gradient}
                style={[styles.card, { borderColor: a.color + "44", borderRadius: 18 }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cardLeft}>
                  <View style={[styles.cardIcon, { backgroundColor: a.color + "22" }]}>
                    <Ionicons name={a.icon as any} size={38} color={a.color} />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                      {a.label}
                    </Text>
                    <Text style={[styles.cardDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {a.description}
                    </Text>
                  </View>
                </View>
                <View style={[styles.arrowBtn, { backgroundColor: a.color + "22", borderColor: a.color + "66" }]}>
                  <Ionicons name="arrow-forward" size={20} color={a.color} />
                </View>
              </LinearGradient>
            </Pressable>
          ))}
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderRadius: 14, borderColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.mutedForeground} />
          <Text style={[styles.infoText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            GPS tracking will begin when you start. Make sure location permissions are enabled.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  scroll: { paddingHorizontal: 20, paddingTop: 8 },
  title: { fontSize: 28, letterSpacing: 1, marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 24 },
  cards: { gap: 14 },
  cardWrap: {},
  card: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, borderWidth: 1 },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 16, flex: 1 },
  cardIcon: { width: 68, height: 68, borderRadius: 34, alignItems: "center", justifyContent: "center" },
  cardText: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 20 },
  cardDesc: { fontSize: 13, lineHeight: 18 },
  arrowBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    marginTop: 24,
    borderWidth: 1,
  },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
