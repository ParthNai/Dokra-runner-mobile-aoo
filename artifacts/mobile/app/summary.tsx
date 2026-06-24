import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RunMap from "@/components/RunMap";
import { useAuth } from "@/context/AuthContext";
import { useActivity } from "@/context/ActivityContext";
import { useColors } from "@/hooks/useColors";

const TYPE_CONFIG: Record<string, { label: string; color: string; actName: string }> = {
  running: { label: "Running", color: "#E31E24", actName: "Morning Run" },
  walking: { label: "Walking", color: "#C9A227", actName: "Evening Walk" },
  cycling: { label: "Cycling", color: "#3B82F6", actName: "Cycling Session" },
};

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatDatetime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) +
    ", " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

interface SplitRow {
  km: number;
  pace: string;
  speed: number;
  pct: number;
}

export default function SummaryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id: string;
    distance: string;
    duration: string;
    avgSpeed: string;
    maxSpeed: string;
    calories: string;
    steps: string;
    bpm: string;
    pace: string;
    type: string;
  }>();

  const { activities } = useActivity();

  const distance = parseFloat(params.distance ?? "0");
  const duration = parseInt(params.duration ?? "0");
  const avgSpeed = parseFloat(params.avgSpeed ?? "0");
  const maxSpeed = parseFloat(params.maxSpeed ?? "0");
  const calories = parseInt(params.calories ?? "0");
  const steps = parseInt(params.steps ?? "0");
  const bpm = parseInt(params.bpm ?? "0");
  const pace = params.pace ?? "--'--\"";
  const actType = params.type ?? "running";
  const actId = params.id;

  const activity = activities.find((a) => a.id === actId);

  const config = TYPE_CONFIG[actType] || TYPE_CONFIG.running;
  const actColor = config.color;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const splits = useMemo<SplitRow[]>(() => {
    if (distance < 0.1) return [];
    const count = Math.floor(distance);
    const rows: SplitRow[] = [];
    const baseSpeed = avgSpeed > 0 ? avgSpeed : 8;
    for (let i = 1; i <= Math.min(count, 10); i++) {
      const variation = 0.85 + Math.random() * 0.3;
      const spd = Math.round(baseSpeed * variation * 10) / 10;
      const paceMin = spd > 0 ? 60 / spd : 0;
      const pM = Math.floor(paceMin);
      const pS = Math.round((paceMin - pM) * 60);
      rows.push({
        km: i,
        pace: `${pM}'${pS.toString().padStart(2, "0")}"`,
        speed: spd,
        pct: Math.min(spd / (baseSpeed * 1.3), 1),
      });
    }
    if (distance - count > 0.05) {
      const partial = distance - count;
      const spd = Math.round(baseSpeed * 0.9 * 10) / 10;
      const paceMin = spd > 0 ? 60 / spd : 0;
      const pM = Math.floor(paceMin);
      const pS = Math.round((paceMin - pM) * 60);
      rows.push({
        km: Math.round(distance * 100) / 100,
        pace: `${pM}'${pS.toString().padStart(2, "0")}"`,
        speed: spd,
        pct: spd / (baseSpeed * 1.3),
      });
    }
    return rows;
  }, [distance, avgSpeed]);

  const mapRef = React.useRef(null);
  const dummyLocation = activity?.route?.[0] ?? null;

  return (
    <View style={[styles.container, { backgroundColor: "#000" }]}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Pressable onPress={() => router.replace("/(tabs)/")} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <Text style={[styles.headerTitle, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
          Activity Summary
        </Text>
        <Pressable style={styles.shareBtn} onPress={() => router.push({
          pathname: "/share-card",
          params: {
            id: actId,
            distance: params.distance,
            duration: params.duration,
            avgSpeed: params.avgSpeed,
            calories: params.calories,
            steps: params.steps,
            pace: params.pace,
            type: actType,
            date: activity?.date ?? new Date().toISOString(),
            city: activity?.city ?? "Ahmedabad",
            state: activity?.state ?? "Gujarat",
          }
        })}>
          <Ionicons name="share-outline" size={22} color="#fff" />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 30 }]}
      >
        {/* ROUTE MAP */}
        <View style={styles.mapWrap}>
          {dummyLocation && activity ? (
            <RunMap
              mapRef={mapRef}
              currentLocation={dummyLocation}
              route={activity.route}
              actColor={actColor}
            />
          ) : (
            <View style={[styles.mapFallback, { backgroundColor: "#111" }]}>
              <Ionicons name="map" size={36} color={actColor} />
              <Text style={[styles.mapFallbackText, { color: "#666", fontFamily: "Inter_400Regular" }]}>
                Map preview on mobile device
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.content, { backgroundColor: "#0A0A0A" }]}>
          {/* ACTIVITY TITLE */}
          <View style={[styles.actHeader, { borderBottomColor: "#1A1A1A" }]}>
            <View style={[styles.actIcon, { backgroundColor: actColor + "22" }]}>
              <Ionicons name={actType === "running" ? "walk" : actType === "walking" ? "footsteps" : "bicycle"} size={22} color={actColor} />
            </View>
            <View style={styles.actInfo}>
              <Text style={[styles.actName, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                {config.actName}
              </Text>
              <Text style={[styles.actDate, { color: "#888", fontFamily: "Inter_400Regular" }]}>
                {activity ? formatDatetime(activity.date) : new Date().toLocaleString()}
              </Text>
            </View>
          </View>

          {/* TOP 3 STATS */}
          <View style={[styles.top3, { borderBottomColor: "#1A1A1A" }]}>
            <View style={styles.top3Item}>
              <Text style={[styles.top3Val, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                {distance.toFixed(2)}
              </Text>
              <Text style={[styles.top3Label, { color: "#888", fontFamily: "Inter_400Regular" }]}>
                DISTANCE (KM)
              </Text>
            </View>
            <View style={[styles.top3Div, { backgroundColor: "#1A1A1A" }]} />
            <View style={styles.top3Item}>
              <Text style={[styles.top3Val, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                {formatTime(duration)}
              </Text>
              <Text style={[styles.top3Label, { color: "#888", fontFamily: "Inter_400Regular" }]}>
                DURATION
              </Text>
            </View>
            <View style={[styles.top3Div, { backgroundColor: "#1A1A1A" }]} />
            <View style={styles.top3Item}>
              <Text style={[styles.top3Val, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                {pace}
              </Text>
              <Text style={[styles.top3Label, { color: "#888", fontFamily: "Inter_400Regular" }]}>
                AVG PACE (MIN/KM)
              </Text>
            </View>
          </View>

          {/* MORE STATS */}
          <View style={[styles.moreStats, { borderBottomColor: "#1A1A1A" }]}>
            {[
              { label: "AVG SPEED (KM/H)", value: avgSpeed.toFixed(1) },
              { label: "CALORIES", value: calories.toString() },
              { label: "AVG HR (BPM)", value: bpm > 0 ? bpm.toString() : "--" },
            ].map((s) => (
              <View key={s.label} style={styles.moreStat}>
                <Text style={[styles.moreStatVal, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                  {s.value}
                </Text>
                <Text style={[styles.moreStatLabel, { color: "#888", fontFamily: "Inter_400Regular" }]}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>

          {/* SPLITS */}
          {splits.length > 0 && (
            <View style={styles.splitsSection}>
              <Text style={[styles.splitsTitle, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                SPLITS
              </Text>
              <View style={[styles.splitsHeader, { borderBottomColor: "#2A2A2A" }]}>
                <Text style={[styles.splitHeaderCell, { color: "#666", flex: 0.6, fontFamily: "Inter_500Medium" }]}>KM</Text>
                <Text style={[styles.splitHeaderCell, { color: "#666", flex: 1.5, fontFamily: "Inter_500Medium" }]}>PACE</Text>
                <Text style={[styles.splitHeaderCell, { color: "#666", flex: 2.5, fontFamily: "Inter_500Medium" }]}></Text>
                <Text style={[styles.splitHeaderCell, { color: "#666", flex: 1, textAlign: "right", fontFamily: "Inter_500Medium" }]}>SPEED</Text>
              </View>
              {splits.map((s) => (
                <View key={s.km} style={[styles.splitRow, { borderBottomColor: "#1A1A1A" }]}>
                  <Text style={[styles.splitCell, { color: "#ccc", flex: 0.6, fontFamily: "Inter_500Medium" }]}>
                    {s.km}
                  </Text>
                  <Text style={[styles.splitCell, { color: "#fff", flex: 1.5, fontFamily: "Inter_700Bold" }]}>
                    {s.pace}
                  </Text>
                  <View style={{ flex: 2.5, paddingRight: 10 }}>
                    <View style={[styles.splitBar, { backgroundColor: "#1A1A1A" }]}>
                      <View style={[styles.splitFill, { width: `${s.pct * 100}%`, backgroundColor: actColor }]} />
                    </View>
                  </View>
                  <Text style={[styles.splitCell, { color: "#aaa", flex: 1, textAlign: "right", fontFamily: "Inter_400Regular" }]}>
                    {s.speed} km/h
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* SAVE BUTTON */}
          <Pressable
            onPress={() => router.replace("/(tabs)/")}
            style={[styles.saveBtn, { backgroundColor: colors.primary, borderRadius: 12 }]}
          >
            <Text style={[styles.saveBtnText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
              SAVE ACTIVITY
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
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16 },
  shareBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  scroll: { gap: 0 },
  mapWrap: { height: 240, marginTop: Platform.OS === "web" ? 67 + 44 : 90 },
  mapFallback: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  mapFallbackText: { fontSize: 13 },
  content: { flex: 1, paddingBottom: 20 },
  actHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
  },
  actIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  actInfo: { gap: 3 },
  actName: { fontSize: 18 },
  actDate: { fontSize: 12 },
  top3: { flexDirection: "row", alignItems: "center", paddingVertical: 20, borderBottomWidth: 1, paddingHorizontal: 8 },
  top3Item: { flex: 1, alignItems: "center", gap: 4 },
  top3Val: { fontSize: 22 },
  top3Label: { fontSize: 9, letterSpacing: 0.5, textAlign: "center" },
  top3Div: { width: 1, height: 40 },
  moreStats: { flexDirection: "row", paddingVertical: 16, borderBottomWidth: 1 },
  moreStat: { flex: 1, alignItems: "center", gap: 3 },
  moreStatVal: { fontSize: 20 },
  moreStatLabel: { fontSize: 9, textAlign: "center", letterSpacing: 0.5 },
  splitsSection: { padding: 16, gap: 0 },
  splitsTitle: { fontSize: 13, letterSpacing: 1.5, marginBottom: 10 },
  splitsHeader: { flexDirection: "row", paddingBottom: 8, borderBottomWidth: 1 },
  splitHeaderCell: { fontSize: 10, letterSpacing: 1 },
  splitRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1 },
  splitCell: { fontSize: 13 },
  splitBar: { height: 6, borderRadius: 3, overflow: "hidden" },
  splitFill: { height: 6, borderRadius: 3 },
  saveBtn: { marginHorizontal: 16, marginTop: 20, paddingVertical: 16, alignItems: "center" },
  saveBtnText: { fontSize: 16, letterSpacing: 1.5 },
});
