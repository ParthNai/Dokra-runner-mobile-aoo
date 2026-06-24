import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { DokraLogo } from "@/components/DokraLogo";
import { Input } from "@/components/Input";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login, googleLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    else if (password.length < 8) errs.password = "Password must be at least 8 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/(tabs)/");
    } catch (e: any) {
      Alert.alert("Login Failed", e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    Alert.alert(
      "Continue with Google",
      "Enter your Google account details to sign in",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign In",
          onPress: async () => {
            setGoogleLoading(true);
            try {
              await googleLogin({
                fullName: "Google User",
                email: `user_${Date.now()}@gmail.com`,
              });
              router.replace("/(tabs)/");
            } catch (e: any) {
              Alert.alert("Error", e.message);
            } finally {
              setGoogleLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Forgot Password",
      "A password reset link will be sent to your registered email address.",
      [{ text: "OK" }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#1a0000", "#0A0A0A"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 30 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </Pressable>

          <View style={styles.logoWrap}>
            <DokraLogo size="medium" />
          </View>

          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            WELCOME BACK
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Login to Continue
          </Text>
          <View style={[styles.redLine, { backgroundColor: colors.primary }]} />

          <View style={styles.form}>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="Email / Mobile Number"
              iconName="mail-outline"
              keyboardType="email-address"
              error={errors.email}
              returnKeyType="next"
            />
            <Input
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              iconName="lock-closed-outline"
              secureTextEntry
              error={errors.password}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            <Pressable onPress={handleForgotPassword} style={styles.forgotRow}>
              <Text style={[styles.forgot, { color: colors.accent, fontFamily: "Inter_500Medium" }]}>
                Forgot Password?
              </Text>
            </Pressable>

            <Button title="LOGIN" onPress={handleLogin} loading={loading} />

            <View style={styles.orRow}>
              <View style={[styles.orLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.orText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                OR
              </Text>
              <View style={[styles.orLine, { backgroundColor: colors.border }]} />
            </View>

            <Button
              title="LOGIN WITH GOOGLE"
              onPress={handleGoogle}
              variant="google"
              loading={googleLoading}
              icon={
                <View style={styles.gIcon}>
                  <Text style={styles.gLetter}>G</Text>
                </View>
              }
            />

            <Pressable onPress={() => router.push("/(auth)/register")} style={styles.regRow}>
              <Text style={[styles.noAccText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Don't have an account?{" "}
              </Text>
              <Text style={[styles.regText, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
                REGISTER
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 24, gap: 0 },
  back: { marginBottom: 20 },
  logoWrap: { alignItems: "center", marginBottom: 30 },
  title: { fontSize: 28, letterSpacing: 2, textAlign: "center" },
  subtitle: { fontSize: 14, textAlign: "center", marginTop: 6 },
  redLine: { height: 2, width: 40, alignSelf: "center", marginTop: 12, marginBottom: 30 },
  form: { gap: 14 },
  forgotRow: { alignItems: "flex-end", marginTop: -4 },
  forgot: { fontSize: 13 },
  orRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  orLine: { flex: 1, height: 1 },
  orText: { fontSize: 13 },
  regRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 4 },
  noAccText: { fontSize: 13 },
  regText: { fontSize: 13 },
  gIcon: {
    width: 22,
    height: 22,
    backgroundColor: "#fff",
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  gLetter: { color: "#E31E24", fontWeight: "bold", fontSize: 14 },
});
