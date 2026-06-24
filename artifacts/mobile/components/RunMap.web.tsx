import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { RoutePoint } from "@/context/ActivityContext";
import { useColors } from "@/hooks/useColors";

interface RunMapProps {
  mapRef?: React.RefObject<any>;
  currentLocation: RoutePoint | null;
  route: RoutePoint[];
  actColor: string;
}

export default function RunMap({ currentLocation, route, actColor }: RunMapProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: "#111" }]}>
      <View style={styles.content}>
        <Ionicons name="map" size={48} color={actColor} />
        <Text style={[styles.text, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          GPS Map (available on mobile device)
        </Text>
        {currentLocation && (
          <Text style={[styles.coords, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {currentLocation.latitude.toFixed(5)}, {currentLocation.longitude.toFixed(5)}
          </Text>
        )}
        {route.length > 0 && (
          <Text style={[styles.points, { color: actColor, fontFamily: "Inter_600SemiBold" }]}>
            {route.length} GPS points recorded
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    gap: 10,
  },
  text: {
    fontSize: 14,
    textAlign: "center",
  },
  coords: {
    fontSize: 12,
    textAlign: "center",
  },
  points: {
    fontSize: 14,
  },
});
