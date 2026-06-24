import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const FAQS = [
  { q: "How do I start tracking a run?", a: "Tap the 'Activity' tab, choose your activity type (Walking, Running, or Cycling), then tap 'Start'. Your GPS will begin tracking automatically." },
  { q: "How is my pace calculated?", a: "Pace is calculated as minutes per kilometer based on your current GPS speed and distance covered." },
  { q: "Can I edit my profile photo?", a: "Yes! Go to Profile → Edit Profile, then tap on your profile photo to take a new one or choose from your gallery." },
  { q: "What is City vs City competition?", a: "City vs City ranks all runners by total distance in their respective cities, creating a competitive leaderboard between cities across India." },
  { q: "How do I join events?", a: "Go to Community → Events tab, find an event, and tap 'I'm Going' to RSVP. You'll be listed among attendees." },
  { q: "Is my data safe?", a: "Yes. All your activity data is stored securely on your device using local storage. We don't share personal data with third parties." },
];

export default function HelpSupportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    Alert.alert("Message Sent", "Thank you! Our support team will get back to you within 24 hours.", [
      { text: "OK", onPress: () => setMessage("") },
    ]);
  };

  const CONTACT_ITEMS = [
    { icon: "mail-outline", label: "Email Support", value: "support@dokrarunning.com", color: "#E31E24", onPress: () => Linking.openURL("mailto:support@dokrarunning.com") },
    { icon: "logo-whatsapp", label: "WhatsApp", value: "+91 98765 43210", color: "#22c55e", onPress: () => Linking.openURL("https://wa.me/919876543210") },
    { icon: "globe-outline", label: "Website", value: "www.dokrarunning.com", color: "#3B82F6", onPress: () => Linking.openURL("https://dokrarunning.com") },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          Help & Support
        </Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={[styles.heroBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="headset-outline" size={40} color="#E31E24" />
          <View style={styles.heroText}>
            <Text style={[styles.heroTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              How can we help?
            </Text>
            <Text style={[styles.heroSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Avg. response time: 24 hours
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
          CONTACT US
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {CONTACT_ITEMS.map((item, idx) => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              style={({ pressed }) => [
                styles.contactRow,
                { borderBottomColor: colors.border },
                idx < CONTACT_ITEMS.length - 1 && styles.rowBorder,
                pressed && { backgroundColor: colors.border + "30" },
              ]}
            >
              <View style={[styles.contactIcon, { backgroundColor: item.color + "22" }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <View style={styles.contactText}>
                <Text style={[styles.contactLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {item.label}
                </Text>
                <Text style={[styles.contactValue, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {item.value}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
          FREQUENTLY ASKED QUESTIONS
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {FAQS.map((faq, idx) => (
            <Pressable
              key={idx}
              onPress={() => setOpenFaq(openFaq === idx ? null : idx)}
              style={[
                styles.faqRow,
                { borderBottomColor: colors.border },
                idx < FAQS.length - 1 && styles.rowBorder,
              ]}
            >
              <View style={styles.faqHeader}>
                <Text style={[styles.faqQ, { color: colors.foreground, fontFamily: "Inter_500Medium", flex: 1 }]}>
                  {faq.q}
                </Text>
                <Ionicons
                  name={openFaq === idx ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={colors.mutedForeground}
                />
              </View>
              {openFaq === idx && (
                <Text style={[styles.faqA, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {faq.a}
                </Text>
              )}
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
          SEND A MESSAGE
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, padding: 16, gap: 12 }]}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Describe your issue or question..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={5}
            style={[
              styles.messageInput,
              {
                color: colors.foreground,
                backgroundColor: colors.background,
                borderColor: colors.border,
                fontFamily: "Inter_400Regular",
              },
            ]}
          />
          <Pressable
            onPress={handleSend}
            style={[styles.sendBtn, { backgroundColor: message.trim() ? "#E31E24" : colors.border }]}
          >
            <Ionicons name="send" size={16} color="#fff" />
            <Text style={[styles.sendBtnText, { fontFamily: "Inter_700Bold" }]}>Send Message</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1,
  },
  iconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17 },
  scroll: { padding: 16, gap: 16, paddingBottom: 100 },
  heroBanner: {
    flexDirection: "row", alignItems: "center", padding: 20, gap: 16,
    borderRadius: 14, borderWidth: 1,
  },
  heroText: { flex: 1, gap: 4 },
  heroTitle: { fontSize: 18 },
  heroSub: { fontSize: 13 },
  sectionTitle: { fontSize: 11, letterSpacing: 2, marginTop: 4 },
  card: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  contactRow: {
    flexDirection: "row", alignItems: "center", padding: 14, gap: 14,
  },
  rowBorder: { borderBottomWidth: 1 },
  contactIcon: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  contactText: { flex: 1, gap: 2 },
  contactLabel: { fontSize: 14 },
  contactValue: { fontSize: 12 },
  faqRow: { padding: 16, gap: 8 },
  faqHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  faqQ: { fontSize: 14, lineHeight: 20 },
  faqA: { fontSize: 13, lineHeight: 20, marginTop: 4 },
  messageInput: {
    borderWidth: 1, borderRadius: 10, padding: 14,
    fontSize: 14, lineHeight: 20, minHeight: 120, textAlignVertical: "top",
  },
  sendBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, borderRadius: 12,
  },
  sendBtnText: { color: "#fff", fontSize: 15 },
});
