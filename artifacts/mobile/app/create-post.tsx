import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
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
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useCommunity } from "@/context/CommunityContext";
import { useColors } from "@/hooks/useColors";

const ACTIVITY_TYPES = [
  { value: "running", label: "Morning Run", icon: "walk" },
  { value: "walking", label: "Evening Walk", icon: "footsteps" },
  { value: "cycling", label: "Cycling", icon: "bicycle" },
];

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public" },
  { value: "members", label: "Members Only" },
];

export default function CreatePostScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { createPost } = useCommunity();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [activityType, setActivityType] = useState<string>("");
  const [visibility, setVisibility] = useState<"public" | "members">("public");
  const [posting, setPosting] = useState(false);
  const [showActivityPicker, setShowActivityPicker] = useState(false);
  const [showVisibilityPicker, setShowVisibilityPicker] = useState(false);

  const handlePickImage = async () => {
    if (images.length >= 4) { Alert.alert("Maximum 4 images allowed"); return; }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") { Alert.alert("Permission needed", "Allow photo access to upload images."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const newUris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...newUris].slice(0, 4));
    }
  };

  const handlePost = async () => {
    if (!text.trim() && images.length === 0) { Alert.alert("Empty post", "Write something or add a photo first."); return; }
    if (!user) return;
    setPosting(true);
    try {
      await createPost({
        userId: user.id,
        userName: user.fullName,
        userAvatar: user.profilePhoto ?? undefined,
        userClub: user.clubName || "DOKRA Running Club",
        userCity: user.city || "",
        userState: user.state || "",
        content: text.trim(),
        images,
        activityType: activityType || undefined,
        location: user.city || undefined,
        visibility,
      });
      router.back();
    } catch {
      Alert.alert("Error", "Failed to create post. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const selectedActivity = ACTIVITY_TYPES.find((a) => a.value === activityType);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="close" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          Create Post
        </Text>
        <Pressable
          onPress={handlePost}
          disabled={(!text.trim() && images.length === 0) || posting}
        >
          <Text
            style={[
              styles.postBtn,
              {
                color: (!text.trim() && images.length === 0) ? colors.mutedForeground : colors.primary,
                fontFamily: "Inter_700Bold",
              },
            ]}
          >
            {posting ? "POSTING..." : "POST"}
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* USER ROW */}
          <View style={styles.userRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              {user?.profilePhoto ? (
                <Image source={{ uri: user.profilePhoto }} style={styles.avatarImg} />
              ) : (
                <Text style={[styles.avatarInitial, { fontFamily: "Inter_700Bold" }]}>
                  {(user?.fullName ?? "U").charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View style={styles.userMeta}>
              <Text style={[styles.userName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                {user?.fullName}
              </Text>
              <View style={[styles.clubBadge, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 12 }]}>
                <Text style={[styles.clubBadgeText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {user?.clubName || "DOKRA Running Club"}
                </Text>
                <Ionicons name="chevron-down" size={12} color={colors.mutedForeground} />
              </View>
            </View>
          </View>

          {/* TEXT INPUT */}
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="What's on your mind?"
            placeholderTextColor={colors.mutedForeground}
            multiline
            textAlignVertical="top"
            maxLength={500}
            style={[styles.textInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
          />
          <Text style={[styles.charCount, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {text.length}/500
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* ADD PHOTOS */}
          <View style={styles.photosSection}>
            <View style={styles.photosSectionHeader}>
              <Ionicons name="images-outline" size={20} color={colors.mutedForeground} />
              <Text style={[styles.photosSectionTitle, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                Add Photos / Videos
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesRow}>
              {images.map((uri, idx) => (
                <View key={idx} style={styles.imageThumbWrap}>
                  <Image source={{ uri }} style={[styles.imageThumb, { borderRadius: 8 }]} />
                  <Pressable
                    onPress={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                    style={[styles.removeImg, { backgroundColor: "rgba(0,0,0,0.7)" }]}
                  >
                    <Ionicons name="close" size={14} color="#fff" />
                  </Pressable>
                </View>
              ))}
              {images.length < 4 && (
                <Pressable
                  onPress={handlePickImage}
                  style={[styles.addImageBtn, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 8 }]}
                >
                  <Ionicons name="add" size={28} color={colors.mutedForeground} />
                </Pressable>
              )}
            </ScrollView>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* OPTIONS */}
          <View style={styles.optionsSection}>
            {/* Location */}
            <View style={[styles.optionRow, { borderBottomColor: colors.border }]}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: "#E31E2422" }]}>
                  <Ionicons name="location-outline" size={18} color={colors.primary} />
                </View>
                <Text style={[styles.optionLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  Add Location
                </Text>
              </View>
              <Text style={[styles.optionValue, { color: colors.accent, fontFamily: "Inter_400Regular" }]}>
                {user?.city && user?.state ? `${user.city}, ${user.state}` : "Add"}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </View>

            {/* Activity */}
            <Pressable
              onPress={() => setShowActivityPicker(!showActivityPicker)}
              style={[styles.optionRow, { borderBottomColor: colors.border }]}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: "#C9A22722" }]}>
                  <Ionicons name="walk-outline" size={18} color={colors.accent} />
                </View>
                <Text style={[styles.optionLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  Add Activity (Optional)
                </Text>
              </View>
              <Text style={[styles.optionValue, { color: colors.accent, fontFamily: "Inter_400Regular" }]}>
                {selectedActivity?.label || "None"}
              </Text>
              <Ionicons name={showActivityPicker ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
            </Pressable>
            {showActivityPicker && (
              <View style={[styles.pickerDropdown, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 10 }]}>
                <Pressable
                  onPress={() => { setActivityType(""); setShowActivityPicker(false); }}
                  style={[styles.pickerOption, { borderBottomColor: colors.border }]}
                >
                  <Text style={[styles.pickerOptionText, { color: !activityType ? colors.primary : colors.foreground, fontFamily: "Inter_400Regular" }]}>
                    None
                  </Text>
                  {!activityType && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                </Pressable>
                {ACTIVITY_TYPES.map((a) => (
                  <Pressable
                    key={a.value}
                    onPress={() => { setActivityType(a.value); setShowActivityPicker(false); }}
                    style={[styles.pickerOption, { borderBottomColor: colors.border }]}
                  >
                    <Ionicons name={a.icon as any} size={16} color={colors.mutedForeground} />
                    <Text style={[styles.pickerOptionText, { color: activityType === a.value ? colors.primary : colors.foreground, fontFamily: "Inter_400Regular" }]}>
                      {a.label}
                    </Text>
                    {activityType === a.value && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                  </Pressable>
                ))}
              </View>
            )}

            {/* Visibility */}
            <Pressable
              onPress={() => setShowVisibilityPicker(!showVisibilityPicker)}
              style={[styles.optionRow, { borderBottomColor: "transparent" }]}
            >
              <View style={styles.optionLeft}>
                <View style={[styles.optionIcon, { backgroundColor: "#3B82F622" }]}>
                  <Ionicons name="eye-outline" size={18} color="#3B82F6" />
                </View>
                <Text style={[styles.optionLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
                  Visibility
                </Text>
              </View>
              <Text style={[styles.optionValue, { color: colors.accent, fontFamily: "Inter_400Regular" }]}>
                {visibility === "public" ? "Public" : "Members Only"}
              </Text>
              <Ionicons name={showVisibilityPicker ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
            </Pressable>
            {showVisibilityPicker && (
              <View style={[styles.pickerDropdown, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 10 }]}>
                {VISIBILITY_OPTIONS.map((v) => (
                  <Pressable
                    key={v.value}
                    onPress={() => { setVisibility(v.value as any); setShowVisibilityPicker(false); }}
                    style={[styles.pickerOption, { borderBottomColor: colors.border }]}
                  >
                    <Text style={[styles.pickerOptionText, { color: visibility === v.value ? colors.primary : colors.foreground, fontFamily: "Inter_400Regular" }]}>
                      {v.label}
                    </Text>
                    {visibility === v.value && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  iconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17 },
  postBtn: { fontSize: 16, paddingHorizontal: 4 },
  scroll: { paddingTop: 16 },
  userRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 12, marginBottom: 16 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarImg: { width: 44, height: 44, borderRadius: 22 },
  avatarInitial: { color: "#fff", fontSize: 17 },
  userMeta: { gap: 4 },
  userName: { fontSize: 15 },
  clubBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  clubBadgeText: { fontSize: 11 },
  textInput: { fontSize: 16, lineHeight: 24, paddingHorizontal: 16, minHeight: 120 },
  charCount: { textAlign: "right", fontSize: 11, paddingHorizontal: 16, marginTop: 4 },
  divider: { height: 1, marginVertical: 16 },
  photosSection: { paddingHorizontal: 16, gap: 12 },
  photosSectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  photosSectionTitle: { fontSize: 14 },
  imagesRow: { flexDirection: "row" },
  imageThumbWrap: { position: "relative", marginRight: 8 },
  imageThumb: { width: 90, height: 90 },
  removeImg: { position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  addImageBtn: { width: 90, height: 90, alignItems: "center", justifyContent: "center", borderWidth: 1, borderStyle: "dashed" },
  optionsSection: { paddingHorizontal: 16 },
  optionRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, gap: 0 },
  optionLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  optionIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  optionLabel: { fontSize: 14 },
  optionValue: { fontSize: 13, marginRight: 8 },
  pickerDropdown: { borderWidth: 1, marginBottom: 4, overflow: "hidden" },
  pickerOption: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1 },
  pickerOptionText: { flex: 1, fontSize: 14 },
});
