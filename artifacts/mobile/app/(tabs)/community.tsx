import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PostCard } from "@/components/PostCard";
import { useAuth } from "@/context/AuthContext";
import { useCommunity } from "@/context/CommunityContext";
import { useColors } from "@/hooks/useColors";

export default function CommunityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { posts, createPost } = useCommunity();
  const [showCreate, setShowCreate] = useState(false);
  const [postText, setPostText] = useState("");
  const [posting, setPosting] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const clubPosts = user?.clubName
    ? posts.filter((p) => p.userClub === user.clubName || p.userCity === user.city)
    : posts;

  const handlePost = async () => {
    if (!postText.trim() || !user) return;
    setPosting(true);
    try {
      await createPost({
        userId: user.id,
        userName: user.fullName,
        userClub: user.clubName,
        userCity: user.city,
        userState: user.state,
        content: postText.trim(),
      });
      setPostText("");
      setShowCreate(false);
    } catch (e) {
      Alert.alert("Error", "Failed to create post");
    } finally {
      setPosting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            COMMUNITY
          </Text>
          {user?.clubName && (
            <Text style={[styles.clubLabel, { color: colors.accent, fontFamily: "Inter_500Medium" }]}>
              {user.clubName}
            </Text>
          )}
        </View>
        <Pressable
          onPress={() => setShowCreate(true)}
          style={[styles.addBtn, { backgroundColor: colors.primary, borderRadius: 22 }]}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      <FlatList
        data={clubPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === "web" ? 120 : 100 }]}
        scrollEnabled={!!clubPosts.length}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={60} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              No posts yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Be the first to share with your club!
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={showCreate}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreate(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalBox,
              {
                backgroundColor: colors.card,
                borderRadius: colors.radius * 2,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                Share with Club
              </Text>
              <Pressable onPress={() => setShowCreate(false)}>
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </Pressable>
            </View>
            <TextInput
              value={postText}
              onChangeText={setPostText}
              placeholder="What's on your mind, runner?"
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={5}
              style={[
                styles.postInput,
                {
                  color: colors.foreground,
                  backgroundColor: colors.input,
                  borderRadius: colors.radius,
                  borderColor: colors.border,
                  fontFamily: "Inter_400Regular",
                },
              ]}
              textAlignVertical="top"
            />
            <Pressable
              onPress={handlePost}
              disabled={!postText.trim() || posting}
              style={[
                styles.postBtn,
                {
                  backgroundColor: !postText.trim() ? colors.border : colors.primary,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <Text style={[styles.postBtnText, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                {posting ? "Posting..." : "POST"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: { fontSize: 22, letterSpacing: 2 },
  clubLabel: { fontSize: 12, marginTop: 2 },
  addBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  list: { paddingHorizontal: 16, paddingTop: 8 },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18 },
  emptyText: { fontSize: 14, textAlign: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalBox: {
    margin: 16,
    padding: 20,
    gap: 14,
    borderWidth: 1,
  },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalTitle: { fontSize: 18 },
  postInput: {
    padding: 14,
    minHeight: 120,
    fontSize: 14,
    borderWidth: 1,
  },
  postBtn: { paddingVertical: 14, alignItems: "center" },
  postBtnText: { fontSize: 15, letterSpacing: 1 },
});
