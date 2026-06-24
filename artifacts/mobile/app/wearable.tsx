import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
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
import { useWearable, type DeviceType, type WearableDevice } from "@/context/WearableContext";
import { useColors } from "@/hooks/useColors";

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const DEVICE_ICONS: Record<string, string> = {
  apple_watch: "watch-outline",
  samsung_watch: "watch-outline",
  wear_os: "watch-outline",
  garmin: "pulse-outline",
  fitbit: "fitness-outline",
  amazfit: "watch-outline",
  noise: "watch-outline",
  fire_boltt: "watch-outline",
};

const DEVICE_COLORS: Record<string, string> = {
  apple_watch: "#1D1D1F",
  samsung_watch: "#1428A0",
  wear_os: "#4285F4",
  garmin: "#007CC0",
  fitbit: "#00B0B9",
  amazfit: "#FF6B35",
  noise: "#E31E24",
  fire_boltt: "#FF4500",
};

const PLATFORM_LABELS: Record<string, string> = {
  ios: "iOS Only",
  android: "Android Only",
  both: "iOS & Android",
};

function DeviceCard({
  device,
  colors,
  onConnect,
  onDisconnect,
  onSync,
  syncStatus,
}: {
  device: WearableDevice;
  colors: any;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
  syncStatus: string;
}) {
  const devColor = DEVICE_COLORS[device.id] || "#E31E24";

  return (
    <View
      style={[
        styles.deviceCard,
        {
          backgroundColor: colors.card,
          borderColor: device.connected ? devColor + "88" : colors.border,
          borderRadius: 16,
        },
      ]}
    >
      {device.connected && (
        <LinearGradient
          colors={[devColor + "18", "transparent"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}

      <View style={styles.deviceHeader}>
        <View style={[styles.deviceIconWrap, { backgroundColor: devColor + "22" }]}>
          <Ionicons name={DEVICE_ICONS[device.id] as any} size={26} color={devColor} />
        </View>
        <View style={styles.deviceInfo}>
          <Text style={[styles.deviceName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            {device.name}
          </Text>
          <Text style={[styles.deviceMfr, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {device.manufacturer} · {PLATFORM_LABELS[device.platform]}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: device.connected ? "#22c55e22" : colors.border + "44" }]}>
          <View style={[styles.statusDot, { backgroundColor: device.connected ? "#22c55e" : "#6B7280" }]} />
          <Text
            style={[
              styles.statusText,
              { color: device.connected ? "#22c55e" : colors.mutedForeground, fontFamily: "Inter_600SemiBold" },
            ]}
          >
            {device.connected ? "Connected" : "Off"}
          </Text>
        </View>
      </View>

      {device.connected && (
        <View style={[styles.deviceStats, { borderTopColor: colors.border + "60" }]}>
          <View style={styles.deviceStat}>
            <Ionicons name="battery-half-outline" size={14} color={device.batteryLevel < 20 ? "#E31E24" : "#22c55e"} />
            <Text style={[styles.deviceStatVal, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              {device.batteryLevel}%
            </Text>
            <Text style={[styles.deviceStatLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Battery</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.deviceStat}>
            <Ionicons name="sync-outline" size={14} color={colors.mutedForeground} />
            <Text style={[styles.deviceStatVal, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              {timeAgo(device.lastSync)}
            </Text>
            <Text style={[styles.deviceStatLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Last Sync</Text>
          </View>
          {device.heartRate && (
            <>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.deviceStat}>
                <Ionicons name="heart-outline" size={14} color="#E31E24" />
                <Text style={[styles.deviceStatVal, { color: "#E31E24", fontFamily: "Inter_700Bold" }]}>
                  {device.heartRate}
                </Text>
                <Text style={[styles.deviceStatLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>BPM</Text>
              </View>
            </>
          )}
        </View>
      )}

      <View style={styles.deviceActions}>
        {device.connected ? (
          <>
            <Pressable
              onPress={onSync}
              style={[
                styles.actionBtn,
                { backgroundColor: devColor, flex: 1.5, borderRadius: 10 },
              ]}
            >
              <Ionicons
                name={syncStatus === "syncing" ? "sync" : "sync-outline"}
                size={15}
                color="#fff"
              />
              <Text style={[styles.actionBtnText, { fontFamily: "Inter_600SemiBold" }]}>
                {syncStatus === "syncing" ? "Syncing..." : "Sync Now"}
              </Text>
            </Pressable>
            <Pressable
              onPress={onDisconnect}
              style={[styles.actionBtnOutline, { borderColor: colors.border, flex: 1, borderRadius: 10 }]}
            >
              <Text style={[styles.actionBtnOutlineText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                Disconnect
              </Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={onConnect}
            style={[styles.actionBtn, { backgroundColor: devColor, flex: 1, borderRadius: 10 }]}
          >
            <Ionicons name="bluetooth-outline" size={15} color="#fff" />
            <Text style={[styles.actionBtnText, { fontFamily: "Inter_600SemiBold" }]}>Connect Device</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function WearableScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { devices, connectedDevice, syncStatus, lastSyncTime, healthToday, connectDevice, disconnectDevice, syncNow } =
    useWearable();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleConnect = (id: DeviceType) => {
    if (connectedDevice && connectedDevice.id !== id) {
      Alert.alert(
        "Replace Connection?",
        `Disconnect ${connectedDevice.name} and connect this device?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Connect", onPress: () => connectDevice(id) },
        ]
      );
    } else {
      connectDevice(id);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Connected Devices
          </Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Smartwatch & Health Platforms
          </Text>
        </View>
        <Pressable onPress={syncNow} style={styles.iconBtn}>
          <Ionicons
            name="sync-outline"
            size={22}
            color={syncStatus === "syncing" ? "#E31E24" : colors.foreground}
          />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* HEALTH OVERVIEW */}
        {connectedDevice && healthToday && (
          <LinearGradient
            colors={["#1a0000", "#0A0A0A"]}
            style={[styles.healthBanner, { borderColor: "#E31E2444", borderRadius: 16 }]}
          >
            <View style={styles.healthBannerTop}>
              <View style={styles.healthBannerLeft}>
                <Text style={[styles.healthBannerTitle, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                  Today's Health
                </Text>
                <Text style={[styles.healthBannerSub, { color: "#888", fontFamily: "Inter_400Regular" }]}>
                  via {connectedDevice.name}
                </Text>
              </View>
              <View style={styles.syncBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
                <Text style={[styles.syncBadgeText, { fontFamily: "Inter_500Medium" }]}>
                  {timeAgo(lastSyncTime)}
                </Text>
              </View>
            </View>
            <View style={styles.healthGrid}>
              {[
                { icon: "footsteps-outline", val: healthToday.steps.toLocaleString(), label: "STEPS", color: "#C9A227" },
                { icon: "walk-outline", val: `${healthToday.distance} km`, label: "DISTANCE", color: "#22c55e" },
                { icon: "flame-outline", val: healthToday.calories.toString(), label: "CALORIES", color: "#F97316" },
                { icon: "heart-outline", val: `${healthToday.avgHeartRate} bpm`, label: "AVG HR", color: "#E31E24" },
                { icon: "trending-up-outline", val: `${healthToday.maxHeartRate} bpm`, label: "MAX HR", color: "#8B5CF6" },
                { icon: "timer-outline", val: `${healthToday.activeMinutes} min`, label: "ACTIVE", color: "#3B82F6" },
              ].map((item) => (
                <View key={item.label} style={styles.healthGridItem}>
                  <Ionicons name={item.icon as any} size={18} color={item.color} />
                  <Text style={[styles.healthGridVal, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                    {item.val}
                  </Text>
                  <Text style={[styles.healthGridLabel, { color: "#666", fontFamily: "Inter_400Regular" }]}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        )}

        {/* SUPPORTED PLATFORMS */}
        <View style={styles.platformsRow}>
          {[
            { icon: "logo-apple", label: "HealthKit", color: "#fff" },
            { icon: "heart-outline", label: "Health Connect", color: "#4285F4" },
            { icon: "watch-outline", label: "Samsung Health", color: "#1428A0" },
            { icon: "pulse-outline", label: "Garmin Connect", color: "#007CC0" },
          ].map((p) => (
            <View key={p.label} style={[styles.platformChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name={p.icon as any} size={14} color={p.color} />
              <Text style={[styles.platformLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                {p.label}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
          SUPPORTED DEVICES
        </Text>

        {devices.map((device) => (
          <DeviceCard
            key={device.id}
            device={device}
            colors={colors}
            syncStatus={device.connected ? syncStatus : "idle"}
            onConnect={() => handleConnect(device.id)}
            onDisconnect={() => disconnectDevice(device.id)}
            onSync={syncNow}
          />
        ))}

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.mutedForeground} />
          <Text style={[styles.infoText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Full Bluetooth pairing and real-time health sync requires the DOKRA production app. The web preview simulates device connections.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1,
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 17 },
  headerSub: { fontSize: 11, marginTop: 1 },
  iconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  scroll: { padding: 16, gap: 14, paddingBottom: 100 },

  healthBanner: { padding: 18, borderWidth: 1, gap: 14 },
  healthBannerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  healthBannerLeft: { gap: 3 },
  healthBannerTitle: { fontSize: 16 },
  healthBannerSub: { fontSize: 12 },
  syncBadge: { flexDirection: "row", alignItems: "center", gap: 5 },
  syncBadgeText: { color: "#22c55e", fontSize: 12 },
  healthGrid: { flexDirection: "row", flexWrap: "wrap", gap: 0 },
  healthGridItem: { width: "33.33%", alignItems: "center", paddingVertical: 10, gap: 4 },
  healthGridVal: { fontSize: 15 },
  healthGridLabel: { fontSize: 9, letterSpacing: 1 },

  platformsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  platformChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1,
  },
  platformLabel: { fontSize: 11 },

  sectionTitle: { fontSize: 11, letterSpacing: 2, marginTop: 4 },

  deviceCard: { padding: 16, borderWidth: 1.5, gap: 12, overflow: "hidden" },
  deviceHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  deviceIconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  deviceInfo: { flex: 1, gap: 3 },
  deviceName: { fontSize: 14 },
  deviceMfr: { fontSize: 11 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11 },

  deviceStats: { flexDirection: "row", paddingTop: 12, borderTopWidth: 1 },
  deviceStat: { flex: 1, alignItems: "center", gap: 3 },
  deviceStatVal: { fontSize: 14 },
  deviceStatLabel: { fontSize: 10 },
  statDivider: { width: 1 },

  deviceActions: { flexDirection: "row", gap: 8 },
  actionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 11 },
  actionBtnText: { color: "#fff", fontSize: 13 },
  actionBtnOutline: { alignItems: "center", justifyContent: "center", paddingVertical: 11, borderWidth: 1 },
  actionBtnOutlineText: { fontSize: 13 },

  infoCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    padding: 14, borderRadius: 12, borderWidth: 1,
  },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
