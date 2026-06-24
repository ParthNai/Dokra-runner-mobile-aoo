import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  iconName?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "words" | "sentences" | "characters";
  error?: string;
  returnKeyType?: "done" | "next" | "search" | "send";
  onSubmitEditing?: () => void;
  editable?: boolean;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  iconName,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  error,
  returnKeyType,
  onSubmitEditing,
  editable = true,
}: InputProps) {
  const colors = useColors();
  const [showPass, setShowPass] = useState(false);

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.input,
            borderColor: error ? colors.primary : colors.border,
            borderRadius: colors.radius,
          },
        ]}
      >
        {iconName && (
          <Ionicons
            name={iconName as any}
            size={20}
            color={colors.mutedForeground}
            style={styles.icon}
          />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry={secureTextEntry && !showPass}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={[
            styles.input,
            {
              color: colors.foreground,
              fontFamily: "Inter_400Regular",
              flex: 1,
            },
          ]}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          editable={editable}
        />
        {secureTextEntry && (
          <Pressable onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
            <Ionicons
              name={showPass ? "eye-off" : "eye"}
              size={20}
              color={colors.mutedForeground}
            />
          </Pressable>
        )}
      </View>
      {error ? (
        <Text style={[styles.error, { color: colors.primary, fontFamily: "Inter_400Regular" }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  container: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    fontSize: 15,
    flex: 1,
    height: 52,
  },
  eyeBtn: {
    padding: 4,
    marginLeft: 4,
  },
  error: {
    fontSize: 12,
    marginLeft: 2,
  },
});
