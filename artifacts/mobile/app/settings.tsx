import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface SettingRow {
  id: string;
  icon: string;
  label: string;
  type: "toggle" | "nav" | "value";
  value?: string;
  color?: string;
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [notifications, setNotifications] = useState(true);
  const [activityReminders, setActivityReminders] = useState(true);
  const [communityUpdates, setCommunityUpdates] = useState(true);
  const [eventAlerts, setEventAlerts] = useState(true);
  const [gpsTracking, setGpsTracking] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);

  const SECTIONS = [
    {
      title: "NOTIFICATIONS",
      rows: [
        { id: "notif", icon: "notifications-outline", label: "Push Notifications", type: "toggle" as const, toggle: notifications, setToggle: setNotifications, color: "#E31E24" },
        { id: "remind", icon: "alarm-outline", label: "Activity Reminders", type: "toggle" as const, toggle: activityReminders, setToggle: setActivityReminders, color: "#C9A227" },
        { id: "community", icon: "people-outline", label: "Community Updates", type: "toggle" as const, toggle: communityUpdates, setToggle: setCommunityUpdates, color: "#3B82F6" },
        { id: "events", icon: "calendar-outline", label: "Event Alerts", type: "toggle" as const, toggle: eventAlerts, setToggle: setEventAlerts, color: "#22c55e" },
      ],
    },
    {
      title: "TRACKING",
      rows: [
        { id: "gps", icon: "location-outline", label: "GPS Tracking", type: "toggle" as const, toggle: gpsTracking, setToggle: setGpsTracking, color: "#E31E24" },
        { id: "autosave", icon: "save-outline", label: "Auto-Save Activities", type: "toggle" as const, toggle: autoSave, setToggle: setAutoSave, color: "#C9A227" },
        { id: "units", icon: "speedometer-outline", label: "Distance Units", type: "value" as const, value: "Kilometers", color: "#8B5CF6" },
      ],
    },
    {
      title: "PRIVACY",
      rows: [
        { id: "public", icon: "eye-outline", label: "Public Profile", type: "toggle" as const, toggle: publicProfile, setToggle: setPublicProfile, color: "#22c55e" },
        { id: "data", icon: "shield-outline", label: "Data & Privacy", type: "nav" as const, color: "#6B7280" },
      ],
    },
    {
      title: "APP",
      rows: [
        { id: "about", icon: "information-circle-outline", label: "About DOKRA", type: "nav" as const, color: "#E31E24" },
        { id: "version", icon: "code-slash-outline", label: "Version", type: "value" as const, value: "1.0.0", color: "#6B7280" },
        { id: "clear", icon: "trash-outline", label: "Clear Cache", type: "nav" as const, color: "#E31E24" },
      ],
    },
  ];

  const handleNav = (id: string) => {
    if (id === "units") {
      Alert.alert("Distance Units", "Select unit", [
        { text: "Kilometers", style: "default" },
        { text: "Miles", style: "default" },
        { text: "Cancel", style: "cancel" },
      ]);
    } else if (id === "clear") {
      Alert.alert("Clear Cache", "This will clear temporary app data.", [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: () => Alert.alert("Done", "Cache cleared successfully.") },
      ]);
    } else if (id === "about") {
      Alert.alert("DOKRA Running Club", "Version 1.0.0\n\nBuilt for runners, by runners.\n\nJoin the movement. Run your city.");
    } else if (id === "data") {
      Alert.alert("Data & Privacy", "Your activity data is stored securely on your device. We do not share personal data with third parties.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          Settings
        </Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
              {section.title}
            </Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {section.rows.map((row, idx) => (
                <Pressable
                  key={row.id}
                  onPress={() => row.type === "nav" || row.type === "value" ? handleNav(row.id) : undefined}
                  style={({ pressed }) => [
                    styles.row,
                    { borderBottomColor: colors.border },
                    idx < section.rows.length - 1 && styles.rowBorder,
                    pressed && row.type !== "toggle" && { backgroundColor: colors.border + "30" },
                  ]}
                >
                  <View style={[styles.rowIcon, { backgroundColor: (row.color || "#E31E24") + "22" }]}>
                    <Ionicons name={row.icon as any} size={18} color={row.color || "#E31E24"} />
                  </View>
                  <Text style={[styles.rowLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                    {row.label}
                  </Text>
                  {row.type === "toggle" && (
                    <Switch
                      value={row.toggle}
                      onValueChange={row.setToggle}
                      trackColor={{ false: colors.border, true: "#E31E24" }}
                      thumbColor="#fff"
                    />
                  )}
                  {row.type === "value" && (
                    <Text style={[styles.rowValue, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {row.value}
                    </Text>
                  )}
                  {row.type === "nav" && (
                    <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        ))}
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
  iconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17 },
  scroll: { padding: 16, gap: 20, paddingBottom: 100 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 11, letterSpacing: 2 },
  card: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  row: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16,
    paddingVertical: 14, gap: 14,
  },
  rowBorder: { borderBottomWidth: 1 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowLabel: { flex: 1, fontSize: 15 },
  rowValue: { fontSize: 14 },
});
