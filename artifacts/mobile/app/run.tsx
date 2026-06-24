import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RunMap from "@/components/RunMap";
import { useAuth } from "@/context/AuthContext";
import { useActivity, RoutePoint } from "@/context/ActivityContext";
import { useColors } from "@/hooks/useColors";

type RunState = "idle" | "running" | "paused";

const CALORIES_PER_KM: Record<string, number> = {
  running: 65,
  walking: 40,
  cycling: 30,
};
const STEPS_PER_KM = 1312;
const SIMULATED_HEART_RATE: Record<string, number> = {
  running: 158,
  walking: 112,
  cycling: 138,
};

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  running: { label: "Running", color: "#E31E24" },
  walking: { label: "Walking", color: "#C9A227" },
  cycling: { label: "Cycling", color: "#3B82F6" },
};

function calcDistance(p1: RoutePoint, p2: RoutePoint): number {
  const R = 6371;
  const dLat = ((p2.latitude - p1.latitude) * Math.PI) / 180;
  const dLon = ((p2.longitude - p1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.latitude * Math.PI) / 180) *
    Math.cos((p2.latitude * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatPace(dist: number, dur: number): string {
  if (dist < 0.01 || dur === 0) return "--'--\"";
  const paceMin = dur / 60 / dist;
  const paceM = Math.floor(paceMin);
  const paceS = Math.round((paceMin - paceM) * 60);
  return `${paceM}'${paceS.toString().padStart(2, "0")}\"`;
}

export default function RunScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { addActivity } = useActivity();
  const params = useLocalSearchParams<{ type: string }>();
  const actType = (params.type as "running" | "walking" | "cycling") || "running";

  const mapRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationRef = useRef<any>(null);

  const [state, setState] = useState<RunState>("idle");
  const [route, setRoute] = useState<RoutePoint[]>([]);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<RoutePoint | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [speed, setSpeed] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);

  const actConfig = TYPE_CONFIG[actType] || TYPE_CONFIG.running;
  const actColor = actConfig.color;
  const calories = Math.round(distance * (CALORIES_PER_KM[actType] ?? 60));
  const steps = Math.round(distance * STEPS_PER_KM);
  const bpm = SIMULATED_HEART_RATE[actType] ?? 150;
  const pace = formatPace(distance, duration);

  useEffect(() => {
    requestPermission();
    return () => stopTracking();
  }, []);

  const requestPermission = async () => {
    if (Platform.OS === "web") {
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setCurrentLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
            setHasPermission(true);
          },
          () => {
            setHasPermission(false);
            setCurrentLocation({ latitude: 19.076, longitude: 72.8777 });
          }
        );
      } else {
        setHasPermission(false);
        setCurrentLocation({ latitude: 19.076, longitude: 72.8777 });
      }
      return;
    }
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setHasPermission(false);
      Alert.alert("Permission needed", "Location access is required for GPS tracking.");
      return;
    }
    setHasPermission(true);
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    setCurrentLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
  };

  const updateLocation = (point: RoutePoint, rawSpeed: number) => {
    setCurrentLocation(point);
    setRoute((prev) => {
      if (prev.length > 0) {
        const dist = calcDistance(prev[prev.length - 1], point);
        if (dist > 0.003) {
          setDistance((d) => d + dist);
          return [...prev, point];
        }
        return prev;
      }
      return [...prev, point];
    });
    const spd = Math.max(0, rawSpeed * 3.6);
    setSpeed(spd);
    setMaxSpeed((m) => Math.max(m, spd));
    if (mapRef.current?.animateToRegion) {
      mapRef.current.animateToRegion(
        { latitude: point.latitude, longitude: point.longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 },
        500
      );
    }
  };

  const startTracking = async () => {
    if (Platform.OS === "web") {
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        const id = navigator.geolocation.watchPosition(
          (pos) => updateLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }, pos.coords.speed ?? 0),
          undefined,
          { enableHighAccuracy: true }
        );
        locationRef.current = { remove: () => navigator.geolocation.clearWatch(id) };
      }
      return;
    }
    const sub = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 5 },
      (loc) => updateLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude }, loc.coords.speed ?? 0)
    );
    locationRef.current = sub;
  };

  const stopTracking = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (locationRef.current) { locationRef.current.remove(); locationRef.current = null; }
  };

  const handleStart = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setState("running");
    setRoute(currentLocation ? [currentLocation] : []);
    setDistance(0);
    setDuration(0);
    setMaxSpeed(0);
    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    await startTracking();
  };

  const handlePause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setState("paused");
    stopTracking();
  };

  const handleResume = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setState("running");
    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    await startTracking();
  };

  const handleFinish = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    stopTracking();
    setState("idle");
    const avgSpeed = duration > 0 ? distance / (duration / 3600) : 0;
    if (!user) return;
    addActivity({
      userId: user.id,
      type: actType,
      distance,
      duration,
      avgSpeed,
      maxSpeed,
      calories,
      steps,
      avgHeartRate: bpm,
      elevationGain: Math.round(distance * 8),
      date: new Date().toISOString(),
      route,
      clubName: user.clubName || "DOKRA Running Club",
      city: user.city || "",
      state: user.state || "",
    }).then((activity) => {
      router.replace({
        pathname: "/summary",
        params: {
          id: activity.id,
          distance: distance.toFixed(4),
          duration: duration.toString(),
          avgSpeed: avgSpeed.toFixed(2),
          maxSpeed: maxSpeed.toFixed(2),
          calories: calories.toString(),
          steps: steps.toString(),
          bpm: bpm.toString(),
          pace,
          type: actType,
        },
      });
    });
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: "#000" }]}>
      {/* TOP BAR */}
      <View style={[styles.topBar, { paddingTop: topPad + 6 }]}>
        <Pressable onPress={() => { stopTracking(); router.back(); }} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <View style={styles.topCenter}>
          <Text style={[styles.actLabel, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
            {actConfig.label}
          </Text>
          {state === "running" && (
            <View style={styles.gpsRow}>
              <View style={[styles.gpsDot, { backgroundColor: "#22c55e" }]} />
              <Text style={[styles.gpsText, { color: "#22c55e", fontFamily: "Inter_500Medium" }]}>
                GPS ON
              </Text>
            </View>
          )}
        </View>
        <Pressable style={styles.iconBtn}>
          <Ionicons name="musical-notes-outline" size={22} color="#fff" />
        </Pressable>
      </View>

      {/* MAP */}
      <View style={styles.mapWrap}>
        {currentLocation ? (
          <RunMap mapRef={mapRef} currentLocation={currentLocation} route={route} actColor={actColor} />
        ) : (
          <View style={[styles.mapPlaceholder]}>
            <Ionicons name="location" size={40} color={actColor} />
            <Text style={[styles.gpsWaiting, { color: "#888", fontFamily: "Inter_400Regular" }]}>
              {hasPermission === false ? "GPS permission denied" : "Acquiring GPS signal..."}
            </Text>
          </View>
        )}

        {/* Map overlay buttons */}
        <View style={styles.mapOverlay}>
          <Pressable style={[styles.mapBtn, { backgroundColor: "rgba(0,0,0,0.7)" }]}>
            <Ionicons name="locate" size={18} color="#fff" />
          </Pressable>
          <Pressable style={[styles.mapBtn, { backgroundColor: "rgba(0,0,0,0.7)" }]}>
            <Ionicons name="layers-outline" size={18} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* STATS PANEL */}
      <View style={[styles.panel, { backgroundColor: "#0A0A0A" }]}>
        <View style={[styles.durationRow]}>
          <Text style={[styles.durationVal, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
            {formatTime(duration)}
          </Text>
          <Text style={[styles.durationLabel, { color: "#888", fontFamily: "Inter_400Regular" }]}>
            DURATION
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: "#1A1A1A" }]} />

        <View style={styles.statsGrid}>
          {[
            { label: "DISTANCE (KM)", value: distance.toFixed(2), color: actColor },
            { label: "PACE (MIN/KM)", value: pace, color: "#fff" },
            { label: "CALORIES", value: calories.toString(), color: "#fff" },
            { label: "SPEED (KM/H)", value: speed.toFixed(1), color: "#fff" },
            { label: "BPM", value: state === "running" ? bpm.toString() : "--", color: "#fff" },
            { label: "STEPS", value: state === "idle" ? "0" : steps.toLocaleString(), color: "#fff" },
          ].map((s) => (
            <View key={s.label} style={styles.statCell}>
              <Text style={[styles.statVal, { color: s.color, fontFamily: "Inter_700Bold" }]}>
                {s.value}
              </Text>
              <Text style={[styles.statLabel, { color: "#666", fontFamily: "Inter_400Regular" }]}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.controls, { paddingBottom: insets.bottom + 14 }]}>
          {state === "idle" && (
            <Pressable
              onPress={handleStart}
              style={[styles.startBtn, { backgroundColor: actColor }]}
            >
              <Ionicons name="play" size={34} color="#fff" />
            </Pressable>
          )}
          {state === "running" && (
            <View style={styles.runControls}>
              <Pressable
                onPress={handlePause}
                style={[styles.primaryCtrl, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="pause" size={30} color="#fff" />
              </Pressable>
              <Pressable
                onPress={() => {}}
                style={[styles.lockBtn, { backgroundColor: "#1A1A1A", borderColor: "#333" }]}
              >
                <Ionicons name="lock-closed-outline" size={22} color="#888" />
              </Pressable>
            </View>
          )}
          {state === "paused" && (
            <View style={styles.runControls}>
              <Pressable
                onPress={handleFinish}
                style={[styles.finishBtn, { backgroundColor: "#1A1A1A", borderColor: "#444" }]}
              >
                <Ionicons name="checkmark" size={28} color="#fff" />
                <Text style={[styles.finishText, { color: "#fff", fontFamily: "Inter_600SemiBold" }]}>
                  FINISH
                </Text>
              </Pressable>
              <Pressable
                onPress={handleResume}
                style={[styles.primaryCtrl, { backgroundColor: actColor }]}
              >
                <Ionicons name="play" size={30} color="#fff" />
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
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
    backgroundColor: "rgba(0,0,0,0.75)",
  },
  iconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  topCenter: { alignItems: "center", gap: 2 },
  actLabel: { fontSize: 16, letterSpacing: 1 },
  gpsRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  gpsDot: { width: 7, height: 7, borderRadius: 4 },
  gpsText: { fontSize: 11 },
  mapWrap: { flex: 1, position: "relative" },
  mapPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#111", gap: 10 },
  gpsWaiting: { fontSize: 14 },
  mapOverlay: { position: "absolute", right: 12, bottom: 12, gap: 8 },
  mapBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  panel: { borderTopWidth: 1, borderTopColor: "#1A1A1A" },
  durationRow: { alignItems: "center", paddingTop: 14, paddingBottom: 8, gap: 2 },
  durationVal: { fontSize: 44, letterSpacing: 2 },
  durationLabel: { fontSize: 11, letterSpacing: 1.5 },
  divider: { height: 1, marginHorizontal: 16 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", paddingVertical: 12, paddingHorizontal: 8 },
  statCell: { width: "33.33%", alignItems: "center", paddingVertical: 8, gap: 3 },
  statVal: { fontSize: 20 },
  statLabel: { fontSize: 9, letterSpacing: 0.5 },
  controls: { alignItems: "center", paddingHorizontal: 20, paddingTop: 4 },
  startBtn: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  runControls: { flexDirection: "row", alignItems: "center", gap: 24 },
  primaryCtrl: { width: 68, height: 68, borderRadius: 34, alignItems: "center", justifyContent: "center" },
  lockBtn: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  finishBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 28, borderWidth: 1 },
  finishText: { fontSize: 14 },
});
