import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
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
import { useActivity } from "@/context/ActivityContext";
import { useColors } from "@/hooks/useColors";

type BoardScope = "city" | "state" | "india";
type TimeFilter = "This Week" | "This Month" | "This Year" | "All Time";
type ViewMode = "overview" | "board";

interface LeaderEntry {
  userId: string;
  name: string;
  city: string;
  state: string;
  totalKm: number;
  isCurrentUser?: boolean;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const CITY_MOCK: Record<string, LeaderEntry[]> = {
  Ahmedabad: [
    { userId: "a1", name: "Jay Patel", city: "Ahmedabad", state: "Gujarat", totalKm: 156.8 },
    { userId: "a2", name: "Ravi Joshi", city: "Ahmedabad", state: "Gujarat", totalKm: 128.4 },
    { userId: "a3", name: "Neha Patel", city: "Ahmedabad", state: "Gujarat", totalKm: 118.7 },
    { userId: "a4", name: "Meet Shah", city: "Ahmedabad", state: "Gujarat", totalKm: 105.2 },
    { userId: "a5", name: "Dhaval Mehta", city: "Ahmedabad", state: "Gujarat", totalKm: 98.6 },
    { userId: "a6", name: "Priya Sharma", city: "Ahmedabad", state: "Gujarat", totalKm: 92.3 },
    { userId: "a7", name: "Hardik Soni", city: "Ahmedabad", state: "Gujarat", totalKm: 88.9 },
    { userId: "a8", name: "Mitul Desai", city: "Ahmedabad", state: "Gujarat", totalKm: 75.4 },
  ],
  Mumbai: [
    { userId: "m1", name: "Arjun Kapoor", city: "Mumbai", state: "Maharashtra", totalKm: 189.3 },
    { userId: "m2", name: "Priya Desai", city: "Mumbai", state: "Maharashtra", totalKm: 164.2 },
    { userId: "m3", name: "Rohan Verma", city: "Mumbai", state: "Maharashtra", totalKm: 145.8 },
    { userId: "m4", name: "Sneha Rao", city: "Mumbai", state: "Maharashtra", totalKm: 132.1 },
    { userId: "m5", name: "Karan Malhotra", city: "Mumbai", state: "Maharashtra", totalKm: 119.7 },
  ],
};

const STATE_MOCK: Record<string, LeaderEntry[]> = {
  Gujarat: [
    { userId: "a1", name: "Jay Patel", city: "Ahmedabad", state: "Gujarat", totalKm: 286.5 },
    { userId: "g2", name: "Dhaval Mehta", city: "Surat", state: "Gujarat", totalKm: 265.7 },
    { userId: "g3", name: "Meet Shah", city: "Vadodara", state: "Gujarat", totalKm: 244.3 },
    { userId: "a2", name: "Ravi Joshi", city: "Ahmedabad", state: "Gujarat", totalKm: 233.4 },
    { userId: "a3", name: "Neha Patel", city: "Ahmedabad", state: "Gujarat", totalKm: 221.8 },
    { userId: "a6", name: "Priya Sharma", city: "Ahmedabad", state: "Gujarat", totalKm: 210.6 },
    { userId: "a7", name: "Hardik Soni", city: "Rajkot", state: "Gujarat", totalKm: 198.7 },
    { userId: "a8", name: "Mitul Desai", city: "Ahmedabad", state: "Gujarat", totalKm: 187.9 },
  ],
  Maharashtra: [
    { userId: "m1", name: "Arjun Kapoor", city: "Mumbai", state: "Maharashtra", totalKm: 312.5 },
    { userId: "m2", name: "Priya Desai", city: "Pune", state: "Maharashtra", totalKm: 289.2 },
    { userId: "m3", name: "Rohan Verma", city: "Mumbai", state: "Maharashtra", totalKm: 267.8 },
    { userId: "m4", name: "Sneha Rao", city: "Nagpur", state: "Maharashtra", totalKm: 245.3 },
    { userId: "m5", name: "Karan Malhotra", city: "Mumbai", state: "Maharashtra", totalKm: 228.1 },
  ],
};

const INDIA_MOCK: LeaderEntry[] = [
  { userId: "i1", name: "Arjun Singh", city: "Delhi", state: "Delhi", totalKm: 1256.8 },
  { userId: "i2", name: "Rohit Verma", city: "Bangalore", state: "Karnataka", totalKm: 1112.4 },
  { userId: "i3", name: "Pooja Reddy", city: "Hyderabad", state: "Telangana", totalKm: 982.7 },
  { userId: "i4", name: "Vivek Kumar", city: "Chennai", state: "Tamil Nadu", totalKm: 876.3 },
  { userId: "i5", name: "Ankit Sharma", city: "Mumbai", state: "Maharashtra", totalKm: 765.4 },
  { userId: "i6", name: "Sneha Iyer", city: "Pune", state: "Maharashtra", totalKm: 654.8 },
  { userId: "i7", name: "Karan Malhotra", city: "Kolkata", state: "West Bengal", totalKm: 612.7 },
  { userId: "i8", name: "Vikas Yadav", city: "Jaipur", state: "Rajasthan", totalKm: 589.3 },
];

const SCOPE_CONFIG: Record<BoardScope, { label: string; subtitle: (u: any) => string }> = {
  city: { label: "CITY LEADERBOARD", subtitle: (u) => `${u?.city || "Ahmedabad"}, ${u?.state || "Gujarat"}` },
  state: { label: "STATE LEADERBOARD", subtitle: (u) => u?.state || "Gujarat" },
  india: { label: "INDIA LEADERBOARD", subtitle: () => "India" },
};

const MEDAL_COLORS = ["#C0C0C0", "#FFD700", "#CD7F32"];
const MEDAL_ICONS = ["🥈", "🥇", "🥉"];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ name, size, color }: { name: string; size: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color || "#E31E24", alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#fff", fontSize: size * 0.38, fontFamily: "Inter_700Bold" }}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

function PodiumTop({ entries, colors }: { entries: LeaderEntry[]; colors: any }) {
  if (entries.length < 3) return null;

  // Podium order: 2nd (left), 1st (center elevated), 3rd (right)
  const order = [entries[1], entries[0], entries[2]];
  const ranks = [2, 1, 3];
  const sizes = [64, 80, 64];
  const marginTops = [30, 0, 40];
  const medalBg = ["#9CA3AF", "#F59E0B", "#CD7F32"];

  return (
    <View style={podStyles.wrap}>
      {order.map((entry, i) => (
        <View key={entry.userId} style={[podStyles.slot, { marginTop: marginTops[i] }]}>
          {/* Crown badge */}
          <View style={[podStyles.crownBadge, { backgroundColor: medalBg[i] }]}>
            <Text style={podStyles.crownNum}>{ranks[i]}</Text>
          </View>
          {/* Avatar ring */}
          <View style={[podStyles.avatarRing, { borderColor: medalBg[i], width: sizes[i] + 6, height: sizes[i] + 6, borderRadius: (sizes[i] + 6) / 2 }]}>
            <Avatar name={entry.name} size={sizes[i]} color={i === 1 ? "#E31E24" : "#2A2A2A"} />
          </View>
          <Text style={[podStyles.podName, { color: i === 1 ? colors.foreground : colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>
            {entry.name.split(" ")[0]}
          </Text>
          <Text style={[podStyles.podKm, { color: i === 1 ? "#FFD700" : colors.mutedForeground, fontFamily: "Inter_700Bold" }]}>
            {entry.totalKm.toFixed(1)} KM
          </Text>
        </View>
      ))}
    </View>
  );
}

function RankRow({ rank, entry, isYou, colors }: { rank: number; entry: LeaderEntry; isYou: boolean; colors: any }) {
  const rankColor = rank === 1 ? "#FFD700" : rank === 2 ? "#C0C0C0" : rank === 3 ? "#CD7F32" : colors.mutedForeground;
  return (
    <View style={[
      rowStyles.row,
      {
        backgroundColor: isYou ? "#E31E2418" : "transparent",
        borderColor: isYou ? "#E31E2444" : colors.border,
        borderRadius: 10,
      },
    ]}>
      <Text style={[rowStyles.rank, { color: rankColor, fontFamily: "Inter_700Bold" }]}>
        {rank}
      </Text>
      <Avatar name={isYou ? "Y" : entry.name} size={36} color={isYou ? "#E31E24" : "#2A2A2A"} />
      <View style={rowStyles.nameWrap}>
        <Text style={[rowStyles.name, { color: isYou ? colors.primary : colors.foreground, fontFamily: isYou ? "Inter_600SemiBold" : "Inter_500Medium" }]} numberOfLines={1}>
          {isYou ? `You (${entry.name})` : entry.name}
        </Text>
        <Text style={[rowStyles.city, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {entry.city}
        </Text>
      </View>
      <Text style={[rowStyles.km, { color: isYou ? colors.primary : colors.accent, fontFamily: "Inter_700Bold" }]}>
        {entry.totalKm.toFixed(1)} KM
      </Text>
    </View>
  );
}

// ─── Overview Screen ──────────────────────────────────────────────────────────

function OverviewScreen({ colors, cityRank, stateRank, indiaRank, onSelectBoard }: {
  colors: any;
  cityRank: number;
  stateRank: number;
  indiaRank: number;
  onSelectBoard: (scope: BoardScope) => void;
}) {
  const boards = [
    { scope: "city" as BoardScope, label: "City Leaderboard", desc: "See top runners in your city", icon: "business-outline" as const, color: "#E31E24" },
    { scope: "state" as BoardScope, label: "State Leaderboard", desc: "See top runners in your state", icon: "map-outline" as const, color: "#C9A227" },
    { scope: "india" as BoardScope, label: "India Leaderboard", desc: "See top runners across India", icon: "earth-outline" as const, color: "#3B82F6" },
  ];

  return (
    <ScrollView contentContainerStyle={ovStyles.scroll} showsVerticalScrollIndicator={false}>
      {/* TROPHY BANNER */}
      <LinearGradient
        colors={["#1a0000", "#0A0A0A"]}
        style={[ovStyles.banner, { borderRadius: 16, borderColor: colors.border }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={ovStyles.trophyWrap}>
          <Text style={ovStyles.trophyEmoji}>🏆</Text>
        </View>
        <View style={ovStyles.bannerText}>
          <Text style={[ovStyles.bannerTitle, { fontFamily: "Inter_700Bold" }]}>
            <Text style={{ color: "#E31E24" }}>COMPETE.</Text>{"\n"}
            <Text style={{ color: "#FFD700" }}>IMPROVE.</Text>{"\n"}
            <Text style={{ color: "#fff" }}>INSPIRE.</Text>
          </Text>
          <Text style={[ovStyles.bannerSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Climb the leaderboard and be the best version of yourself.
          </Text>
        </View>
      </LinearGradient>

      {/* CHOOSE LEADERBOARD */}
      <Text style={[ovStyles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
        CHOOSE LEADERBOARD
      </Text>
      <View style={ovStyles.boardCards}>
        {boards.map((b) => (
          <Pressable
            key={b.scope}
            onPress={() => onSelectBoard(b.scope)}
            style={({ pressed }) => [
              ovStyles.boardCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: 14,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <View style={[ovStyles.boardIcon, { backgroundColor: b.color + "22" }]}>
              <Ionicons name={b.icon} size={22} color={b.color} />
            </View>
            <View style={ovStyles.boardCardText}>
              <Text style={[ovStyles.boardLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                {b.label}
              </Text>
              <Text style={[ovStyles.boardDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {b.desc}
              </Text>
            </View>
            <View style={[ovStyles.arrowWrap, { backgroundColor: b.color + "22" }]}>
              <Ionicons name="chevron-forward" size={18} color={b.color} />
            </View>
          </Pressable>
        ))}
      </View>

      {/* YOUR RANK OVERVIEW */}
      <Text style={[ovStyles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
        YOUR RANK OVERVIEW
      </Text>
      <View style={[ovStyles.rankStrip, { backgroundColor: colors.card, borderRadius: 16, borderColor: colors.border }]}>
        {[
          { label: "City Rank", value: cityRank, sub: "Ahmedabad", color: "#E31E24" },
          { label: "State Rank", value: stateRank, sub: "Gujarat", color: "#C9A227" },
          { label: "India Rank", value: indiaRank, sub: "India", color: "#3B82F6" },
        ].map((r, i) => (
          <React.Fragment key={r.label}>
            <Pressable onPress={() => onSelectBoard(i === 0 ? "city" : i === 1 ? "state" : "india")} style={ovStyles.rankItem}>
              <Text style={[ovStyles.rankVal, { color: r.color, fontFamily: "Inter_700Bold" }]}>#{r.value}</Text>
              <Text style={[ovStyles.rankLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>{r.label}</Text>
              <Text style={[ovStyles.rankSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{r.sub}</Text>
            </Pressable>
            {i < 2 && <View style={[ovStyles.rankDivider, { backgroundColor: colors.border }]} />}
          </React.Fragment>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Board Screen ─────────────────────────────────────────────────────────────

function BoardScreen({ scope: initialScope, colors, user, userKm, onBack }: {
  scope: BoardScope;
  colors: any;
  user: any;
  userKm: number;
  onBack: () => void;
}) {
  const [scope, setScope] = useState<BoardScope>(initialScope);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("This Month");
  const [showFilter, setShowFilter] = useState(false);

  const scopeConf = SCOPE_CONFIG[scope];

  const entries = useMemo<LeaderEntry[]>(() => {
    let base: LeaderEntry[];
    if (scope === "city") {
      base = CITY_MOCK[user?.city || "Ahmedabad"] || CITY_MOCK.Ahmedabad;
    } else if (scope === "state") {
      base = STATE_MOCK[user?.state || "Gujarat"] || STATE_MOCK.Gujarat;
    } else {
      base = INDIA_MOCK;
    }
    return [...base].sort((a, b) => b.totalKm - a.totalKm);
  }, [scope, user]);

  const userKmForScope = userKm > 0 ? userKm : (scope === "city" ? 45.6 : scope === "state" ? 105.3 : 210.6);
  const userRank = entries.filter((e) => e.totalKm > userKmForScope).length + 1;

  const userEntry: LeaderEntry = {
    userId: user?.id || "me",
    name: user?.fullName || "You",
    city: user?.city || "Ahmedabad",
    state: user?.state || "Gujarat",
    totalKm: userKmForScope,
  };

  const bgGrad: [string, string, string] = scope === "city"
    ? ["#1a0a00", "#0d0000", "#0A0A0A"]
    : scope === "state"
    ? ["#1a1000", "#0d0800", "#0A0A0A"]
    : ["#000d1a", "#000508", "#0A0A0A"];

  const SCOPES: BoardScope[] = ["city", "state", "india"];
  const FILTER_OPTS: TimeFilter[] = ["This Week", "This Month", "This Year", "All Time"];

  return (
    <View style={brdStyles.container}>
      {/* BG Gradient */}
      <LinearGradient colors={bgGrad} style={StyleSheet.absoluteFill} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.4 }} />

      {/* SCOPE SCOPE TABS */}
      <View style={brdStyles.scopeTabs}>
        {SCOPES.map((s) => (
          <Pressable
            key={s}
            onPress={() => setScope(s)}
            style={[
              brdStyles.scopeTab,
              {
                backgroundColor: s === scope ? colors.primary : "transparent",
                borderColor: s === scope ? colors.primary : colors.border,
                borderRadius: 6,
              },
            ]}
          >
            <Text style={[
              brdStyles.scopeTabText,
              {
                color: s === scope ? "#fff" : colors.mutedForeground,
                fontFamily: s === scope ? "Inter_700Bold" : "Inter_400Regular",
              },
            ]}>
              {s.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* TITLE + SUBTITLE */}
      <View style={brdStyles.titleWrap}>
        <Text style={[brdStyles.boardTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          {scopeConf.label}
        </Text>
        <View style={brdStyles.locationRow}>
          <Ionicons name="location-outline" size={13} color={colors.primary} />
          <Text style={[brdStyles.locationText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {scopeConf.subtitle(user)}
          </Text>
        </View>
      </View>

      {/* FILTER */}
      <View style={brdStyles.filterWrap}>
        <Pressable
          onPress={() => setShowFilter(!showFilter)}
          style={[brdStyles.filterBtn, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 20 }]}
        >
          <Text style={[brdStyles.filterText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
            {timeFilter}
          </Text>
          <Ionicons name={showFilter ? "chevron-up" : "chevron-down"} size={14} color={colors.mutedForeground} />
        </Pressable>
        {showFilter && (
          <View style={[brdStyles.filterDropdown, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 12 }]}>
            {FILTER_OPTS.map((f) => (
              <Pressable
                key={f}
                onPress={() => { setTimeFilter(f); setShowFilter(false); }}
                style={[brdStyles.filterOption, { borderBottomColor: colors.border }]}
              >
                <Text style={[brdStyles.filterOptionText, { color: f === timeFilter ? colors.primary : colors.foreground, fontFamily: f === timeFilter ? "Inter_600SemiBold" : "Inter_400Regular" }]}>
                  {f}
                </Text>
                {f === timeFilter && <Ionicons name="checkmark" size={16} color={colors.primary} />}
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={brdStyles.scroll}>
        {/* PODIUM TOP 3 */}
        {entries.length >= 3 && <PodiumTop entries={entries.slice(0, 3)} colors={colors} />}

        {/* REMAINING ROWS */}
        <View style={[brdStyles.rankList, { backgroundColor: colors.background }]}>
          {entries.slice(3).map((entry, i) => (
            <RankRow key={entry.userId} rank={i + 4} entry={entry} isYou={false} colors={colors} />
          ))}

          {/* CURRENT USER PINNED */}
          {userRank > entries.length && (
            <>
              <View style={[brdStyles.dotsSep, { borderColor: colors.border }]}>
                <Text style={[brdStyles.dotsText, { color: colors.mutedForeground }]}>· · ·</Text>
              </View>
              <RankRow rank={userRank} entry={userEntry} isYou colors={colors} />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Root Tab Screen ──────────────────────────────────────────────────────────

export default function LeaderboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getActivitiesByUser } = useActivity();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [view, setView] = useState<ViewMode>("overview");
  const [scope, setScope] = useState<BoardScope>("city");

  const userKm = getActivitiesByUser(user?.id ?? "").reduce((s, a) => s + a.distance, 0);

  const cityRank = Math.max(1, 32 - Math.floor(userKm / 2));
  const stateRank = Math.max(1, 45 - Math.floor(userKm / 2));
  const indiaRank = Math.max(1, 112 - Math.floor(userKm / 2));

  const handleSelectBoard = (s: BoardScope) => {
    setScope(s);
    setView("board");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        {view === "board" ? (
          <Pressable onPress={() => setView("overview")} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.foreground} />
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}
        <View style={styles.headerCenter}>
          {view === "overview" ? (
            <Text style={[styles.overviewTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              LEADERBOARD
            </Text>
          ) : (
            <View style={styles.brand}>
              <Text style={[styles.brandName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>DOKRA</Text>
              <Text style={[styles.brandSub, { color: colors.accent, fontFamily: "Inter_600SemiBold" }]}>RUNNING CLUB</Text>
            </View>
          )}
        </View>
        <Pressable style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={22} color={colors.foreground} />
        </Pressable>
      </View>

      {/* CONTENT */}
      {view === "overview" ? (
        <OverviewScreen
          colors={colors}
          cityRank={cityRank}
          stateRank={stateRank}
          indiaRank={indiaRank}
          onSelectBoard={handleSelectBoard}
        />
      ) : (
        <BoardScreen
          scope={scope}
          colors={colors}
          user={user}
          userKm={userKm}
          onBack={() => setView("overview")}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const podStyles = StyleSheet.create({
  wrap: { flexDirection: "row", justifyContent: "center", alignItems: "flex-end", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24, gap: 12 },
  slot: { alignItems: "center", flex: 1, gap: 6 },
  crownBadge: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: -10, zIndex: 1 },
  crownNum: { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" } as any,
  avatarRing: { borderWidth: 2.5, alignItems: "center", justifyContent: "center" },
  podName: { fontSize: 12, textAlign: "center" },
  podKm: { fontSize: 13, textAlign: "center" },
});

const rowStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, gap: 10, borderWidth: 1, marginBottom: 4 },
  rank: { width: 30, fontSize: 14, textAlign: "center" },
  nameWrap: { flex: 1, gap: 2 },
  name: { fontSize: 14 },
  city: { fontSize: 11 },
  km: { fontSize: 14 },
});

const ovStyles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingBottom: 120, gap: 14 },
  banner: { flexDirection: "row", alignItems: "center", padding: 20, gap: 16, borderWidth: 1 },
  trophyWrap: { alignItems: "center", justifyContent: "center" },
  trophyEmoji: { fontSize: 64 },
  bannerText: { flex: 1, gap: 8 },
  bannerTitle: { fontSize: 22, lineHeight: 30 },
  bannerSub: { fontSize: 12, lineHeight: 18 },
  sectionTitle: { fontSize: 11, letterSpacing: 2, marginTop: 4 },
  boardCards: { gap: 10 },
  boardCard: { flexDirection: "row", alignItems: "center", padding: 14, gap: 14, borderWidth: 1 },
  boardIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  boardCardText: { flex: 1, gap: 3 },
  boardLabel: { fontSize: 15 },
  boardDesc: { fontSize: 12 },
  arrowWrap: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  rankStrip: { flexDirection: "row", paddingVertical: 20, borderWidth: 1 },
  rankItem: { flex: 1, alignItems: "center", gap: 4 },
  rankVal: { fontSize: 26 },
  rankLabel: { fontSize: 12 },
  rankSub: { fontSize: 11 },
  rankDivider: { width: 1 },
});

const brdStyles = StyleSheet.create({
  container: { flex: 1 },
  scopeTabs: { flexDirection: "row", justifyContent: "center", gap: 8, paddingHorizontal: 20, paddingTop: 6 },
  scopeTab: { paddingHorizontal: 24, paddingVertical: 8, borderWidth: 1 },
  scopeTabText: { fontSize: 13, letterSpacing: 1 },
  titleWrap: { alignItems: "center", paddingTop: 14, gap: 4 },
  boardTitle: { fontSize: 20, letterSpacing: 1 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationText: { fontSize: 13 },
  filterWrap: { alignItems: "center", paddingTop: 10, zIndex: 10 },
  filterBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  filterText: { fontSize: 13 },
  filterDropdown: { position: "absolute", top: 44, borderWidth: 1, minWidth: 160, overflow: "hidden", zIndex: 20 },
  filterOption: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1 },
  filterOptionText: { fontSize: 14, flex: 1 },
  scroll: { paddingBottom: 100 },
  rankList: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 14 },
  dotsSep: { alignItems: "center", paddingVertical: 8, borderTopWidth: 1, borderBottomWidth: 1, marginBottom: 4 },
  dotsText: { fontSize: 16 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  iconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerCenter: { alignItems: "center", flex: 1 },
  overviewTitle: { fontSize: 20, letterSpacing: 3 },
  brand: { alignItems: "center" },
  brandName: { fontSize: 16, letterSpacing: 2 },
  brandSub: { fontSize: 9, letterSpacing: 3, marginTop: -2 },
});
