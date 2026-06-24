import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { DokraLogo } from "@/components/DokraLogo";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { indiaStates, getCitiesForState, getClubForCity } from "@/constants/indiaData";

const TOTAL_STEPS = 4;
const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

const CLUB_STATS: Record<string, { members: number; avgKm: number; events: number }> = {
  default: { members: 124, avgKm: 10.5, events: 12 },
  Mumbai: { members: 412, avgKm: 14.2, events: 28 },
  Pune: { members: 287, avgKm: 12.8, events: 22 },
  Bangalore: { members: 356, avgKm: 13.1, events: 25 },
  Hyderabad: { members: 248, avgKm: 12.5, events: 18 },
  Chennai: { members: 198, avgKm: 11.3, events: 16 },
  Delhi: { members: 392, avgKm: 13.7, events: 30 },
  Ahmedabad: { members: 248, avgKm: 12.5, events: 18 },
  Kolkata: { members: 176, avgKm: 10.8, events: 14 },
  Jaipur: { members: 143, avgKm: 11.0, events: 12 },
};

function getClubStats(city: string) {
  return CLUB_STATS[city] || CLUB_STATS.default;
}

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register, googleLogin } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  const clubName = getClubForCity(selectedState, selectedCity);
  const clubStats = getClubStats(selectedCity);
  const cities = getCitiesForState(selectedState);

  const filteredStates = useMemo(
    () =>
      indiaStates.filter((s) =>
        s.name.toLowerCase().includes(stateSearch.toLowerCase())
      ),
    [stateSearch]
  );

  const filteredCities = useMemo(
    () =>
      cities.filter((c) =>
        c.name.toLowerCase().includes(citySearch.toLowerCase())
      ),
    [cities, citySearch]
  );

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!selectedState) { setError("Please select a state to continue"); return; }
    } else if (step === 2) {
      if (!selectedCity) { setError("Please select a city to continue"); return; }
    } else if (step === 3) {
    }
    if (step < TOTAL_STEPS) setStep(step + 1);
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
    if (!result.canceled) setProfilePhoto(result.assets[0].uri);
  };

  const handleComplete = async () => {
    if (!fullName.trim()) { setError("Full name is required"); return; }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email"); return; }
    if (!mobile.trim() || mobile.length < 10) { setError("Enter a valid mobile number"); return; }
    if (!password || password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      await register(
        {
          fullName: fullName.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
          gender: gender || "Prefer not to say",
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
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    Alert.alert("Register with Google", "This will create a quick account with Google.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Continue",
        onPress: async () => {
          setLoading(true);
          try {
            await googleLogin({ fullName: "Google User", email: `user_${Date.now()}@gmail.com` });
            router.replace("/(tabs)/");
          } catch (e: any) {
            Alert.alert("Error", e.message);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#1a0000", "#0A0A0A"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.35 }}
      />

      <View style={[styles.topBar, { paddingTop: topPad + 12 }]}>
        <Pressable
          onPress={() => {
            if (step > 1) setStep(step - 1);
            else router.back();
          }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <DokraLogo size="small" />
        <View style={{ width: 36 }} />
      </View>

      <StepIndicator current={step} total={TOTAL_STEPS} colors={colors} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {error ? (
            <View
              style={[
                styles.errorBox,
                { backgroundColor: "#E31E2422", borderRadius: colors.radius },
              ]}
            >
              <Ionicons name="alert-circle" size={16} color={colors.primary} />
              <Text style={[styles.errorText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
                {error}
              </Text>
            </View>
          ) : null}

          {step === 1 && (
            <Step1SelectState
              colors={colors}
              search={stateSearch}
              setSearch={setStateSearch}
              selected={selectedState}
              setSelected={(s) => { setSelectedState(s); setSelectedCity(""); }}
              states={filteredStates}
              onContinue={handleNext}
            />
          )}
          {step === 2 && (
            <Step2SelectCity
              colors={colors}
              search={citySearch}
              setSearch={setCitySearch}
              selected={selectedCity}
              setSelected={setSelectedCity}
              cities={filteredCities}
              stateName={selectedState}
              onContinue={handleNext}
            />
          )}
          {step === 3 && (
            <Step3JoinClub
              colors={colors}
              clubName={clubName}
              city={selectedCity}
              state={selectedState}
              stats={clubStats}
              onJoin={handleNext}
            />
          )}
          {step === 4 && (
            <Step4CompleteProfile
              colors={colors}
              profilePhoto={profilePhoto}
              onPickPhoto={handlePickPhoto}
              fullName={fullName}
              setFullName={setFullName}
              email={email}
              setEmail={setEmail}
              mobile={mobile}
              setMobile={setMobile}
              password={password}
              setPassword={setPassword}
              gender={gender}
              setGender={setGender}
              dob={dob}
              setDob={setDob}
              agreed={agreed}
              setAgreed={setAgreed}
              loading={loading}
              onComplete={handleComplete}
              onGoogle={handleGoogleRegister}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Ionicons name="people-outline" size={20} color={colors.mutedForeground} />
        <View style={styles.footerItem}>
          <Text style={[styles.footerLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            LOCAL COMMUNITY
          </Text>
          <Text style={[styles.footerSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Join runners from your city
          </Text>
        </View>
        <Ionicons name="trophy-outline" size={20} color={colors.accent} />
        <View style={styles.footerItem}>
          <Text style={[styles.footerLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            BE PART OF DOKRA
          </Text>
          <Text style={[styles.footerSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            One Club. Many Cities. One Family.
          </Text>
        </View>
      </View>
    </View>
  );
}

function StepIndicator({ current, total, colors }: { current: number; total: number; colors: any }) {
  return (
    <View style={stepStyles.row}>
      {Array.from({ length: total }).map((_, i) => {
        const done = i + 1 < current;
        const active = i + 1 === current;
        return (
          <React.Fragment key={i}>
            <View
              style={[
                stepStyles.dot,
                {
                  backgroundColor: done
                    ? colors.primary
                    : active
                    ? colors.primary
                    : colors.border,
                  borderColor: done ? colors.primary : active ? colors.primary : colors.border,
                },
              ]}
            >
              {done ? (
                <Ionicons name="checkmark" size={12} color="#fff" />
              ) : (
                <View
                  style={[
                    stepStyles.innerDot,
                    { backgroundColor: active ? "#fff" : "transparent" },
                  ]}
                />
              )}
            </View>
            {i < total - 1 && (
              <View
                style={[
                  stepStyles.line,
                  {
                    backgroundColor: i + 1 < current ? colors.primary : colors.border,
                  },
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

function Step1SelectState({ colors, search, setSearch, selected, setSelected, states, onContinue }: any) {
  return (
    <View style={styles.stepWrap}>
      <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
        SELECT YOUR STATE
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
        Choose your state to join local DOKRA community
      </Text>

      <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Ionicons name="search" size={18} color={colors.mutedForeground} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search State"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.searchInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
        />
      </View>

      <View style={styles.listWrap}>
        {states.map((s: any) => (
          <Pressable
            key={s.name}
            onPress={() => setSelected(s.name)}
            style={[
              styles.stateRow,
              {
                backgroundColor: selected === s.name ? colors.primary + "22" : colors.card,
                borderColor: selected === s.name ? colors.primary : colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <Text
              style={[
                styles.stateText,
                {
                  color: selected === s.name ? colors.primary : colors.foreground,
                  fontFamily: "Inter_500Medium",
                },
              ]}
            >
              {s.name}
            </Text>
            {selected === s.name ? (
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            ) : (
              <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
            )}
          </Pressable>
        ))}
      </View>

      <Button title="CONTINUE" onPress={onContinue} disabled={!selected} style={styles.ctaBtn} />
    </View>
  );
}

function Step2SelectCity({ colors, search, setSearch, selected, setSelected, cities, stateName, onContinue }: any) {
  return (
    <View style={styles.stepWrap}>
      <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
        SELECT YOUR CITY
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
        Choose your city to find your local club
      </Text>

      <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Ionicons name="search" size={18} color={colors.mutedForeground} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search City"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.searchInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
        />
      </View>

      <View style={styles.listWrap}>
        {cities.length === 0 && (
          <Text style={[styles.noCities, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            No cities found
          </Text>
        )}
        {cities.map((c: any) => (
          <Pressable
            key={c.name}
            onPress={() => setSelected(c.name)}
            style={[
              styles.stateRow,
              {
                backgroundColor: selected === c.name ? colors.primary + "22" : colors.card,
                borderColor: selected === c.name ? colors.primary : colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <Text
              style={[
                styles.stateText,
                {
                  color: selected === c.name ? colors.primary : colors.foreground,
                  fontFamily: "Inter_500Medium",
                },
              ]}
            >
              {c.name}
            </Text>
            {selected === c.name ? (
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            ) : (
              <View style={[styles.radio, { borderColor: colors.border }]} />
            )}
          </Pressable>
        ))}
      </View>

      <Button title="CONTINUE" onPress={onContinue} disabled={!selected} style={styles.ctaBtn} />
    </View>
  );
}

function Step3JoinClub({ colors, clubName, city, state, stats, onJoin }: any) {
  return (
    <View style={styles.stepWrap}>
      <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
        JOIN YOUR LOCAL CLUB
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
        You are in{" "}
        <Text style={{ color: colors.accent }}>{city}, {state}</Text>
        {"\n"}Join your local DOKRA club
      </Text>

      <View style={[styles.clubCard, { backgroundColor: colors.card, borderRadius: 16, borderColor: colors.border }]}>
        <LinearGradient
          colors={["#1a0000", "#0A0A0A"]}
          style={styles.clubCardBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.clubBannerInner}>
            <Ionicons name="walk" size={48} color={colors.primary} />
            <View>
              <Text style={[styles.clubCardName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                DOKRA {city.toUpperCase()}
              </Text>
              <Text style={[styles.clubCardSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                RUNNING CLUB
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.clubStats}>
          {[
            { value: stats.members.toString(), label: "Members" },
            { value: `${stats.avgKm} KM`, label: "Avg. Weekly Run" },
            { value: stats.events.toString(), label: "Events" },
          ].map((s) => (
            <View key={s.label} style={styles.clubStatItem}>
              <Text style={[styles.clubStatValue, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                {s.value}
              </Text>
              <Text style={[styles.clubStatLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.aboutDivider, { backgroundColor: colors.border }]} />

        <View style={styles.aboutSection}>
          <Text style={[styles.aboutTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            About Our Club
          </Text>
          <Text style={[styles.aboutText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            We are a community of passionate runners from {city}. We run together, grow together and achieve together. Join us every weekend for group runs!
          </Text>
        </View>
      </View>

      <Button title="JOIN CLUB" onPress={onJoin} style={styles.ctaBtn} />
    </View>
  );
}

function Step4CompleteProfile({
  colors,
  profilePhoto,
  onPickPhoto,
  fullName, setFullName,
  email, setEmail,
  mobile, setMobile,
  password, setPassword,
  gender, setGender,
  dob, setDob,
  agreed, setAgreed,
  loading,
  onComplete,
  onGoogle,
}: any) {
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  return (
    <View style={styles.stepWrap}>
      <Text style={[styles.stepTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
        COMPLETE YOUR PROFILE
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
        Tell us more about yourself
      </Text>

      <View style={styles.photoRow}>
        <Pressable onPress={onPickPhoto} style={styles.photoWrap}>
          {profilePhoto ? (
            <Image source={{ uri: profilePhoto }} style={styles.photo} />
          ) : (
            <View style={[styles.photoPlaceholder, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="person" size={40} color={colors.mutedForeground} />
            </View>
          )}
          <View style={[styles.cameraBtn, { backgroundColor: colors.primary }]}>
            <Ionicons name="camera" size={14} color="#fff" />
          </View>
        </Pressable>
      </View>

      <View style={styles.formFields}>
        <ProfileField
          icon="person-outline"
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          colors={colors}
          autoCapitalize="words"
        />
        <ProfileField
          icon="mail-outline"
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          colors={colors}
          keyboardType="email-address"
        />
        <ProfileField
          icon="lock-closed-outline"
          placeholder="Password (min 8 chars)"
          value={password}
          onChangeText={setPassword}
          colors={colors}
          secureTextEntry
        />
        <ProfileField
          icon="calendar-outline"
          placeholder="Date of Birth (DD / MM / YYYY)"
          value={dob}
          onChangeText={setDob}
          colors={colors}
        />

        <Pressable
          onPress={() => setShowGenderPicker(!showGenderPicker)}
          style={[
            styles.fieldRow,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Ionicons name="person-outline" size={18} color={colors.mutedForeground} style={styles.fieldIcon} />
          <Text
            style={[
              styles.fieldText,
              {
                color: gender ? colors.foreground : colors.mutedForeground,
                fontFamily: "Inter_400Regular",
              },
            ]}
          >
            {gender || "Gender"}
          </Text>
          <Ionicons
            name={showGenderPicker ? "chevron-up" : "chevron-down"}
            size={18}
            color={colors.mutedForeground}
          />
        </Pressable>
        {showGenderPicker && (
          <View style={[styles.genderDropdown, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            {GENDERS.map((g) => (
              <Pressable
                key={g}
                onPress={() => { setGender(g); setShowGenderPicker(false); }}
                style={[styles.genderOption, { borderBottomColor: colors.border }]}
              >
                <Text style={[styles.genderText, { color: g === gender ? colors.primary : colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  {g}
                </Text>
                {g === gender && <Ionicons name="checkmark" size={16} color={colors.primary} />}
              </Pressable>
            ))}
          </View>
        )}

        <ProfileField
          icon="phone-portrait-outline"
          placeholder="+91 XXXXX XXXXX"
          value={mobile}
          onChangeText={setMobile}
          colors={colors}
          keyboardType="phone-pad"
        />
      </View>

      <Pressable onPress={() => setAgreed(!agreed)} style={styles.agreeRow}>
        <View
          style={[
            styles.checkbox,
            {
              borderColor: agreed ? colors.primary : colors.border,
              backgroundColor: agreed ? colors.primary : "transparent",
            },
          ]}
        >
          {agreed && <Ionicons name="checkmark" size={12} color="#fff" />}
        </View>
        <Text style={[styles.agreeText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          I agree to the{" "}
          <Text style={{ color: colors.accent }}>Terms & Conditions</Text>
          {" "}and{" "}
          <Text style={{ color: colors.accent }}>Privacy Policy</Text>
        </Text>
      </Pressable>

      <Button title="COMPLETE" onPress={onComplete} loading={loading} style={styles.ctaBtn} />

      <View style={styles.orRow}>
        <View style={[styles.orLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.orText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          OR
        </Text>
        <View style={[styles.orLine, { backgroundColor: colors.border }]} />
      </View>

      <Button
        title="SIGN UP WITH GOOGLE"
        onPress={onGoogle}
        variant="google"
        icon={
          <View style={styles.gIcon}>
            <Text style={styles.gLetter}>G</Text>
          </View>
        }
      />

      <Pressable onPress={() => router.push("/(auth)/login")} style={styles.loginLink}>
        <Text style={[{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13 }]}>
          Already have an account?{" "}
          <Text style={{ color: "#C9A227", fontFamily: "Inter_700Bold" }}>LOGIN</Text>
        </Text>
      </Pressable>
    </View>
  );
}

function ProfileField({ icon, placeholder, value, onChangeText, colors, keyboardType, autoCapitalize, secureTextEntry }: any) {
  const [show, setShow] = useState(false);
  return (
    <View style={[styles.fieldRow, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
      <Ionicons name={icon} size={18} color={colors.mutedForeground} style={styles.fieldIcon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        keyboardType={keyboardType || "default"}
        autoCapitalize={autoCapitalize || "none"}
        secureTextEntry={secureTextEntry && !show}
        style={[styles.fieldInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
      />
      {secureTextEntry && (
        <Pressable onPress={() => setShow(!show)}>
          <Ionicons name={show ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
        </Pressable>
      )}
    </View>
  );
}

const stepStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 16,
    gap: 0,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  innerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  line: {
    flex: 1,
    height: 2,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: { paddingHorizontal: 20, gap: 16, paddingTop: 8 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
  },
  errorText: { fontSize: 13, flex: 1 },

  stepWrap: { gap: 16 },
  stepTitle: { fontSize: 24, letterSpacing: 0.5, textAlign: "center" },
  stepSubtitle: { fontSize: 13, textAlign: "center", lineHeight: 20, marginTop: -8 },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 14, height: 48 },

  listWrap: { gap: 6 },
  stateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
  },
  stateText: { fontSize: 15 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  noCities: { textAlign: "center", fontSize: 14, paddingVertical: 20 },

  clubCard: { overflow: "hidden", borderWidth: 1 },
  clubCardBanner: { padding: 20 },
  clubBannerInner: { flexDirection: "row", alignItems: "center", gap: 14 },
  clubCardName: { fontSize: 20, letterSpacing: 1 },
  clubCardSub: { fontSize: 12, letterSpacing: 2, marginTop: 2 },
  clubStats: { flexDirection: "row", paddingVertical: 16 },
  clubStatItem: { flex: 1, alignItems: "center", gap: 4 },
  clubStatValue: { fontSize: 20 },
  clubStatLabel: { fontSize: 11, textAlign: "center" },
  aboutDivider: { height: 1, marginHorizontal: 16 },
  aboutSection: { padding: 16, gap: 6 },
  aboutTitle: { fontSize: 15 },
  aboutText: { fontSize: 13, lineHeight: 20 },

  photoRow: { alignItems: "center" },
  photoWrap: { position: "relative" },
  photo: { width: 90, height: 90, borderRadius: 45 },
  photoPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderStyle: "dashed",
  },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  formFields: { gap: 10 },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    paddingHorizontal: 14,
    borderWidth: 1,
    gap: 10,
  },
  fieldIcon: { width: 22 },
  fieldText: { flex: 1, fontSize: 14 },
  fieldInput: { flex: 1, fontSize: 14, height: 52 },
  genderDropdown: { borderWidth: 1, overflow: "hidden", marginTop: -6 },
  genderOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  genderText: { fontSize: 14 },

  agreeRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, alignItems: "center", justifyContent: "center", marginTop: 2 },
  agreeText: { fontSize: 12, flex: 1, lineHeight: 18 },

  orRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  orLine: { flex: 1, height: 1 },
  orText: { fontSize: 13 },

  loginLink: { alignItems: "center" },

  ctaBtn: { marginTop: 4 },

  footer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
  },
  footerItem: { flex: 1, gap: 2 },
  footerLabel: { fontSize: 11, letterSpacing: 0.5 },
  footerSub: { fontSize: 10, lineHeight: 14 },

  gIcon: { width: 22, height: 22, backgroundColor: "#fff", borderRadius: 11, alignItems: "center", justifyContent: "center" },
  gLetter: { color: "#E31E24", fontWeight: "bold", fontSize: 14 },
});
