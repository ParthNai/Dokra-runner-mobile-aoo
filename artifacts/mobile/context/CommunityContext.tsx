import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  likes: string[];
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userClub: string;
  userCity: string;
  userState: string;
  content: string;
  images: string[];
  likes: string[];
  comments: Comment[];
  createdAt: string;
  activityType?: string;
  activityDistance?: number;
  location?: string;
  visibility: "public" | "members";
}

export interface ClubMember {
  id: string;
  name: string;
  avatar?: string;
  city: string;
  club: string;
  totalKm: number;
  joinedAt: string;
}

export interface ClubEvent {
  id: string;
  title: string;
  subtitle: string;
  city: string;
  club: string;
  date: string;
  time: string;
  location: string;
  description: string;
  highlights: string[];
  going: string[];
  interested: string[];
  bannerColor: string;
  type: string;
}

interface CommunityContextType {
  posts: Post[];
  events: ClubEvent[];
  members: ClubMember[];
  createPost: (post: Omit<Post, "id" | "likes" | "comments" | "createdAt">) => Promise<void>;
  toggleLike: (postId: string, userId: string) => Promise<void>;
  toggleCommentLike: (postId: string, commentId: string, userId: string) => Promise<void>;
  addComment: (postId: string, comment: Omit<Comment, "id" | "createdAt" | "likes">) => Promise<void>;
  getClubPosts: (city: string) => Post[];
  getClubEvents: (city: string) => ClubEvent[];
  getClubMembers: (city: string) => ClubMember[];
  toggleEventGoing: (eventId: string, userId: string) => Promise<void>;
  toggleEventInterested: (eventId: string, userId: string) => Promise<void>;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);
const POSTS_KEY = "dokra_posts_v3";
const EVENTS_KEY = "dokra_events_v2";

