import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useCommunity, type Post, type ClubEvent, type ClubMember } from "@/context/CommunityContext";
import { useColors } from "@/hooks/useColors";

type Tab = "Feed" | "Members" | "Events" | "Albums";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const TYPE_ICON: Record<string, string> = {
  running: "walk",
  walking: "footsteps",
  cycling: "bicycle",
};
const TYPE_COLOR: Record<string, string> = {
  running: "#E31E24",
  walking: "#C9A227",
  cycling: "#3B82F6",
};

function PostCard({ post, colors, userId }: { post: Post; colors: any; userId: string }) {
  const { toggleLike } = useCommunity();
  const liked = post.likes.includes(userId);

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/post-detail", params: { id: post.id } })}
      style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 14 }]}
    >
      <View style={styles.postHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          {post.userAvatar ? (
            <Image source={{ uri: post.userAvatar }} style={styles.avatarImg} />
          ) : (
            <Text style={[styles.avatarInitial, { fontFamily: "Inter_700Bold" }]}>
              {post.userName.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <View style={styles.postMeta}>
          <Text style={[styles.postUserName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            {post.userName}
          </Text>
          <Text style={[styles.postMetaSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {timeAgo(post.createdAt)} · {post.userCity}
          </Text>
        </View>
        <Pressable style={styles.moreBtn}>
          <Ionicons name="ellipsis-horizontal" size={18} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <Text style={[styles.postContent, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
        {post.content}
      </Text>

      {post.activityType && (
        <View style={[styles.activityBadge, { backgroundColor: TYPE_COLOR[post.activityType] + "22", borderColor: TYPE_COLOR[post.activityType] + "55", borderRadius: 8 }]}>
          <Ionicons name={TYPE_ICON[post.activityType] as any} size={14} color={TYPE_COLOR[post.activityType]} />
          <Text style={[styles.activityBadgeText, { color: TYPE_COLOR[post.activityType], fontFamily: "Inter_500Medium" }]}>
            {post.activityType.charAt(0).toUpperCase() + post.activityType.slice(1)} · {post.activityDistance?.toFixed(1)} km
          </Text>
        </View>
      )}

      {post.images.length > 0 && (
        <Image source={{ uri: post.images[0] }} style={[styles.postImage, { borderRadius: 10 }]} resizeMode="cover" />
      )}

      <View style={[styles.postActions, { borderTopColor: colors.border }]}>
        <Pressable
          onPress={() => toggleLike(post.id, userId)}
          style={styles.actionBtn}
        >
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={20}
            color={liked ? "#E31E24" : colors.mutedForeground}
          />
          <Text style={[styles.actionCount, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {post.likes.length}
          </Text>
        </Pressable>
        <Pressable style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={19} color={colors.mutedForeground} />
          <Text style={[styles.actionCount, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {post.comments.length}
          </Text>
        </Pressable>
        <Pressable style={styles.actionBtn}>
          <Ionicons name="share-social-outline" size={20} color={colors.mutedForeground} />
          <Text style={[styles.actionCount, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Share
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function EventCard({ event, colors, userId }: { event: ClubEvent; colors: any; userId: string }) {
  const { toggleEventGoing, toggleEventInterested } = useCommunity();
  const isGoing = event.going.includes(userId);
  const isInterested = event.interested.includes(userId);

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/event-detail", params: { id: event.id } })}
      style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 14 }]}
    >
      <View style={[styles.eventBanner, { backgroundColor: event.bannerColor + "22", borderTopLeftRadius: 14, borderTopRightRadius: 14 }]}>
        <View style={[styles.eventTypeBadge, { backgroundColor: event.bannerColor }]}>
          <Text style={[styles.eventTypeBadgeText, { fontFamily: "Inter_600SemiBold" }]}>{event.type}</Text>
        </View>
        <Text style={[styles.eventBannerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          {event.title}
        </Text>
        <Ionicons name="walk" size={40} color={event.bannerColor} style={{ alignSelf: "flex-end" }} />
      </View>
      <View style={styles.eventCardBody}>
        <View style={styles.eventInfoRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.mutedForeground} />
          <Text style={[styles.eventInfoText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {event.date} · {event.time}
          </Text>
        </View>
        <View style={styles.eventInfoRow}>
          <Ionicons name="location-outline" size={14} color={colors.mutedForeground} />
          <Text style={[styles.eventInfoText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {event.location}
          </Text>
        </View>
        <View style={styles.eventStats}>
          <Text style={[styles.eventStat, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            {event.going.length} <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Going</Text>
          </Text>
          <Text style={[styles.eventStat, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            {event.interested.length} <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Interested</Text>
          </Text>
        </View>
        <View style={styles.eventBtns}>
          <Pressable
            onPress={() => toggleEventGoing(event.id, userId)}
            style={[styles.eventBtnGoing, { backgroundColor: isGoing ? colors.primary : colors.primary + "22", borderRadius: 8 }]}
          >
            <Text style={[styles.eventBtnText, { color: "#fff", fontFamily: "Inter_600SemiBold" }]}>
              {isGoing ? "✓ Going" : "I'm Going"}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => toggleEventInterested(event.id, userId)}
            style={[styles.eventBtnInterested, { borderColor: colors.border, borderRadius: 8, backgroundColor: isInterested ? colors.border : "transparent" }]}
          >
            <Text style={[styles.eventBtnText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
              {isInterested ? "✓ Interested" : "Interested"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

function MemberCard({ member, colors, rank }: { member: ClubMember; colors: any; rank: number }) {
  return (
    <View style={[styles.memberCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 12 }]}>
      <Text style={[styles.memberRank, { color: colors.mutedForeground, fontFamily: "Inter_700Bold" }]}>
        #{rank}
      </Text>
      <View style={[styles.memberAvatar, { backgroundColor: colors.primary }]}>
        <Text style={[styles.memberInitial, { fontFamily: "Inter_700Bold" }]}>
          {member.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={[styles.memberName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
          {member.name}
        </Text>
        <Text style={[styles.memberCity, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {member.city}
        </Text>
      </View>
      <Text style={[styles.memberKm, { color: colors.accent, fontFamily: "Inter_700Bold" }]}>
        {member.totalKm} km
      </Text>
    </View>
  );
}

export default function CommunityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getClubPosts, getClubEvents, getClubMembers } = useCommunity();

  const [activeTab, setActiveTab] = useState<Tab>("Feed");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const city = user?.city || "Ahmedabad";
  const clubName = user?.clubName || "DOKRA Ahmedabad Running Club";
  const userId = user?.id || "";

  const clubPosts = getClubPosts(city);
  const clubEvents = getClubEvents(city);
  const clubMembers = getClubMembers(city);

  const TABS: Tab[] = ["Feed", "Members", "Events", "Albums"];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Ionicons name="menu" size={24} color={colors.foreground} />
        <View style={styles.brandCenter}>
          <Text style={[styles.brandName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>DOKRA</Text>
          <Text style={[styles.brandSub, { color: colors.accent, fontFamily: "Inter_600SemiBold" }]}>RUNNING CLUB</Text>
        </View>
        <Ionicons name="notifications-outline" size={24} color={colors.foreground} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* CLUB BANNER */}
        <View style={[styles.clubBanner, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={[styles.clubAvatar, { backgroundColor: colors.primary + "22" }]}>
            <Ionicons name="walk" size={28} color={colors.primary} />
          </View>
          <View style={styles.clubInfo}>
            <Text style={[styles.clubName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              DOKRA {city}
            </Text>
            <View style={styles.clubLocationRow}>
              <Ionicons name="location-outline" size={12} color={colors.mutedForeground} />
              <Text style={[styles.clubLocation, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {city}, {user?.state || "Gujarat"}
              </Text>
            </View>
          </View>
          <View style={[styles.membersBadge, { backgroundColor: colors.primary + "22", borderRadius: 8 }]}>
            <Text style={[styles.membersCount, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
              {clubMembers.length + 243}
            </Text>
            <Text style={[styles.membersLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Members
            </Text>
          </View>
        </View>

        {/* TABS */}
        <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
          {TABS.map((t) => (
            <Pressable key={t} onPress={() => setActiveTab(t)} style={styles.tab}>
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === t ? colors.primary : colors.mutedForeground,
                    fontFamily: activeTab === t ? "Inter_600SemiBold" : "Inter_400Regular",
                  },
                ]}
              >
                {t}
              </Text>
              {activeTab === t && (
                <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />
              )}
            </Pressable>
          ))}
        </View>

        {/* FEED TAB */}
        {activeTab === "Feed" && (
          <View style={styles.feedWrap}>
            {/* Create Post Box */}
            <Pressable
              onPress={() => router.push("/create-post")}
              style={[styles.createBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 12 }]}
            >
              <View style={[styles.createAvatar, { backgroundColor: colors.primary }]}>
                <Text style={[styles.avatarInitial, { fontFamily: "Inter_700Bold" }]}>
                  {(user?.fullName ?? "U").charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.createPlaceholder, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                What's on your mind, {user?.fullName?.split(" ")[0] ?? "runner"}?
              </Text>
              <Ionicons name="camera" size={22} color={colors.mutedForeground} />
            </Pressable>

            {/* Posts */}
            {clubPosts.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="people-outline" size={56} color={colors.border} />
                <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>No posts yet</Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Be the first to share with your club!</Text>
              </View>
            ) : (
              clubPosts.map((p) => (
                <PostCard key={p.id} post={p} colors={colors} userId={userId} />
              ))
            )}
          </View>
        )}

        {/* MEMBERS TAB */}
        {activeTab === "Members" && (
          <View style={styles.membersWrap}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
              {clubMembers.length} Members
            </Text>
            {clubMembers.map((m, i) => (
              <MemberCard key={m.id} member={m} colors={colors} rank={i + 1} />
            ))}
          </View>
        )}

        {/* EVENTS TAB */}
        {activeTab === "Events" && (
          <View style={styles.eventsWrap}>
            {clubEvents.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="calendar-outline" size={56} color={colors.border} />
                <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>No events yet</Text>
              </View>
            ) : (
              clubEvents.map((e) => (
                <EventCard key={e.id} event={e} colors={colors} userId={userId} />
              ))
            )}
          </View>
        )}

        {/* ALBUMS TAB */}
        {activeTab === "Albums" && (
          <View style={styles.albumsWrap}>
            <View style={styles.empty}>
              <Ionicons name="images-outline" size={56} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>No albums yet</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Club photo albums will appear here</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => router.push("/create-post")}
        style={[styles.fab, { backgroundColor: colors.primary }]}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  brandCenter: { alignItems: "center" },
  brandName: { fontSize: 16, letterSpacing: 2 },
  brandSub: { fontSize: 9, letterSpacing: 3, marginTop: -2 },

  clubBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  clubAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  clubInfo: { flex: 1, gap: 3 },
  clubName: { fontSize: 15 },
  clubLocationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  clubLocation: { fontSize: 11 },
  membersBadge: { alignItems: "center", padding: 8 },
  membersCount: { fontSize: 18 },
  membersLabel: { fontSize: 10 },

  tabBar: { flexDirection: "row", borderBottomWidth: 1, marginHorizontal: 0 },
  tab: { flex: 1, alignItems: "center", paddingVertical: 12, position: "relative" },
  tabText: { fontSize: 13 },
  tabIndicator: { position: "absolute", bottom: 0, left: "15%", right: "15%", height: 2, borderRadius: 1 },

  feedWrap: { paddingHorizontal: 14, paddingTop: 12, gap: 12 },
  createBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
    borderWidth: 1,
  },
  createAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  createPlaceholder: { flex: 1, fontSize: 13 },

  postCard: { borderWidth: 1, overflow: "hidden" },
  postHeader: { flexDirection: "row", alignItems: "center", padding: 14, gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarImg: { width: 40, height: 40, borderRadius: 20 },
  avatarInitial: { color: "#fff", fontSize: 16 },
  postMeta: { flex: 1, gap: 2 },
  postUserName: { fontSize: 14 },
  postMetaSub: { fontSize: 11 },
  moreBtn: { padding: 4 },
  postContent: { fontSize: 14, lineHeight: 20, paddingHorizontal: 14, marginBottom: 10 },
  activityBadge: { flexDirection: "row", alignItems: "center", gap: 6, marginHorizontal: 14, marginBottom: 10, padding: 8, borderWidth: 1 },
  activityBadgeText: { fontSize: 12 },
  postImage: { width: "100%", height: 200, marginBottom: 4 },
  postActions: { flexDirection: "row", borderTopWidth: 1, paddingTop: 10, paddingBottom: 12, paddingHorizontal: 14, gap: 0 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  actionCount: { fontSize: 13 },

  membersWrap: { paddingHorizontal: 14, paddingTop: 14, gap: 8 },
  sectionTitle: { fontSize: 12, letterSpacing: 1, marginBottom: 4 },
  memberCard: { flexDirection: "row", alignItems: "center", padding: 12, gap: 12, borderWidth: 1 },
  memberRank: { fontSize: 13, width: 28 },
  memberAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  memberInitial: { color: "#fff", fontSize: 16 },
  memberInfo: { flex: 1, gap: 2 },
  memberName: { fontSize: 14 },
  memberCity: { fontSize: 11 },
  memberKm: { fontSize: 15 },

  eventsWrap: { paddingHorizontal: 14, paddingTop: 14, gap: 14 },
  eventCard: { borderWidth: 1, overflow: "hidden" },
  eventBanner: { padding: 16, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  eventBannerLeft: { flex: 1, gap: 6 },
  eventTypeBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  eventTypeBadgeText: { color: "#fff", fontSize: 11 },
  eventBannerTitle: { fontSize: 18, marginTop: 6 },
  eventCardBody: { padding: 14, gap: 8 },
  eventInfoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  eventInfoText: { fontSize: 12 },
  eventStats: { flexDirection: "row", gap: 16, marginTop: 2 },
  eventStat: { fontSize: 13 },
  eventBtns: { flexDirection: "row", gap: 10, marginTop: 4 },
  eventBtnGoing: { flex: 1, paddingVertical: 10, alignItems: "center" },
  eventBtnInterested: { flex: 1, paddingVertical: 10, alignItems: "center", borderWidth: 1 },
  eventBtnText: { fontSize: 13 },

  albumsWrap: { paddingTop: 14 },

  empty: { alignItems: "center", paddingTop: 50, paddingBottom: 30, gap: 10 },
  emptyTitle: { fontSize: 17 },
  emptyText: { fontSize: 13, textAlign: "center", paddingHorizontal: 40 },

  fab: {
    position: "absolute",
    bottom: Platform.OS === "web" ? 100 : 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#E31E24",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});
