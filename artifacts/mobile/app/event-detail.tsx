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
import { useAuth } from "@/context/AuthContext";
import { useCommunity } from "@/context/CommunityContext";
import { useColors } from "@/hooks/useColors";

function daysLeft(dateStr: string): number {
  try {
    const parts = dateStr.split(",")[0].trim().split(" ");
    const day = parseInt(parts[0]);
    const months: Record<string, number> = {
      January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
      July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
    };
    const month = months[parts[1]] ?? 4;
    const year = new Date().getFullYear();
    const target = new Date(year, month, day);
    const diff = Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  } catch {
    return 5;
  }
}

export default function EventDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { events, toggleEventGoing, toggleEventInterested } = useCommunity();

  const event = events.find((e) => e.id === params.id);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const userId = user?.id ?? "";

  if (!event) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: colors.foreground }}>Event not found</Text>
      </View>
    );
  }

  const isGoing = event.going.includes(userId);
  const isInterested = event.interested.includes(userId);
  const dl = daysLeft(event.date);

  return (
    <View style={[styles.container, { backgroundColor: "#000" }]}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <Text style={[styles.headerTitle, { color: "#fff", fontFamily: "Inter_600SemiBold" }]}>
          Event Details
        </Text>
        <Pressable style={styles.iconBtn}>
          <Ionicons name="share-outline" size={22} color="#fff" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 30 }]}
      >
        {/* EVENT BANNER */}
        <LinearGradient
          colors={[event.bannerColor, "#1a0000", "#000"]}
          style={styles.banner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerLeft}>
              <View style={[styles.runnerIcon, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
                <Ionicons name="walk" size={60} color="#fff" />
              </View>
            </View>
            <View style={styles.bannerRight}>
              <Text style={[styles.bannerTitle, { fontFamily: "Inter_700Bold" }]}>
                {event.subtitle}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* EVENT TYPE BADGE */}
          <View style={[styles.typeBadge, { backgroundColor: event.bannerColor, borderRadius: 20, alignSelf: "flex-start" }]}>
            <Text style={[styles.typeBadgeText, { fontFamily: "Inter_600SemiBold" }]}>
              {event.type}
            </Text>
          </View>

          {/* EVENT TITLE */}
          <Text style={[styles.eventTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            {event.title}
          </Text>

          {/* DATE & TIME */}
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: "#E31E2422" }]}>
              <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.infoMain, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                {event.date}
              </Text>
              <Text style={[styles.infoSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {event.time}
              </Text>
            </View>
          </View>

          {/* LOCATION */}
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: "#C9A22722" }]}>
              <Ionicons name="location-outline" size={18} color={colors.accent} />
            </View>
            <Text style={[styles.infoMain, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
              {event.location}
            </Text>
          </View>

          {/* STATS STRIP */}
          <View style={[styles.statsStrip, { backgroundColor: colors.card, borderRadius: 14, borderColor: colors.border }]}>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={20} color={colors.primary} />
              <Text style={[styles.statVal, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                {event.going.length + 126}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Going
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Ionicons name="star-outline" size={20} color={colors.accent} />
              <Text style={[styles.statVal, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                {event.interested.length + 22}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Interested
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={20} color="#22c55e" />
              <Text style={[styles.statVal, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                {dl}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Days Left
              </Text>
            </View>
          </View>

          {/* ABOUT */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              About Event
            </Text>
            <Text style={[styles.sectionBody, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {event.description}
            </Text>
          </View>

          {/* HIGHLIGHTS */}
          <View style={[styles.section, { backgroundColor: colors.card, borderRadius: 14, borderColor: colors.border, padding: 16 }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Event Highlights
            </Text>
            <View style={styles.highlights}>
              {event.highlights.map((h, i) => (
                <View key={i} style={styles.highlightRow}>
                  <View style={[styles.bullet, { backgroundColor: event.bannerColor }]} />
                  <Text style={[styles.highlightText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                    {h}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* BUTTONS */}
          <Pressable
            onPress={() => toggleEventGoing(event.id, userId)}
            style={[
              styles.goingBtn,
              {
                backgroundColor: isGoing ? "#22c55e" : colors.primary,
                borderRadius: 12,
              },
            ]}
          >
            {isGoing && <Ionicons name="checkmark" size={20} color="#fff" />}
            <Text style={[styles.goingBtnText, { fontFamily: "Inter_700Bold" }]}>
              {isGoing ? "YOU'RE GOING!" : "I'M GOING"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => toggleEventInterested(event.id, userId)}
            style={[
              styles.interestedBtn,
              {
                borderColor: isInterested ? colors.accent : colors.border,
                borderRadius: 12,
                backgroundColor: isInterested ? colors.accent + "18" : "transparent",
              },
            ]}
          >
            {isInterested && <Ionicons name="star" size={18} color={colors.accent} />}
            <Text
              style={[
                styles.interestedBtnText,
                {
                  color: isInterested ? colors.accent : colors.foreground,
                  fontFamily: isInterested ? "Inter_600SemiBold" : "Inter_500Medium",
                },
              ]}
            >
              {isInterested ? "INTERESTED" : "INTERESTED"}
            </Text>
          </Pressable>
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
    paddingHorizontal: 16,
    paddingBottom: 8,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  iconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16 },
  scroll: { paddingBottom: 20 },
  banner: {
    height: 220,
    marginTop: Platform.OS === "web" ? 67 + 44 : 88,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  bannerContent: { flexDirection: "row", alignItems: "center", gap: 16 },
  bannerLeft: {},
  runnerIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  bannerRight: { flex: 1 },
  bannerTitle: { fontSize: 26, color: "#fff", lineHeight: 32 },
  content: { padding: 20, gap: 16, backgroundColor: "#0A0A0A" },
  typeBadge: { paddingHorizontal: 12, paddingVertical: 5 },
  typeBadgeText: { color: "#fff", fontSize: 12 },
  eventTitle: { fontSize: 26 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  infoIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  infoMain: { fontSize: 14 },
  infoSub: { fontSize: 12, marginTop: 2 },
  statsStrip: {
    flexDirection: "row",
    paddingVertical: 16,
    borderWidth: 1,
  },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statVal: { fontSize: 22 },
  statLabel: { fontSize: 11 },
  statDivider: { width: 1 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 16, borderWidth: 0 },
  sectionBody: { fontSize: 14, lineHeight: 22 },
  highlights: { gap: 10 },
  highlightRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  bullet: { width: 8, height: 8, borderRadius: 4 },
  highlightText: { fontSize: 14 },
  goingBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  goingBtnText: { color: "#fff", fontSize: 16, letterSpacing: 1 },
  interestedBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderWidth: 1.5,
  },
  interestedBtnText: { fontSize: 15, letterSpacing: 1 },
});
