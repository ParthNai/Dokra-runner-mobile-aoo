import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ViewShot, { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import Svg, {
  Path,
  Circle,
  G,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Filter,
  FeGaussianBlur,
  Text as SvgText,
} from "react-native-svg";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) +
    ", " +
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
  );
}

export default function ShareCardScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    id: string;
    distance: string;
    duration: string;
    avgSpeed: string;
    calories: string;
    steps: string;
    pace: string;
    type: string;
    date: string;
    city: string;
    state: string;
  }>();

  const distance = params.distance ?? "8.53";
  const duration = parseInt(params.duration ?? "3989", 10);
  const calories = params.calories ?? "568";
  const steps = params.steps ?? "10698";
  const pace = params.pace ?? "9'09\"";
  const type = params.type ?? "running";
  const dateStr = params.date ?? new Date().toISOString();
  const city = params.city ?? "Palanpur";
  const stateStr = params.state ?? "Gujarat";

  const isRunning = type === "running";
  const actTypeName = isRunning ? "Morning Run" : type === "walking" ? "Evening Walk" : "Cycling";

  const cardRef = useRef<ViewShot>(null);
  const [loading, setLoading] = useState(false);

  const moveKcal = parseInt(calories, 10);
  const moveGoal = 1200;
  const moveProgress = Math.min(moveKcal / moveGoal, 1);
  const circleRadius = 34;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - moveProgress * circleCircumference;

  const handleSave = async () => {
    const [status] = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to save photos.");
      return;
    }
    setLoading(true);
    try {
      const uri = await captureRef(cardRef, { format: "png", quality: 1 });
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("Saved!", "Activity card saved to your gallery.");
    } catch (e) {
      Alert.alert("Error", "Could not save image.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    setLoading(true);
    try {
      const uri = await captureRef(cardRef, { format: "png", quality: 1 });
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Share your DOKRA activity",
        });
      } else {
        Alert.alert("Sharing not available", "Sharing is not supported on this device.");
      }
    } catch (e) {
      Alert.alert("Error", "Could not share image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 20 : insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Share Activity</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.cardContainer}>
          <ViewShot
            ref={cardRef}
            style={[styles.card, { overflow: Platform.OS === "web" ? "visible" : "hidden" }]}
            options={{ format: "png", quality: 1 }}
          >
            <LinearGradient
              colors={["#1A1A0A", "#0A0A0A", "#050505"]}
              style={StyleSheet.absoluteFillObject}
            />

            {/* TOP HEADER ROW */}
            <View style={styles.cardHeader}>
              <View style={styles.colLeft}>
                <View style={styles.rowCenter}>
                  <Ionicons name="location" size={12} color="#E31E24" />
                  <Text style={styles.locationText}>{`${city}, ${stateStr}`}</Text>
                </View>
                <Text style={styles.dateText}>{formatDate(dateStr)}</Text>
                <View style={styles.rowCenter}>
                  <Ionicons name="moon" size={10} color="#888" />
                  <Text style={styles.weatherText}> 26°C, Clear</Text>
                </View>
              </View>
              <View style={styles.colCenter}>
                <Ionicons name="man" size={20} color="#E31E24" />
                <Text style={styles.logoDokra}>DOKRA</Text>
                <Text style={styles.logoSub}>RUNNING CLUB</Text>
              </View>
              <View style={styles.colRight}>
                <Text style={styles.tagRun}>RUN</Text>
                <Text style={styles.tagAchieve}>ACHIEVE</Text>
                <Text style={styles.tagInspire}>INSPIRE</Text>
              </View>
            </View>

            {/* SVG ROUTE MAP */}
            <View style={styles.mapLayer}>
              <Svg width={360} height={380}>
                <Defs>
                  <SvgLinearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor="#E31E24" />
                    <Stop offset="50%" stopColor="#EAB308" />
                    <Stop offset="100%" stopColor="#22C55E" />
                  </SvgLinearGradient>
                  <Filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <FeGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </Filter>
                </Defs>
                <Path
                  d="M 180,340 C 100,310 50,250 75,185 C 100,120 160,95 195,118 C 240,145 275,120 295,165 C 320,215 300,280 275,315 C 255,345 215,360 180,340 Z"
                  stroke="url(#routeGrad)"
                  strokeWidth={7}
                  fill="none"
                  strokeLinecap="round"
                  filter="url(#glow)"
                />
                <Circle cx={180} cy={340} r={7} fill="#E31E24" />
                <Circle cx={175} cy={345} r={8} fill="#FFF" />
                <G>
                  <Circle cx={75} cy={185} r={4} fill="#222" />
                  <SvgText x={85} y={188} fill="#fff" fontSize={10} fontFamily="Inter_700Bold">
                    1 km
                  </SvgText>
                  <Circle cx={195} cy={118} r={4} fill="#222" />
                  <SvgText x={205} y={121} fill="#fff" fontSize={10} fontFamily="Inter_700Bold">
                    3 km
                  </SvgText>
                  <Circle cx={295} cy={165} r={4} fill="#222" />
                  <SvgText x={305} y={168} fill="#fff" fontSize={10} fontFamily="Inter_700Bold">
                    5 km
                  </SvgText>
                </G>
              </Svg>
            </View>

            {/* USER PROFILE BUBBLE */}
            <View style={styles.userBubble}>
              <View style={styles.meBadge}>
                <Text style={styles.meText}>Me</Text>
              </View>
              <View style={styles.avatarWrap}>
                {user?.profilePhoto ? (
                  <Image source={{ uri: user.profilePhoto }} style={styles.avatarImg} />
                ) : (
                  <Ionicons name="person" size={24} color="#888" />
                )}
              </View>
            </View>

            {/* LEFT STATS CARDS */}
            <View style={styles.leftStats}>
              <View style={styles.statCard}>
                <View style={styles.rowCenter}>
                  <Ionicons name="timer-outline" size={14} color="#aaa" />
                  <Text style={styles.statVal}>{pace}</Text>
                </View>
                <Text style={styles.statLabel}>Avg. Pace</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.rowCenter}>
                  <Ionicons name="time-outline" size={14} color="#aaa" />
                  <Text style={styles.statVal}>{formatTime(duration)}</Text>
                </View>
                <Text style={styles.statLabel}>Time</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.rowCenter}>
                  <Ionicons name="flame" size={14} color="#E31E24" />
                  <Text style={styles.statVal}>{calories}</Text>
                </View>
                <Text style={styles.statLabel}>Calories</Text>
              </View>
            </View>

            {/* RIGHT STATS COLUMN */}
            <View style={styles.rightStats}>
              <View style={styles.moveRingWrap}>
                <Svg width={82} height={82}>
                  <Circle
                    cx={41}
                    cy={41}
                    r={circleRadius}
                    stroke="#222"
                    strokeWidth={8}
                    fill="none"
                  />
                  <Circle
                    cx={41}
                    cy={41}
                    r={circleRadius}
                    stroke="#E31E24"
                    strokeWidth={8}
                    fill="none"
                    strokeDasharray={circleCircumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin="41, 41"
                  />
                </Svg>
                <View style={styles.moveRingInner}>
                  <Text style={styles.moveRingTitle}>Move</Text>
                  <Text style={styles.moveRingVal}>{`${moveKcal}/${moveGoal}`}</Text>
                  <Text style={styles.moveRingUnit}>KCAL</Text>
                </View>
              </View>

              <View style={styles.rightStatItem}>
                <View style={styles.rowCenter}>
                  <Ionicons name="footsteps" size={12} color="#C9A227" />
                  <Text style={styles.rightStatLabel}>Steps</Text>
                </View>
                <Text style={styles.rightStatVal}>{Number(steps).toLocaleString()}</Text>
              </View>

              <View style={styles.rightStatItem}>
                <View style={styles.rowCenter}>
                  <Ionicons name="location" size={12} color="#C9A227" />
                  <Text style={styles.rightStatLabel}>Distance</Text>
                </View>
                <Text style={styles.rightStatVal}>{`${distance} KM`}</Text>
              </View>
            </View>

            {/* ACTIVITY LABEL */}
            <View style={styles.activityLabelWrap}>
              <View style={styles.rowCenter}>
                <Ionicons name="walk" size={16} color="#E31E24" />
                <Text style={styles.actSub}> Activity</Text>
              </View>
              <Text style={styles.actTitle}>{actTypeName}</Text>
              <View style={styles.actBar} />
            </View>

            {/* FOOTER BAR */}
            <View style={styles.footerBar}>
              <Text style={styles.footerBrand}>#DOKRARunningClub</Text>
              <Text style={styles.footerUrl}>www.dokrarunningclub.com</Text>
              <View style={styles.rowCenter}>
                <Text style={styles.footerMotto}>Stay Strong, Keep </Text>
                <Text style={styles.footerMottoRed}>Running.</Text>
              </View>
            </View>
          </ViewShot>
        </View>
      </ScrollView>

      {/* BOTTOM ACTION BAR */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 20 }]}>
        <View style={styles.shareToRow}>
          <Text style={styles.shareToLabel}>SHARE TO</Text>
          <View style={styles.socialIcons}>
            <Ionicons name="logo-instagram" size={24} color="#E1306C" />
            <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            <Ionicons name="logo-facebook" size={24} color="#1877F2" />
          </View>
        </View>
        <View style={styles.actionBtns}>
          <Pressable style={styles.btnSave} onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="download-outline" size={20} color="#fff" />
                <Text style={styles.btnSaveText}>SAVE</Text>
              </>
            )}
          </Pressable>
          <Pressable style={styles.btnShare} onPress={handleShare} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Ionicons name="share-outline" size={20} color="#000" />
                <Text style={styles.btnShareText}>SHARE</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 18 },
  scrollContent: {
    paddingVertical: 20,
    alignItems: "center",
  },
  cardContainer: {
    width: 360,
    height: 640,
    borderRadius: 16,
    overflow: "hidden", // Hide sharp corners outside ViewShot
  },
  card: {
    width: 360,
    height: 640,
    backgroundColor: "#000",
  },
  rowCenter: { flexDirection: "row", alignItems: "center" },
  cardHeader: {
    position: "absolute",
    top: 20,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  colLeft: { gap: 2, flex: 1 },
  locationText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 12, marginLeft: 4 },
  dateText: { color: "#888", fontFamily: "Inter_400Regular", fontSize: 10 },
  weatherText: { color: "#888", fontFamily: "Inter_400Regular", fontSize: 10 },
  colCenter: { alignItems: "center", flex: 1 },
  logoDokra: { color: "#C9A227", fontFamily: "Inter_700Bold", fontSize: 13, letterSpacing: 2 },
  logoSub: { color: "#fff", fontFamily: "Inter_400Regular", fontSize: 8, letterSpacing: 1 },
  colRight: { alignItems: "flex-end", flex: 1 },
  tagRun: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 18, fontStyle: "italic" },
  tagAchieve: { color: "#C9A227", fontFamily: "Inter_700Bold", fontSize: 18, fontStyle: "italic" },
  tagInspire: { color: "#E31E24", fontFamily: "Inter_700Bold", fontSize: 18, fontStyle: "italic" },
  mapLayer: { position: "absolute", top: 80, left: 0, zIndex: 1 },
  userBubble: { position: "absolute", top: 115, left: 115, zIndex: 10, alignItems: "center" },
  meBadge: {
    backgroundColor: "#E31E24",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: -4,
    zIndex: 11,
  },
  meText: { color: "#fff", fontSize: 8, fontFamily: "Inter_700Bold" },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#C9A227",
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: { width: "100%", height: "100%" },
  leftStats: { position: "absolute", left: 12, top: 175, zIndex: 10 },
  statCard: {
    backgroundColor: "rgba(0,0,0,0.65)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 108,
    marginBottom: 10,
  },
  statVal: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 19, marginLeft: 6 },
  statLabel: { color: "#888", fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 4 },
  rightStats: { position: "absolute", right: 12, top: 175, zIndex: 10, alignItems: "flex-end" },
  moveRingWrap: { width: 82, height: 82, alignItems: "center", justifyContent: "center" },
  moveRingInner: { position: "absolute", alignItems: "center" },
  moveRingTitle: { color: "#fff", fontSize: 9, fontFamily: "Inter_600SemiBold" },
  moveRingVal: { color: "#E31E24", fontSize: 11, fontFamily: "Inter_700Bold" },
  moveRingUnit: { color: "#888", fontSize: 8, fontFamily: "Inter_400Regular" },
  rightStatItem: { marginTop: 14, alignItems: "flex-end" },
  rightStatLabel: { color: "#888", fontSize: 11, fontFamily: "Inter_400Regular", marginLeft: 4 },
  rightStatVal: { color: "#fff", fontSize: 22, fontFamily: "Inter_700Bold", marginTop: 2 },
  activityLabelWrap: { position: "absolute", bottom: 55, left: 16, zIndex: 10 },
  actSub: { color: "#888", fontSize: 13, fontFamily: "Inter_400Regular" },
  actTitle: { color: "#C9A227", fontSize: 26, fontFamily: "Inter_700Bold", fontStyle: "italic" },
  actBar: { width: 48, height: 3, backgroundColor: "#E31E24", marginTop: 4 },
  footerBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 44,
    backgroundColor: "rgba(0,0,0,0.85)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    zIndex: 10,
  },
  footerBrand: { color: "#888", fontSize: 10, fontFamily: "Inter_500Medium" },
  footerUrl: { color: "#888", fontSize: 9, fontFamily: "Inter_400Regular" },
  footerMotto: { color: "#fff", fontSize: 10, fontFamily: "Inter_500Medium" },
  footerMottoRed: { color: "#E31E24", fontSize: 10, fontFamily: "Inter_700Bold" },
  bottomBar: {
    backgroundColor: "#111",
    paddingTop: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
  shareToRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  shareToLabel: { color: "#888", fontFamily: "Inter_600SemiBold", fontSize: 12, letterSpacing: 1 },
  socialIcons: { flexDirection: "row", gap: 16 },
  actionBtns: { flexDirection: "row", gap: 12 },
  btnSave: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: 12,
    height: 50,
    gap: 8,
  },
  btnSaveText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 14, letterSpacing: 1 },
  btnShare: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C9A227",
    borderRadius: 12,
    height: 50,
    gap: 8,
  },
  btnShareText: { color: "#000", fontFamily: "Inter_700Bold", fontSize: 14, letterSpacing: 1 },
});
