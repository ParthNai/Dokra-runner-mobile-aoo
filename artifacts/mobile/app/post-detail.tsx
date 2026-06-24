import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useCommunity, type Comment } from "@/context/CommunityContext";
import { useColors } from "@/hooks/useColors";

const TYPE_ICON: Record<string, string> = { running: "walk", walking: "footsteps", cycling: "bicycle" };
const TYPE_COLOR: Record<string, string> = { running: "#E31E24", walking: "#C9A227", cycling: "#3B82F6" };

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function PostDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { posts, toggleLike, addComment, toggleCommentLike } = useCommunity();
  const params = useLocalSearchParams<{ id: string }>();

  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const post = posts.find((p) => p.id === params.id);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const userId = user?.id ?? "";

  if (!post) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: colors.foreground }}>Post not found</Text>
      </View>
    );
  }

  const liked = post.likes.includes(userId);

  const handleAddComment = async () => {
    if (!commentText.trim() || !user || submitting) return;
    setSubmitting(true);
    try {
      await addComment(post.id, {
        userId: user.id,
        userName: user.fullName,
        text: commentText.trim(),
        userAvatar: user.profilePhoto ?? undefined,
      });
      setCommentText("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerBrand}>
          <Text style={[styles.brandName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>DOKRA</Text>
          <Text style={[styles.brandSub, { color: colors.accent, fontFamily: "Inter_600SemiBold" }]}>RUNNING CLUB</Text>
        </View>
        <Pressable style={styles.iconBtn}>
          <Ionicons name="ellipsis-vertical" size={22} color={colors.foreground} />
        </Pressable>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 80 }]} showsVerticalScrollIndicator={false}>
          {/* POST AUTHOR */}
          <View style={styles.postAuthor}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              {post.userAvatar ? (
                <Image source={{ uri: post.userAvatar }} style={styles.avatarImg} />
              ) : (
                <Text style={[styles.avatarInitial, { fontFamily: "Inter_700Bold" }]}>
                  {post.userName.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View style={styles.authorMeta}>
              <Text style={[styles.authorName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                {post.userName}
              </Text>
              <Text style={[styles.authorSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {timeAgo(post.createdAt)} · {post.userCity}
              </Text>
            </View>
          </View>

          {/* CONTENT */}
          <Text style={[styles.postContent, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
            {post.content}
          </Text>

          {post.activityType && (
            <View style={[styles.actBadge, { backgroundColor: TYPE_COLOR[post.activityType] + "22", borderColor: TYPE_COLOR[post.activityType] + "55", borderRadius: 8 }]}>
              <Ionicons name={TYPE_ICON[post.activityType] as any} size={14} color={TYPE_COLOR[post.activityType]} />
              <Text style={[styles.actBadgeText, { color: TYPE_COLOR[post.activityType], fontFamily: "Inter_500Medium" }]}>
                {post.activityType.charAt(0).toUpperCase() + post.activityType.slice(1)} · {post.activityDistance?.toFixed(1)} km
              </Text>
            </View>
          )}

          {post.images.length > 0 && (
            <Image source={{ uri: post.images[0] }} style={[styles.postImg, { borderRadius: 10 }]} resizeMode="cover" />
          )}

          {/* ACTIONS BAR */}
          <View style={[styles.actionsBar, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
            <Pressable onPress={() => toggleLike(post.id, userId)} style={styles.actionBtn}>
              <Ionicons name={liked ? "heart" : "heart-outline"} size={20} color={liked ? "#E31E24" : colors.mutedForeground} />
              <Text style={[styles.actionText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {post.likes.length}
              </Text>
            </Pressable>
            <Pressable style={styles.actionBtn}>
              <Ionicons name="chatbubble-outline" size={19} color={colors.mutedForeground} />
              <Text style={[styles.actionText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {post.comments.length}
              </Text>
            </Pressable>
            <Pressable
              style={styles.actionBtn}
              onPress={() => Share.share({ message: `${post.userName}: ${post.content}\n\nShared from DOKRA Running Club 🏃` })}
            >
              <Ionicons name="share-social-outline" size={20} color={colors.mutedForeground} />
              <Text style={[styles.actionText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Share
              </Text>
            </Pressable>
          </View>

          {/* LIKES SECTION */}
          {post.likes.length > 0 && (
            <View style={styles.likesSection}>
              <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Likes
              </Text>
              <View style={styles.likesRow}>
                {post.likes.slice(0, 5).map((id, i) => (
                  <View
                    key={id}
                    style={[styles.likeAvatar, { backgroundColor: colors.primary, marginLeft: i > 0 ? -8 : 0 }]}
                  >
                    <Text style={[styles.likeInitial, { fontFamily: "Inter_700Bold" }]}>
                      {id.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                ))}
                {post.likes.length > 5 && (
                  <Text style={[styles.moreLikes, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    +{post.likes.length - 5}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* COMMENTS SECTION */}
          <View style={styles.commentsSection}>
            <Text style={[styles.sectionLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Comments
            </Text>
            {post.comments.length === 0 ? (
              <Text style={[styles.noComments, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Be the first to comment!
              </Text>
            ) : (
              post.comments.map((c) => (
                <CommentRow key={c.id} comment={c} colors={colors} userId={userId} postId={post.id} />
              ))
            )}
          </View>
        </ScrollView>

        {/* COMMENT INPUT */}
        <View style={[styles.commentBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + 4 }]}>
          <View style={[styles.commentInputWrap, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: 22 }]}>
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Add a comment..."
              placeholderTextColor={colors.mutedForeground}
              style={[styles.commentInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
            />
          </View>
          <Pressable
            onPress={handleAddComment}
            disabled={!commentText.trim() || submitting}
            style={[styles.sendBtn, { backgroundColor: commentText.trim() ? colors.primary : colors.border }]}
          >
            <Ionicons name="send" size={16} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function CommentRow({ comment, colors, userId, postId }: { comment: Comment; colors: any; userId: string; postId: string }) {
  const { toggleCommentLike } = useCommunity();
  const liked = comment.likes.includes(userId);

  return (
    <View style={styles.commentRow}>
      <View style={[styles.commentAvatar, { backgroundColor: colors.primary }]}>
        {comment.userAvatar ? (
          <Image source={{ uri: comment.userAvatar }} style={styles.commentAvatarImg} />
        ) : (
          <Text style={[styles.commentInitial, { fontFamily: "Inter_700Bold" }]}>
            {comment.userName.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
      <View style={styles.commentContent}>
        <View style={[styles.commentBubble, { backgroundColor: colors.card, borderRadius: 12 }]}>
          <Text style={[styles.commentName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            {comment.userName}
          </Text>
          <Text style={[styles.commentText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
            {comment.text}
          </Text>
        </View>
        <View style={styles.commentMeta}>
          <Text style={[styles.commentTime, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {timeAgo(comment.createdAt)}
          </Text>
          <Pressable onPress={() => {}} style={styles.replyBtn}>
            <Text style={[styles.replyText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Reply</Text>
          </Pressable>
          <Pressable onPress={() => toggleCommentLike(postId, comment.id, userId)} style={styles.commentLike}>
            <Ionicons name={liked ? "heart" : "heart-outline"} size={13} color={liked ? "#E31E24" : colors.mutedForeground} />
            {comment.likes.length > 0 && (
              <Text style={[styles.commentLikeCount, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {comment.likes.length}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
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
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  iconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerBrand: { alignItems: "center" },
  brandName: { fontSize: 15, letterSpacing: 2 },
  brandSub: { fontSize: 8, letterSpacing: 3, marginTop: -2 },

  scroll: { paddingBottom: 10 },

  postAuthor: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarImg: { width: 44, height: 44, borderRadius: 22 },
  avatarInitial: { color: "#fff", fontSize: 17 },
  authorMeta: { flex: 1, gap: 2 },
  authorName: { fontSize: 15 },
  authorSub: { fontSize: 12 },

  postContent: { fontSize: 15, lineHeight: 22, paddingHorizontal: 16, marginBottom: 12 },
  actBadge: { flexDirection: "row", alignItems: "center", gap: 6, marginHorizontal: 16, marginBottom: 12, padding: 8, borderWidth: 1 },
  actBadgeText: { fontSize: 12 },
  postImg: { width: "100%", height: 240, marginBottom: 4 },

  actionsBar: { flexDirection: "row", borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 10, paddingHorizontal: 16 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  actionText: { fontSize: 13 },

  likesSection: { padding: 16, gap: 10 },
  sectionLabel: { fontSize: 14 },
  likesRow: { flexDirection: "row", alignItems: "center" },
  likeAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#0A0A0A" },
  likeInitial: { color: "#fff", fontSize: 12 },
  moreLikes: { marginLeft: 8, fontSize: 13 },

  commentsSection: { padding: 16, gap: 12 },
  noComments: { fontSize: 13 },

  commentRow: { flexDirection: "row", gap: 10 },
  commentAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  commentAvatarImg: { width: 34, height: 34, borderRadius: 17 },
  commentInitial: { color: "#fff", fontSize: 13 },
  commentContent: { flex: 1, gap: 4 },
  commentBubble: { padding: 10, gap: 3 },
  commentName: { fontSize: 13 },
  commentText: { fontSize: 13, lineHeight: 18 },
  commentMeta: { flexDirection: "row", alignItems: "center", gap: 12, paddingLeft: 4 },
  commentTime: { fontSize: 11 },
  replyBtn: {},
  replyText: { fontSize: 11 },
  commentLike: { flexDirection: "row", alignItems: "center", gap: 3 },
  commentLikeCount: { fontSize: 11 },

  commentBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 10,
    gap: 10,
    borderTopWidth: 1,
  },
  commentInputWrap: { flex: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, height: 42, borderWidth: 1 },
  commentInput: { flex: 1, fontSize: 14, height: 42 },
  sendBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
});
