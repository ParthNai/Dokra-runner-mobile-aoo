import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { Post } from "@/context/CommunityContext";
import { useCommunity } from "@/context/CommunityContext";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

interface PostCardProps {
  post: Post;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function PostCard({ post }: PostCardProps) {
  const colors = useColors();
  const { toggleLike, addComment } = useCommunity();
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const isLiked = user ? post.likes.includes(user.id) : false;

  const handleLike = () => {
    if (!user) return;
    toggleLike(post.id, user.id);
  };

  const handleComment = () => {
    if (!user || !commentText.trim()) return;
    addComment(post.id, {
      userId: user.id,
      userName: user.fullName,
      text: commentText.trim(),
    });
    setCommentText("");
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { fontFamily: "Inter_700Bold" }]}>
            {post.userName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            {post.userName}
          </Text>
          <Text style={[styles.club, { color: colors.accent, fontFamily: "Inter_400Regular" }]}>
            {post.userClub}
          </Text>
        </View>
        <Text style={[styles.time, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {timeAgo(post.createdAt)}
        </Text>
      </View>

      {post.activityDistance && (
        <View style={[styles.activityBadge, { backgroundColor: colors.primary + "22" }]}>
          <Ionicons name="walk" size={14} color={colors.primary} />
          <Text style={[styles.activityText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
            {post.activityDistance.toFixed(2)} km {post.activityType}
          </Text>
        </View>
      )}

      <Text style={[styles.content, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
        {post.content}
      </Text>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.actions}>
        <Pressable style={styles.action} onPress={handleLike}>
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={20}
            color={isLiked ? colors.primary : colors.mutedForeground}
          />
          <Text
            style={[
              styles.actionText,
              {
                color: isLiked ? colors.primary : colors.mutedForeground,
                fontFamily: "Inter_500Medium",
              },
            ]}
          >
            {post.likes.length}
          </Text>
        </Pressable>
        <Pressable
          style={styles.action}
          onPress={() => setShowComments(!showComments)}
        >
          <Ionicons name="chatbubble-outline" size={20} color={colors.mutedForeground} />
          <Text style={[styles.actionText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
            {post.comments.length}
          </Text>
        </Pressable>
      </View>

      {showComments && (
        <View style={styles.comments}>
          {post.comments.map((c) => (
            <View key={c.id} style={styles.comment}>
              <Text style={[styles.commentUser, { color: colors.accent, fontFamily: "Inter_600SemiBold" }]}>
                {c.userName}:{" "}
              </Text>
              <Text style={[styles.commentText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                {c.text}
              </Text>
            </View>
          ))}
          <View style={[styles.commentInput, { borderColor: colors.border }]}>
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Add comment..."
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
              returnKeyType="send"
              onSubmitEditing={handleComment}
            />
            <Pressable onPress={handleComment}>
              <Ionicons name="send" size={18} color={colors.primary} />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 14,
  },
  club: {
    fontSize: 11,
  },
  time: {
    fontSize: 11,
  },
  activityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  activityText: {
    fontSize: 12,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 20,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    fontSize: 14,
  },
  comments: {
    gap: 8,
  },
  comment: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  commentUser: {
    fontSize: 13,
  },
  commentText: {
    fontSize: 13,
  },
  commentInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
  },
});
