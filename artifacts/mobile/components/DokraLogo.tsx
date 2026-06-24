import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface DokraLogoProps {
  size?: "small" | "medium" | "large";
  showTagline?: boolean;
}

export function DokraLogo({ size = "medium", showTagline = false }: DokraLogoProps) {
  const colors = useColors();

  const iconSize = size === "small" ? 40 : size === "medium" ? 60 : 100;
  const titleSize = size === "small" ? 18 : size === "medium" ? 26 : 40;
  const subtitleSize = size === "small" ? 9 : size === "medium" ? 12 : 18;
  const taglineSize = size === "small" ? 10 : size === "medium" ? 12 : 16;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Image
          source={require("../assets/images/icon.png")}
          style={{ width: iconSize, height: iconSize, borderRadius: 8 }}
          resizeMode="contain"
        />
        <View style={styles.textBlock}>
          <Text
            style={[
              styles.title,
              { color: colors.foreground, fontSize: titleSize, fontFamily: "Inter_700Bold" },
            ]}
          >
            DOKRA
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: colors.accent, fontSize: subtitleSize, fontFamily: "Inter_600SemiBold" },
            ]}
          >
            RUNNING CLUB
          </Text>
        </View>
      </View>
      {showTagline && (
        <View style={styles.taglineRow}>
          <View style={[styles.taglineLine, { backgroundColor: colors.primary }]} />
          <Text
            style={[
              styles.tagline,
              { color: colors.foreground, fontSize: taglineSize, fontFamily: "Inter_600SemiBold" },
            ]}
          >
            RUN{" "}
            <Text style={{ color: colors.accent }}>BEYOND</Text>
            {" "}LIMITS
          </Text>
          <View style={[styles.taglineLine, { backgroundColor: colors.primary }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  textBlock: {
    alignItems: "flex-start",
  },
  title: {
    letterSpacing: 2,
    lineHeight: undefined,
  },
  subtitle: {
    letterSpacing: 3,
    marginTop: -2,
  },
  taglineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  taglineLine: {
    height: 2,
    width: 30,
  },
  tagline: {
    letterSpacing: 2,
  },
});
