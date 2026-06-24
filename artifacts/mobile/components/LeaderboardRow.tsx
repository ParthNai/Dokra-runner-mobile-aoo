import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface LeaderboardRowProps {
  rank: number;
  name: string;
  club: string;
  distance: number;
  activities: number;
  isCurrentUser?: boolean;
}

export function LeaderboardRow({
  rank,
  name,
  club,
  distance,
  activities,
  isCurrentUser = false,
}: LeaderboardRowProps) {
  const colors = useColors();

  const rankColor =
    rank === 1 ? "#FFD700" : rank === 2 ? "#C0C0C0" : rank === 3 ? "#CD7F32" : colors.mutedForeground;

  const rankIcon = rank === 1 ? "trophy" : rank === 2 ? "medal" : rank === 3 ? "ribbon" : null;

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: isCurrentUser ? colors.primary + "18" : colors.card,
          borderColor: isCurrentUser ? colors.primary : colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <View style={styles.rankCol}>
        {rankIcon ? (
          <Ionicons name={rankIcon as any} size={22} color={rankColor} />
        ) : (
          <Text style={[styles.rank, { color: rankColor, fontFamily: "Inter_700Bold" }]}>
            #{rank}
          </Text>
        )}
      </View>

      <View style={[styles.avatar, { backgroundColor: isCurrentUser ? colors.primary : colors.secondary }]}>
        <Text style={[styles.avatarText, { fontFamily: "Inter_700Bold" }]}>
          {name.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.info}>
        <Text
          style={[
            styles.name,
            {
              color: isCurrentUser ? colors.primary : colors.foreground,
              fontFamily: "Inter_600SemiBold",
            },
          ]}
          numberOfLines={1}
        >
          {name} {isCurrentUser ? "(You)" : ""}
        </Text>
        <Text
          style={[styles.club, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}
          numberOfLines={1}
        >
          {club}
        </Text>
      </View>

      <View style={styles.statsCol}>
        <Text style={[styles.distance, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
          {distance.toFixed(1)} km
        </Text>
        <Text style={[styles.acts, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {activities} runs
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    gap: 10,
  },
  rankCol: {
    width: 36,
    alignItems: "center",
  },
  rank: {
    fontSize: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 14,
  },
  club: {
    fontSize: 11,
  },
  statsCol: {
    alignItems: "flex-end",
    gap: 2,
  },
  distance: {
    fontSize: 15,
  },
  acts: {
    fontSize: 11,
  },
});