const SEED_POSTS: Post[] = [
  {
    id: "seed1",
    userId: "seed_u1",
    userName: "Jay Patel",
    userClub: "DOKRA Ahmedabad Running Club",
    userCity: "Ahmedabad",
    userState: "Gujarat",
    content: "Beautiful morning run with amazing people!\n5K done ✅\n#MorningRun #DokraAhmedabad #Running",
    images: [],
    likes: ["seed_u2", "seed_u3", "seed_u4", "seed_u5"],
    comments: [
      { id: "c1", userId: "seed_u2", userName: "Ravi Joshi", text: "Great pace! Keep going 🔥", likes: ["seed_u1"], createdAt: new Date(Date.now() - 1800000).toISOString() },
      { id: "c2", userId: "seed_u3", userName: "Neha Patel", text: "Awesome team spirit! 👏", likes: [], createdAt: new Date(Date.now() - 2700000).toISOString() },
      { id: "c3", userId: "seed_u4", userName: "Mitul Shah", text: "Next time me too! 🏃", likes: [], createdAt: new Date(Date.now() - 1800000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    activityType: "running",
    activityDistance: 5.0,
    location: "Ahmedabad",
    visibility: "public",
  },
  {
    id: "seed2",
    userId: "seed_u5",
    userName: "Rakesh Sharma",
    userClub: "DOKRA Ahmedabad Running Club",
    userCity: "Ahmedabad",
    userState: "Gujarat",
    content: "Consistency is the key! 🔑\n10K Sunday Run Completed 🏅\n#NoExcuses",
    images: [],
    likes: ["seed_u1", "seed_u6"],
    comments: [],
    createdAt: new Date(Date.now() - 18000000).toISOString(),
    activityType: "running",
    activityDistance: 10.0,
    location: "Ahmedabad",
    visibility: "public",
  },
  {
    id: "seed3",
    userId: "seed_u6",
    userName: "Priya Desai",
    userClub: "DOKRA Mumbai Running Club",
    userCity: "Mumbai",
    userState: "Maharashtra",
    content: "Marine Drive evening walk 🌊 Perfect way to end the day! Who's joining tomorrow? 6 AM sharp ⏰",
    images: [],
    likes: ["seed_u1"],
    comments: [],
    createdAt: new Date(Date.now() - 36000000).toISOString(),
    activityType: "walking",
    activityDistance: 4.5,
    location: "Mumbai",
    visibility: "public",
  },
];

const SEED_EVENTS: ClubEvent[] = [
  {
    id: "evt1",
    title: "DOKRA Sunrise Run",
    subtitle: "DOKRA SUNRISE RUN AHMEDABAD",
    city: "Ahmedabad",
    club: "DOKRA Ahmedabad Running Club",
    date: "25 May 2024, Sunday",
    time: "6:00 AM",
    location: "Sabarmati Riverfront, Ahmedabad",
    description: "Join us for an energizing sunrise run with DOKRA family. Let's run together, grow together and achieve together! All fitness levels welcome.",
    highlights: ["5K Timed Run", "Medal for All Finishers", "Hydration & Refreshments", "Photo Session", "Fun & Fitness"],
    going: ["seed_u1", "seed_u2"],
    interested: ["seed_u3", "seed_u4", "seed_u5"],
    bannerColor: "#E31E24",
    type: "Running Event",
  },
  {
    id: "evt2",
    title: "DOKRA Night Run",
    subtitle: "DOKRA NIGHT RUN AHMEDABAD",
    city: "Ahmedabad",
    club: "DOKRA Ahmedabad Running Club",
    date: "15 June 2024, Saturday",
    time: "7:30 PM",
    location: "ISKCON Temple Road, Ahmedabad",
    description: "Experience the thrill of running under the stars! Our signature night run is back. Glow in the dark bibs provided.",
    highlights: ["10K Night Run", "Glow Bibs for All", "Post-run Dinner", "DJ Night", "Finisher Medal"],
    going: ["seed_u2", "seed_u3"],
    interested: ["seed_u1"],
    bannerColor: "#C9A227",
    type: "Night Run",
  },
  {
    id: "evt3",
    title: "DOKRA Cyclothon",
    subtitle: "DOKRA CYCLOTHON MUMBAI",
    city: "Mumbai",
    club: "DOKRA Mumbai Running Club",
    date: "20 June 2024, Sunday",
    time: "5:30 AM",
    location: "Bandra-Worli Sea Link, Mumbai",
    description: "Pedal through Mumbai's iconic landmarks with DOKRA. A 30KM cycling experience like no other!",
    highlights: ["30K Route", "Breakfast Buffet", "Certificate", "Group Photo", "Safety Crew"],
    going: ["seed_u6"],
    interested: ["seed_u5"],
    bannerColor: "#3B82F6",
    type: "Cycling Event",
  },
];

const SEED_MEMBERS: ClubMember[] = [
  { id: "seed_u1", name: "Jay Patel", city: "Ahmedabad", club: "DOKRA Ahmedabad Running Club", totalKm: 248, joinedAt: "2023-01-15" },
  { id: "seed_u2", name: "Ravi Joshi", city: "Ahmedabad", club: "DOKRA Ahmedabad Running Club", totalKm: 312, joinedAt: "2023-02-20" },
  { id: "seed_u3", name: "Neha Patel", city: "Ahmedabad", club: "DOKRA Ahmedabad Running Club", totalKm: 189, joinedAt: "2023-03-10" },
  { id: "seed_u4", name: "Mitul Shah", city: "Ahmedabad", club: "DOKRA Ahmedabad Running Club", totalKm: 156, joinedAt: "2023-04-05" },
  { id: "seed_u5", name: "Rakesh Sharma", city: "Ahmedabad", club: "DOKRA Ahmedabad Running Club", totalKm: 423, joinedAt: "2023-01-01" },
  { id: "seed_u6", name: "Priya Desai", city: "Mumbai", club: "DOKRA Mumbai Running Club", totalKm: 276, joinedAt: "2023-02-14" },
];

function daysLeft(dateStr: string): number {
  const target = new Date(dateStr.split(",")[0] + " 2024");
  const now = new Date();
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>(SEED_EVENTS);

  useEffect(() => { loadPosts(); loadEvents(); }, []);

  const loadPosts = async () => {
    try {
      const stored = await AsyncStorage.getItem(POSTS_KEY);
      setPosts(stored ? JSON.parse(stored) : SEED_POSTS);
      if (!stored) await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(SEED_POSTS));
    } catch { setPosts(SEED_POSTS); }
  };

  const loadEvents = async () => {
    try {
      const stored = await AsyncStorage.getItem(EVENTS_KEY);
      if (stored) setEvents(JSON.parse(stored));
    } catch {}
  };

  const savePosts = async (p: Post[]) => {
    setPosts(p);
    await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(p));
  };

  const saveEvents = async (e: ClubEvent[]) => {
    setEvents(e);
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(e));
  };

  const createPost = useCallback(async (data: Omit<Post, "id" | "likes" | "comments" | "createdAt">) => {
    const newPost: Post = { ...data, id: Date.now().toString() + Math.random().toString(36).substr(2, 9), likes: [], comments: [], createdAt: new Date().toISOString() };
    await savePosts([newPost, ...posts]);
  }, [posts]);

  const toggleLike = useCallback(async (postId: string, userId: string) => {
    const updated = posts.map((p) => {
      if (p.id !== postId) return p;
      const liked = p.likes.includes(userId);
      return { ...p, likes: liked ? p.likes.filter((id) => id !== userId) : [...p.likes, userId] };
    });
    await savePosts(updated);
  }, [posts]);

  const toggleCommentLike = useCallback(async (postId: string, commentId: string, userId: string) => {
    const updated = posts.map((p) => {
      if (p.id !== postId) return p;
      return {
        ...p, comments: p.comments.map((c) => {
          if (c.id !== commentId) return c;
          const liked = c.likes.includes(userId);
          return { ...c, likes: liked ? c.likes.filter((id) => id !== userId) : [...c.likes, userId] };
        }),
      };
    });
    await savePosts(updated);
  }, [posts]);

  const addComment = useCallback(async (postId: string, data: Omit<Comment, "id" | "createdAt" | "likes">) => {
    const comment: Comment = { ...data, id: Date.now().toString() + Math.random().toString(36).substr(2, 9), likes: [], createdAt: new Date().toISOString() };
    const updated = posts.map((p) => p.id === postId ? { ...p, comments: [...p.comments, comment] } : p);
    await savePosts(updated);
  }, [posts]);

  const getClubPosts = useCallback((city: string) =>
    posts.filter((p) => p.userCity === city || p.visibility === "public"), [posts]);

  const getClubEvents = useCallback((city: string) =>
    events.filter((e) => e.city === city), [events]);

  const getClubMembers = useCallback((city: string) =>
    SEED_MEMBERS.filter((m) => m.city === city), []);

  const toggleEventGoing = useCallback(async (eventId: string, userId: string) => {
    const updated = events.map((e) => {
      if (e.id !== eventId) return e;
      const going = e.going.includes(userId);
      return { ...e, going: going ? e.going.filter((id) => id !== userId) : [...e.going, userId], interested: e.interested.filter((id) => id !== userId) };
    });
    await saveEvents(updated);
  }, [events]);

  const toggleEventInterested = useCallback(async (eventId: string, userId: string) => {
    const updated = events.map((e) => {
      if (e.id !== eventId) return e;
      const interested = e.interested.includes(userId);
      return { ...e, interested: interested ? e.interested.filter((id) => id !== userId) : [...e.interested, userId], going: e.going.filter((id) => id !== userId) };
    });
    await saveEvents(updated);
  }, [events]);

  return (
    <CommunityContext.Provider value={{ posts, events, members: SEED_MEMBERS, createPost, toggleLike, toggleCommentLike, addComment, getClubPosts, getClubEvents, getClubMembers, toggleEventGoing, toggleEventInterested }}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error("useCommunity must be used within CommunityProvider");
  return ctx;
}
