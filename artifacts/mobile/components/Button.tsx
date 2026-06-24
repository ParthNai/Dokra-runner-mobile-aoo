import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "outline" | "google" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: object;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  icon,
  style,
}: ButtonProps) {
  const colors = useColors();

  const bgColor =
    variant === "primary"
      ? colors.primary
      : variant === "google"
      ? "#1A1A1A"
      : "transparent";

  const borderColor =
    variant === "outline" ? colors.primary : variant === "google" ? colors.border : "transparent";

  const textColor =
    variant === "primary"
      ? colors.primaryForeground
      : variant === "google"
      ? colors.foreground
      : variant === "outline"
      ? colors.primary
      : colors.foreground;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: bgColor,
          borderColor,
          borderWidth: variant === "outline" || variant === "google" ? 1 : 0,
          opacity: pressed ? 0.8 : disabled ? 0.5 : 1,
          borderRadius: colors.radius,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.inner}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text
            style={[
              styles.text,
              {
                color: textColor,
                fontFamily: "Inter_700Bold",
              },
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 15,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
