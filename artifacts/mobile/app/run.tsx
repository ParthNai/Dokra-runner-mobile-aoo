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
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
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

  useEffect(() => {
    requestPermission();
    return () => {
      stopTracking();
    };
  }, []);

  const requestPermission = async () => {
    if (Platform.OS === "web") {
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setCurrentLocation({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
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
          (pos) => {
            const point = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
            updateLocation(point, pos.coords.speed ?? 0);
          },
          undefined,
          { enableHighAccuracy: true }
        );
        locationRef.current = { remove: () => navigator.geolocation.clearWatch(id) };
      }
      return;
    }
    const sub = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 5 },
      (loc) => {
        const point = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        updateLocation(point, loc.coords.speed ?? 0);
      }
    );
    locationRef.current = sub;
  };

  const stopTracking = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (locationRef.current) {
      locationRef.current.remove();
      locationRef.current = null;
    }
  };

  const handleStart = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setState("running");
    setRoute(currentLocation ? [currentLocation] : []);
    setDistance(0);
    setDuration(0);
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
    const calories = Math.round(distance * (CALORIES_PER_KM[actType] ?? 60));
    const avgSpeed = duration > 0 ? distance / (duration / 3600) : 0;
    if (!user) return;
    addActivity({
      userId: user.id,
      type: actType,
      distance,
      duration,
      avgSpeed,
      calories,
      date: new Date().toISOString(),
      route,
      clubName: user.clubName || "DOKRA Running Club",
      city: user.city || "",
      state: user.state || "",
    }).then((activity) => {
      router.replace({
        pathname: "/summary",
        params: {
          activityId: activity.id,
          distance: distance.toFixed(4),
          duration: duration.toString(),
          avgSpeed: avgSpeed.toFixed(2),
          calories: calories.toString(),
          type: actType,
        },
      });
    });
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const pace = distance > 0 && duration > 0 ? duration / 60 / distance : 0;

  const TYPE_COLORS: Record<string, string> = {
    running: "#E31E24",
    walking: "#C9A227",
    cycling: "#3B82F6",
  };
  const actColor = TYPE_COLORS[actType] || colors.primary;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.topBar,
          {
            paddingTop: topPad + 8,
            backgroundColor: "rgba(10,10,10,0.9)",
          },
        ]}
      >
        <Pressable
          onPress={() => {
            stopTracking();
            router.back();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.typeLabel, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          {actType.toUpperCase()}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.mapWrap}>
        {currentLocation ? (
          <RunMap
            mapRef={mapRef}
            currentLocation={currentLocation}
            route={route}
            actColor={actColor}
          />
        ) : (
          <View style={[styles.mapPlaceholder, { backgroundColor: colors.card }]}>
            {hasPermission === false ? (
              <View style={styles.noGPS}>
                <Ionicons name="location-outline" size={40} color={colors.mutedForeground} />
                <Text
                  style={[
                    styles.noGPSText,
                    { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
                  ]}
                >
                  GPS permission denied
                </Text>
              </View>
            ) : (
              <View style={styles.noGPS}>
                <Ionicons name="location" size={40} color={actColor} />
                <Text
                  style={[
                    styles.noGPSText,
                    { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
                  ]}
                >
                  Acquiring GPS signal...
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={[styles.panel, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={styles.statsRow}>
          {[
            { label: "Duration", value: formatTime(duration), color: colors.foreground },
            { label: "km", value: distance.toFixed(2), color: actColor },
            { label: "km/h", value: speed.toFixed(1), color: colors.foreground },
            { label: "min/km", value: pace > 0 ? pace.toFixed(1) : "--", color: colors.foreground },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && (
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              )}
              <View style={styles.statItem}>
                <Text
                  style={[
                    styles.statValue,
                    { color: s.color, fontFamily: "Inter_700Bold" },
                  ]}
                >
                  {s.value}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
                  ]}
                >
                  {s.label}
                </Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        <View style={[styles.controls, { paddingBottom: insets.bottom + 12 }]}>
          {state === "idle" && (
            <Pressable
              onPress={handleStart}
              style={[styles.mainBtn, { backgroundColor: actColor }]}
            >
              <Ionicons name="play" size={36} color="#fff" />
            </Pressable>
          )}
          {state === "running" && (
            <View style={styles.activeControls}>
              <Pressable
                onPress={handlePause}
                style={[
                  styles.sideBtn,
                  { backgroundColor: colors.secondary, borderColor: colors.border },
                ]}
              >
                <Ionicons name="pause" size={28} color={colors.foreground} />
              </Pressable>
              <Pressable
                onPress={handleFinish}
                style={[styles.mainBtn, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="stop" size={30} color="#fff" />
              </Pressable>
            </View>
          )}
          {state === "paused" && (
            <View style={styles.activeControls}>
              <Pressable
                onPress={handleFinish}
                style={[
                  styles.sideBtn,
                  { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
              >
                <Ionicons name="checkmark" size={28} color="#fff" />
              </Pressable>
              <Pressable
                onPress={handleResume}
                style={[styles.mainBtn, { backgroundColor: actColor }]}
              >
                <Ionicons name="play" size={36} color="#fff" />
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
    paddingHorizontal: 20,
    paddingBottom: 10,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  typeLabel: { fontSize: 18, letterSpacing: 2 },
  mapWrap: { flex: 1 },
  mapPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noGPS: { alignItems: "center", gap: 10 },
  noGPSText: { fontSize: 14 },
  panel: {
    borderTopWidth: 1,
    paddingTop: 16,
    gap: 16,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statValue: { fontSize: 22 },
  statLabel: { fontSize: 11 },
  statDivider: { width: 1, height: 30 },
  controls: { alignItems: "center", paddingHorizontal: 20 },
  mainBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  activeControls: { flexDirection: "row", alignItems: "center", gap: 30 },
  sideBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});
