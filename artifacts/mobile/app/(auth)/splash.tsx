import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DokraLogo } from "@/components/DokraLogo";
import { useColors } from "@/hooks/useColors";

const { height } = Dimensions.get("window");

export default function SplashScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;
  const runnerAnim = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(taglineAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(runnerAnim, {
      toValue: 0,
      duration: 1000,
      delay: 200,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      router.replace("/(auth)/welcome");
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#1a0000", "#0A0A0A", "#0A0A0A"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <View style={[styles.content, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }]}>
        <Animated.View
          style={[
            styles.logoWrap,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <DokraLogo size="large" />
        </Animated.View>

        <Animated.View style={[styles.taglineWrap, { opacity: taglineAnim }]}>
          <View style={[styles.taglineRow]}>
            <View style={[styles.line, { backgroundColor: colors.primary }]} />
            <View style={styles.taglineText}>
              <Animated.Text
                style={[
                  styles.run,
                  { color: colors.foreground, fontFamily: "Inter_700Bold" },
                ]}
              >
                RUN{" "}
                <Animated.Text style={{ color: colors.accent }}>BEYOND</Animated.Text>
                {" "}LIMITS
              </Animated.Text>
            </View>
            <View style={[styles.line, { backgroundColor: colors.primary }]} />
          </View>
        </Animated.View>

        <View style={styles.dotsRow}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === 0 ? colors.primary : colors.border },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 40,
  },
  logoWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  taglineWrap: {
    alignItems: "center",
    marginBottom: 20,
  },
  taglineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  taglineText: {
    alignItems: "center",
  },
  run: {
    fontSize: 16,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  line: {
    height: 2,
    width: 30,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
