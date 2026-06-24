import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LeaderboardRow } from "@/components/LeaderboardRow";
import { useAuth } from "@/context/AuthContext";
import { useActivity } from "@/context/ActivityContext";
import { useColors } from "@/hooks/useColors";

type Tab = "city" | "state" | "india";

interface LeaderEntry {
  userId: string;
  name: string;
  club: string;
  city: string;
  state: string;
  distance: number;
  activities: number;
}

const MOCK_ENTRIES: LeaderEntry[] = [
  { userId: "m1", name: "Arjun Sharma", club: "DOKRA Mumbai Running Club", city: "Mumbai", state: "Maharashtra", distance: 312.5, activities: 45 },
  { userId: "m2", name: "Priya Patel", club: "DOKRA Ahmedabad Running Club", city: "Ahmedabad", state: "Gujarat", distance: 289.2, activities: 38 },
  { userId: "m3", name: "Rahul Verma", club: "DOKRA Delhi Running Club", city: "New Delhi", state: "Delhi", distance: 265.8, activities: 42 },
  { userId: "m4", name: "Sneha Rao", club: "DOKRA Bangalore Running Club", city: "Bangalore", state: "Karnataka", distance: 245.3, activities: 36 },
  { userId: "m5", name: "Vikram Singh", club: "DOKRA Pune Running Club", city: "Pune", state: "Maharashtra", distance: 228.1, activities: 31 },
  { userId: "m6", name: "Anita Desai", club: "DOKRA Chennai Running Club", city: "Chennai", state: "Tamil Nadu", distance: 201.7, activities: 29 },
  { userId: "m7", name: "Karan Mehta", club: "DOKRA Hyderabad Running Club", city: "Hyderabad", state: "Telangana", distance: 187.4, activities: 27 },
  { userId: "m8", name: "Pooja Nair", club: "DOKRA Kochi Running Club", city: "Kochi", state: "Kerala", distance: 175.6, activities: 25 },
  { userId: "m9", name: "Dev Gupta", club: "DOKRA Jaipur Running Club", city: "Jaipur", state: "Rajasthan", distance: 162.3, activities: 22 },
  { userId: "m10", name: "Riya Krishnan", club: "DOKRA Kolkata Running Club", city: "Kolkata", state: "West Bengal", distance: 149.8, activities: 20 },
];

export default function LeaderboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getActivitiesByUser, getAllActivities } = useActivity();
  const [tab, setTab] = useState<Tab>("city");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const userActivities = getActivitiesByUser(user?.id ?? "");
  const userDistance = userActivities.reduce((s, a) => s + a.distance, 0);

  const userEntry: LeaderEntry | null = user
    ? {
        userId: user.id,
        name: user.fullName,
        club: user.clubName,
        city: user.city,
        state: user.state,
        distance: userDistance,
        activities: userActivities.length,
      }
    : null;

  const buildBoard = useMemo(() => {
    const all = userEntry ? [...MOCK_ENTRIES, userEntry] : [...MOCK_ENTRIES];
    let filtered = all;
    if (tab === "city" && user?.city) {
      filtered = all.filter((e) => e.city === user.city || e.userId === user?.id);
      if (filtered.length === 1) {
        filtered = all.slice(0, 5);
      }
    } else if (tab === "state" && user?.state) {
      filtered = all.filter((e) => e.state === user.state || e.userId === user?.id);
      if (filtered.length < 3) {
        filtered = all.slice(0, 8);
      }
    }
    return filtered.sort((a, b) => b.distance - a.distance).slice(0, 20);
  }, [tab, user, userEntry]);

  const TABS: { key: Tab; label: string }[] = [
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "india", label: "India" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          LEADERBOARD
        </Text>
        <View style={[styles.tabBar, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          {TABS.map((t) => (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[
                styles.tabBtn,
                {
                  backgroundColor: tab === t.key ? colors.primary : "transparent",
                  borderRadius: colors.radius - 2,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: tab === t.key ? "#fff" : colors.mutedForeground,
                    fontFamily: tab === t.key ? "Inter_600SemiBold" : "Inter_400Regular",
                  },
                ]}
              >
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={buildBoard}
        keyExtractor={(item) => item.userId}
        renderItem={({ item, index }) => (
          <LeaderboardRow
            rank={index + 1}
            name={item.name}
            club={item.club}
            distance={item.distance}
            activities={item.activities}
            isCurrentUser={item.userId === user?.id}
          />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === "web" ? 120 : 100 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={[styles.listHeader, { borderColor: colors.border }]}>
            <Text style={[styles.colRank, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
              #
            </Text>
            <Text style={[styles.colName, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
              Runner
            </Text>
            <Text style={[styles.colDist, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
              Distance
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12, gap: 14 },
  title: { fontSize: 22, letterSpacing: 2 },
  tabBar: { flexDirection: "row", padding: 4, gap: 2 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: "center" },
  tabText: { fontSize: 13 },
  list: { paddingHorizontal: 16 },
  listHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  colRank: { width: 36, fontSize: 12 },
  colName: { flex: 1, fontSize: 12 },
  colDist: { fontSize: 12 },
});
