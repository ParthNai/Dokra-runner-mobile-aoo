import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RunMap from "@/components/RunMap";
import { useActivity } from "@/context/ActivityContext";
import { useColors } from "@/hooks/useColors";

const TYPE_CONFIG: Record<string, { icon: string; color: string; label: string; actName: string }> = {
  running: { icon: "walk", color: "#E31E24", label: "Running", actName: "Morning Run" },
  walking: { icon: "footsteps", color: "#C9A227", label: "Walking", actName: "Evening Walk" },
  cycling: { icon: "bicycle", color: "#3B82F6", label: "Cycling", actName: "Cycling Session" },
};

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) +
    ", " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatPace(distance: number, duration: number): string {
  if (distance < 0.01 || duration === 0) return "--'--\"";
  const paceMin = duration / 60 / distance;
  const pM = Math.floor(paceMin);
  const pS = Math.round((paceMin - pM) * 60);
  return `${pM}'${pS.toString().padStart(2, "0")}"`;
}

export default function ActivityDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const { activities, deleteActivity } = useActivity();
  const mapRef = useRef(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const activity = activities.find((a) => a.id === params.id);

  if (!activity) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.mutedForeground} />
        <Text style={[styles.notFound, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Activity not found
        </Text>
        <Pressable onPress={() => router.back()} style={[styles.backLink, { borderColor: colors.border, borderRadius: 10 }]}>
          <Text style={[{ color: colors.foreground, fontFamily: "Inter_500Medium" }]}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const cfg = TYPE_CONFIG[activity.type] || TYPE_CONFIG.running;
  const actColor = cfg.color;
  const pace = formatPace(activity.distance, activity.duration);

  const handleDelete = () => {
    Alert.alert(
      "Delete Activity",
      "Are you sure you want to delete this activity? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteActivity(activity.id);
            router.back();
          },
        },
      ]
    );
  };

  const STATS = [
    { icon: "map-outline", label: "Distance", value: `${activity.distance.toFixed(2)} km`, color: actColor },
    { icon: "time-outline", label: "Duration", value: formatTime(activity.duration), color: "#fff" },
    { icon: "hourglass-outline", label: "Avg Pace", value: pace, color: "#fff" },
    { icon: "speedometer-outline", label: "Avg Speed", value: `${activity.avgSpeed.toFixed(1)} km/h`, color: "#fff" },
    { icon: "flash-outline", label: "Max Speed", value: `${(activity.maxSpeed ?? activity.avgSpeed * 1.2).toFixed(1)} km/h`, color: "#fff" },
    { icon: "flame-outline", label: "Calories", value: `${activity.calories} kcal`, color: "#FF6B35" },
    { icon: "heart-outline", label: "Avg Heart Rate", value: `${activity.avgHeartRate ?? 150} bpm`, color: "#E31E24" },
    { icon: "footsteps-outline", label: "Steps", value: (activity.steps ?? Math.round(activity.distance * 1312)).toLocaleString(), color: "#C9A227" },
    { icon: "trending-up-outline", label: "Elevation Gain", value: `${activity.elevationGain ?? Math.round(activity.distance * 8)} m`, color: "#22c55e" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: "#000" }]}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <Text style={[styles.headerTitle, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
          Activity Detail
        </Text>
        <Pressable style={styles.iconBtn}>
          <Ionicons name="share-outline" size={22} color="#fff" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 30 }]}
      >
        {/* MAP */}
        <View style={styles.mapWrap}>
          {activity.route && activity.route.length > 0 ? (
            <RunMap
              mapRef={mapRef}
              currentLocation={activity.route[activity.route.length - 1]}
              route={activity.route}
              actColor={actColor}
            />
          ) : (
            <View style={[styles.mapFallback]}>
              <Ionicons name="map" size={36} color={actColor} />
              <Text style={[styles.mapFallbackText, { fontFamily: "Inter_400Regular" }]}>
                Map preview on mobile device
              </Text>
            </View>
          )}
        </View>

        <View style={{ backgroundColor: "#0A0A0A" }}>
          {/* ACTIVITY HEADER */}
          <View style={[styles.actHeader, { borderBottomColor: "#1A1A1A" }]}>
            <View style={[styles.actIcon, { backgroundColor: actColor + "22" }]}>
              <Ionicons name={cfg.icon as any} size={22} color={actColor} />
            </View>
            <View>
              <Text style={[styles.actName, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                {cfg.actName}
              </Text>
              <Text style={[styles.actDate, { color: "#888", fontFamily: "Inter_400Regular" }]}>
                {formatDateTime(activity.date)}
              </Text>
            </View>
          </View>

          {/* STATS LIST */}
          <View style={styles.statsList}>
            {STATS.map((s, i) => (
              <View
                key={s.label}
                style={[
                  styles.statRow,
                  { borderBottomColor: "#1A1A1A" },
                  i === STATS.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View style={[styles.statIconWrap, { backgroundColor: s.color + "18" }]}>
                  <Ionicons name={s.icon as any} size={18} color={s.color} />
                </View>
                <Text style={[styles.statLabel, { color: "#888", fontFamily: "Inter_400Regular" }]}>
                  {s.label}
                </Text>
                <Text style={[styles.statValue, { color: "#fff", fontFamily: "Inter_600SemiBold" }]}>
                  {s.value}
                </Text>
              </View>
            ))}
          </View>

          {/* DELETE BUTTON */}
          <Pressable
            onPress={handleDelete}
            style={[styles.deleteBtn, { borderColor: "#E31E24", borderRadius: 12 }]}
          >
            <Ionicons name="trash-outline" size={18} color="#E31E24" />
            <Text style={[styles.deleteBtnText, { color: "#E31E24", fontFamily: "Inter_700Bold" }]}>
              DELETE ACTIVITY
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
    paddingBottom: 10,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  iconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16 },
  scroll: {},
  mapWrap: {
    height: 240,
    marginTop: Platform.OS === "web" ? 67 + 44 : 88,
  },
  mapFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#111",
  },
  mapFallbackText: { fontSize: 13, color: "#666" },
  actHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
  },
  actIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  actName: { fontSize: 18 },
  actDate: { fontSize: 12, marginTop: 3 },
  statsList: { paddingHorizontal: 16 },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
  },
  statIconWrap: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  statLabel: { flex: 1, fontSize: 14 },
  statValue: { fontSize: 15 },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderWidth: 1.5,
  },
  deleteBtnText: { fontSize: 15, letterSpacing: 1 },
  notFound: { fontSize: 16, marginTop: 12 },
  backLink: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, borderWidth: 1 },
});
