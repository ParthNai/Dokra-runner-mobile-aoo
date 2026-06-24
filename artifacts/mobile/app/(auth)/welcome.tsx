import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { DokraLogo } from "@/components/DokraLogo";
import { useColors } from "@/hooks/useColors";

const { width, height } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    icon: "walk",
    title: "Track Activities",
    desc: "Track your runs, walks and cycles with real-time GPS. Monitor your progress every step of the way.",
  },
  {
    id: "2",
    icon: "people",
    title: "Join Community",
    desc: "Connect with runners from your city. Share achievements, motivate each other and grow together.",
  },
  {
    id: "3",
    icon: "trophy",
    title: "Achieve Goals",
    desc: "Compete on city, state and India leaderboards. Set records and earn your place at the top.",
  },
];

export default function WelcomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeIdx, setActiveIdx] = useState(0);
  const flatRef = useRef<FlatList>(null);

  const handleScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIdx(idx);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ImageBackground
        source={require("../../assets/images/hero.png")}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.85)", "#0A0A0A"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <View style={[styles.top, { paddingTop: insets.top + 16 }]}>
        <DokraLogo size="small" />
      </View>

      <View style={styles.middle}>
        <Text style={[styles.welcomeText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
          WELCOME TO
        </Text>
        <Text style={[styles.dokraTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          DOKRA
        </Text>
        <Text style={[styles.clubTitle, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
          RUNNING CLUB
        </Text>
        <Text style={[styles.desc, { color: "#cccccc", fontFamily: "Inter_400Regular" }]}>
          Join our community, track your progress and achieve more together.
        </Text>

        <FlatList
          ref={flatRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width }]}>
              <View style={styles.featureRow}>
                <View style={[styles.featureItem, { backgroundColor: colors.card + "cc" }]}>
                  <Ionicons name={item.icon as any} size={28} color={colors.primary} />
                  <Text style={[styles.featureTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                    {item.title}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />

        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === activeIdx ? colors.primary : colors.border,
                  width: i === activeIdx ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 24 }]}>
        <Button
          title="Get Started"
          onPress={() => router.push("/(auth)/register")}
          style={styles.btn}
        />
        <Pressable onPress={() => router.push("/(auth)/login")} style={styles.loginRow}>
          <Text style={[styles.alreadyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            ALREADY HAVE AN ACCOUNT?{" "}
          </Text>
          <Text style={[styles.loginText, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
            LOGIN
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  top: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  middle: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "flex-end",
    gap: 10,
    paddingBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    letterSpacing: 2,
  },
  dokraTitle: {
    fontSize: 44,
    letterSpacing: 4,
    lineHeight: 48,
  },
  clubTitle: {
    fontSize: 24,
    letterSpacing: 4,
    lineHeight: 28,
    marginTop: -4,
  },
  desc: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  slide: {
    paddingRight: 24,
  },
  featureRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  featureItem: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  featureTitle: {
    fontSize: 12,
    textAlign: "center",
  },
  dotsRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    marginTop: 4,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  bottom: {
    paddingHorizontal: 24,
    gap: 16,
  },
  btn: {
    width: "100%",
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  alreadyText: {
    fontSize: 12,
    letterSpacing: 1,
  },
  loginText: {
    fontSize: 12,
    letterSpacing: 1,
  },
});
