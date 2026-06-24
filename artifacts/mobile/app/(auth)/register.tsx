import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
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
import { indiaStates, getCitiesForState, getClubForCity } from "@/constants/indiaData";

const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

const TOTAL_STEPS = 12;

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register, googleLogin } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [clubName, setClubName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  const cities = getCitiesForState(selectedState);

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!fullName.trim()) { setError("Full name is required"); return; }
    } else if (step === 2) {
      if (!email.trim()) { setError("Email is required"); return; }
      if (!/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email"); return; }
    } else if (step === 3) {
      if (!mobile.trim() || mobile.length < 10) { setError("Enter a valid mobile number"); return; }
    } else if (step === 4) {
      if (!password || password.length < 8) { setError("Password must be at least 8 characters"); return; }
      if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    } else if (step === 5) {
      if (!gender) { setError("Please select gender"); return; }
    } else if (step === 6) {
      if (!dob) { setError("Please enter date of birth"); return; }
    } else if (step === 7) {
      if (!selectedState) { setError("Please select a state"); return; }
    } else if (step === 8) {
      if (!selectedCity) { setError("Please select a city"); return; }
    }

    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      if (step === 8) {
        const club = getClubForCity(selectedState, selectedCity);
        setClubName(club);
      }
    }
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setProfilePhoto(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    if (!agreed) { setError("Please agree to Terms & Conditions"); return; }
    setLoading(true);
    try {
      await register(
        {
          fullName: fullName.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
          gender,
          dateOfBirth: dob,
          state: selectedState,
          city: selectedCity,
          clubName,
          profilePhoto,
        },
        password
      );
      router.replace("/(tabs)/");
    } catch (e: any) {
      setError(e.message || "Registration failed");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    Alert.alert(
      "Register with Google",
      "This will create an account with your Google credentials.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: async () => {
            setLoading(true);
            try {
              await googleLogin({
                fullName: "Google User",
                email: `user_${Date.now()}@gmail.com`,
              });
              router.replace("/(tabs)/");
            } catch (e: any) {
              Alert.alert("Error", e.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const progressWidth = `${(step / TOTAL_STEPS) * 100}%`;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <StepHeader title="What's your name?" subtitle="Step 1 of 12" />
            <Input value={fullName} onChangeText={setFullName} placeholder="Full Name" iconName="person-outline" autoCapitalize="words" returnKeyType="next" onSubmitEditing={handleNext} />
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <StepHeader title="Email Address" subtitle="Step 2 of 12" />
            <Input value={email} onChangeText={setEmail} placeholder="Email Address" iconName="mail-outline" keyboardType="email-address" returnKeyType="next" onSubmitEditing={handleNext} />
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContent}>
            <StepHeader title="Mobile Number" subtitle="Step 3 of 12" />
            <Input value={mobile} onChangeText={setMobile} placeholder="Mobile Number" iconName="phone-portrait-outline" keyboardType="phone-pad" returnKeyType="next" onSubmitEditing={handleNext} />
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContent}>
            <StepHeader title="Set Password" subtitle="Step 4 of 12" />
            <Input value={password} onChangeText={setPassword} placeholder="Password (min 8 chars)" iconName="lock-closed-outline" secureTextEntry returnKeyType="next" />
            <Input value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm Password" iconName="lock-closed-outline" secureTextEntry returnKeyType="done" onSubmitEditing={handleNext} />
          </View>
        );
      case 5:
        return (
          <View style={styles.stepContent}>
            <StepHeader title="Your Gender" subtitle="Step 5 of 12" />
            <View style={styles.optionsGrid}>
              {GENDERS.map((g) => (
                <Pressable
                  key={g}
                  onPress={() => setGender(g)}
                  style={[
                    styles.optionBtn,
                    {
                      borderColor: gender === g ? colors.primary : colors.border,
                      backgroundColor: gender === g ? colors.primary + "22" : colors.card,
                      borderRadius: colors.radius,
                    },
                  ]}
                >
                  <Text style={[styles.optionText, { color: gender === g ? colors.primary : colors.foreground, fontFamily: "Inter_500Medium" }]}>
                    {g}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        );
      case 6:
        return (
          <View style={styles.stepContent}>
            <StepHeader title="Date of Birth" subtitle="Step 6 of 12" />
            <Input value={dob} onChangeText={setDob} placeholder="DD/MM/YYYY" iconName="calendar-outline" returnKeyType="next" onSubmitEditing={handleNext} />
          </View>
        );
      case 7:
        return (
          <View style={styles.stepContent}>
            <StepHeader title="Select State" subtitle="Step 7 of 12" />
            <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
              {indiaStates.map((s) => (
                <Pressable
                  key={s.name}
                  onPress={() => { setSelectedState(s.name); setSelectedCity(""); }}
                  style={[
                    styles.listItem,
                    {
                      borderColor: selectedState === s.name ? colors.primary : colors.border,
                      backgroundColor: selectedState === s.name ? colors.primary + "22" : colors.card,
                      borderRadius: colors.radius,
                    },
                  ]}
                >
                  <Text style={[styles.listItemText, { color: selectedState === s.name ? colors.primary : colors.foreground, fontFamily: "Inter_500Medium" }]}>
                    {s.name}
                  </Text>
                  {selectedState === s.name && (
                    <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        );
      case 8:
        return (
          <View style={styles.stepContent}>
            <StepHeader title={`Cities in ${selectedState}`} subtitle="Step 8 of 12" />
            <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
              {cities.map((c) => (
                <Pressable
                  key={c.name}
                  onPress={() => setSelectedCity(c.name)}
                  style={[
                    styles.listItem,
                    {
                      borderColor: selectedCity === c.name ? colors.primary : colors.border,
                      backgroundColor: selectedCity === c.name ? colors.primary + "22" : colors.card,
                      borderRadius: colors.radius,
                    },
                  ]}
                >
                  <Text style={[styles.listItemText, { color: selectedCity === c.name ? colors.primary : colors.foreground, fontFamily: "Inter_500Medium" }]}>
                    {c.name}
                  </Text>
                  {selectedCity === c.name && (
                    <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        );
      case 9:
        return (
          <View style={styles.stepContent}>
            <StepHeader title="Your DOKRA Club" subtitle="Step 9 of 12" />
            <View style={[styles.clubBadge, { backgroundColor: colors.primary + "22", borderColor: colors.primary, borderRadius: colors.radius }]}>
              <Ionicons name="people" size={40} color={colors.primary} />
              <Text style={[styles.clubName, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                {getClubForCity(selectedState, selectedCity)}
              </Text>
              <Text style={[styles.clubSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                You'll be joining this club based on your city
              </Text>
            </View>
          </View>
        );
      case 10:
        return (
          <View style={styles.stepContent}>
            <StepHeader title="Profile Photo" subtitle="Step 10 of 12" />
            <View style={styles.photoWrap}>
              <Pressable onPress={handlePickPhoto} style={[styles.photoPicker, { borderColor: colors.primary, borderRadius: 60 }]}>
                {profilePhoto ? (
                  <Image source={{ uri: profilePhoto }} style={styles.profileImg} />
                ) : (
                  <View style={[styles.photoPlaceholder, { backgroundColor: colors.card }]}>
                    <Ionicons name="camera" size={40} color={colors.primary} />
                    <Text style={[styles.photoHint, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      Tap to upload
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>
          </View>
        );
      case 11:
        return (
          <View style={styles.stepContent}>
            <StepHeader title="Almost Done!" subtitle="Step 11 of 12" />
            <View style={styles.reviewList}>
              {[
                ["Name", fullName],
                ["Email", email],
                ["Mobile", mobile],
                ["Gender", gender],
                ["Date of Birth", dob],
                ["State", selectedState],
                ["City", selectedCity],
                ["Club", getClubForCity(selectedState, selectedCity)],
              ].map(([label, value]) => (
                <View key={label} style={[styles.reviewRow, { borderColor: colors.border }]}>
                  <Text style={[styles.reviewLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {label}
                  </Text>
                  <Text style={[styles.reviewValue, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                    {value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        );
      case 12:
        return (
          <View style={styles.stepContent}>
            <StepHeader title="Create Account" subtitle="Step 12 of 12" />
            <View style={[styles.summaryBox, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
              <Text style={[styles.summaryText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Ready to join DOKRA {getClubForCity(selectedState, selectedCity)}?
              </Text>
            </View>
            <Pressable onPress={() => setAgreed(!agreed)} style={styles.agreeRow}>
              <View style={[styles.checkbox, { borderColor: agreed ? colors.primary : colors.border, backgroundColor: agreed ? colors.primary : "transparent", borderRadius: 4 }]}>
                {agreed && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={[styles.agreeText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                I agree to the{" "}
                <Text style={{ color: colors.accent }}>Terms & Conditions</Text>
                {" "}and{" "}
                <Text style={{ color: colors.accent }}>Privacy Policy</Text>
              </Text>
            </Pressable>
            <Button title="REGISTER" onPress={handleRegister} loading={loading} />
            <View style={styles.orRow}>
              <View style={[styles.orLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.orText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>OR</Text>
              <View style={[styles.orLine, { backgroundColor: colors.border }]} />
            </View>
            <Button
              title="REGISTER WITH GOOGLE"
              onPress={handleGoogleRegister}
              variant="google"
              icon={<View style={styles.gIcon}><Text style={styles.gLetter}>G</Text></View>}
            />
            <Pressable onPress={() => router.push("/(auth)/login")} style={styles.loginRow}>
              <Text style={[{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13 }]}>
                Already have an account?{" "}
              </Text>
              <Text style={[{ color: colors.accent, fontFamily: "Inter_700Bold", fontSize: 13 }]}>
                LOGIN
              </Text>
            </Pressable>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#1a0000", "#0A0A0A"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
      />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 30 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Pressable onPress={() => step > 1 ? setStep(step - 1) : router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.foreground} />
            </Pressable>
            <DokraLogo size="small" />
          </View>

          <View style={styles.progressWrap}>
            <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { backgroundColor: colors.primary, width: progressWidth as any }]} />
            </View>
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.primary + "22", borderRadius: colors.radius }]}>
              <Ionicons name="alert-circle" size={16} color={colors.primary} />
              <Text style={[styles.errorText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
                {error}
              </Text>
            </View>
          ) : null}

          {renderStep()}

          {step < 12 && step !== 7 && step !== 8 && (
            <Button title="CONTINUE" onPress={handleNext} style={styles.continueBtn} />
          )}
          {(step === 7 || step === 8) && (
            <Button title="CONTINUE" onPress={handleNext} style={styles.continueBtn} disabled={step === 7 ? !selectedState : !selectedCity} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const colors = useColors();
  return (
    <View style={stepStyles.header}>
      <Text style={[stepStyles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
        {subtitle}
      </Text>
      <Text style={[stepStyles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
        {title}
      </Text>
      <View style={[stepStyles.line, { backgroundColor: colors.primary }]} />
    </View>
  );
}

const stepStyles = StyleSheet.create({
  header: { marginBottom: 20, gap: 4 },
  subtitle: { fontSize: 13, letterSpacing: 1 },
  title: { fontSize: 24, letterSpacing: 1 },
  line: { width: 40, height: 2, marginTop: 8 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 24, gap: 16 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  progressWrap: { marginBottom: 8 },
  progressBg: { height: 4, borderRadius: 2 },
  progressFill: { height: 4, borderRadius: 2 },
  stepContent: { gap: 14 },
  optionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  optionBtn: { paddingHorizontal: 20, paddingVertical: 12, borderWidth: 1.5, minWidth: "45%" },
  optionText: { fontSize: 14, textAlign: "center" },
  listScroll: { maxHeight: 260 },
  listItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, marginBottom: 8, borderWidth: 1 },
  listItemText: { fontSize: 14 },
  clubBadge: { padding: 24, alignItems: "center", gap: 12, borderWidth: 1 },
  clubName: { fontSize: 18, textAlign: "center", letterSpacing: 1 },
  clubSub: { fontSize: 13, textAlign: "center", lineHeight: 18 },
  photoWrap: { alignItems: "center" },
  photoPicker: { borderWidth: 2, borderStyle: "dashed" },
  profileImg: { width: 120, height: 120, borderRadius: 60 },
  photoPlaceholder: { width: 120, height: 120, borderRadius: 60, alignItems: "center", justifyContent: "center", gap: 6 },
  photoHint: { fontSize: 11, textAlign: "center" },
  reviewList: { gap: 0 },
  reviewRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1 },
  reviewLabel: { fontSize: 13 },
  reviewValue: { fontSize: 13, maxWidth: "60%", textAlign: "right" },
  summaryBox: { padding: 16, borderWidth: 1, alignItems: "center" },
  summaryText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  agreeRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  checkbox: { width: 20, height: 20, borderWidth: 1.5, alignItems: "center", justifyContent: "center", marginTop: 2 },
  agreeText: { fontSize: 13, flex: 1, lineHeight: 18 },
  orRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  orLine: { flex: 1, height: 1 },
  orText: { fontSize: 13 },
  loginRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10 },
  errorText: { fontSize: 13, flex: 1 },
  continueBtn: { marginTop: 8 },
  gIcon: { width: 22, height: 22, backgroundColor: "#fff", borderRadius: 11, alignItems: "center", justifyContent: "center" },
  gLetter: { color: "#E31E24", fontWeight: "bold", fontSize: 14 },
});
