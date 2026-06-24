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
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userClub: string;
  userCity: string;
  userState: string;
  content: string;
  likes: string[];
  comments: Comment[];
  createdAt: string;
  activityDistance?: number;
  activityType?: string;
}

interface CommunityContextType {
  posts: Post[];
  createPost: (post: Omit<Post, "id" | "likes" | "comments" | "createdAt">) => Promise<void>;
  toggleLike: (postId: string, userId: string) => Promise<void>;
  addComment: (postId: string, comment: Omit<Comment, "id" | "createdAt">) => Promise<void>;
  getClubPosts: (clubName: string) => Post[];
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);
const POSTS_KEY = "dokra_posts";

const SEED_POSTS: Post[] = [
  {
    id: "seed1",
    userId: "seed_user_1",
    userName: "Arjun Sharma",
    userClub: "DOKRA Mumbai Running Club",
    userCity: "Mumbai",
    userState: "Maharashtra",
    content: "Completed my first 10K this morning! The feeling is incredible. Keep running! 🏃",
    likes: ["seed_user_2", "seed_user_3"],
    comments: [
      {
        id: "c1",
        userId: "seed_user_2",
        userName: "Priya Patel",
        text: "Amazing achievement! Congratulations!",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    activityDistance: 10.2,
    activityType: "running",
  },
  {
    id: "seed2",
    userId: "seed_user_2",
    userName: "Priya Patel",
    userClub: "DOKRA Bangalore Running Club",
    userCity: "Bangalore",
    userState: "Karnataka",
    content: "Morning run at Cubbon Park. Best way to start the day! Join us every Sunday at 6 AM.",
    likes: ["seed_user_1"],
    comments: [],
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    activityDistance: 5.5,
    activityType: "running",
  },
  {
    id: "seed3",
    userId: "seed_user_3",
    userName: "Rahul Verma",
    userClub: "DOKRA Delhi Running Club",
    userCity: "New Delhi",
    userState: "Delhi",
    content: "Cycling around India Gate this evening. The city looks beautiful at sunset!",
    likes: ["seed_user_1", "seed_user_2"],
    comments: [],
    createdAt: new Date(Date.now() - 28800000).toISOString(),
    activityDistance: 15.3,
    activityType: "cycling",
  },
];

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const stored = await AsyncStorage.getItem(POSTS_KEY);
      if (stored) {
        setPosts(JSON.parse(stored));
      } else {
        setPosts(SEED_POSTS);
        await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(SEED_POSTS));
      }
    } catch (e) {
      console.error("Failed to load posts", e);
      setPosts(SEED_POSTS);
    }
  };

  const savePosts = async (updated: Post[]) => {
    await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(updated));
  };

  const createPost = useCallback(
    async (postData: Omit<Post, "id" | "likes" | "comments" | "createdAt">) => {
      const newPost: Post = {
        ...postData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        likes: [],
        comments: [],
        createdAt: new Date().toISOString(),
      };
      const updated = [newPost, ...posts];
      setPosts(updated);
      await savePosts(updated);
    },
    [posts]
  );

  const toggleLike = useCallback(
    async (postId: string, userId: string) => {
      const updated = posts.map((p) => {
        if (p.id !== postId) return p;
        const hasLiked = p.likes.includes(userId);
        return {
          ...p,
          likes: hasLiked ? p.likes.filter((id) => id !== userId) : [...p.likes, userId],
        };
      });
      setPosts(updated);
      await savePosts(updated);
    },
    [posts]
  );

  const addComment = useCallback(
    async (postId: string, commentData: Omit<Comment, "id" | "createdAt">) => {
      const newComment: Comment = {
        ...commentData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
      };
      const updated = posts.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
      );
      setPosts(updated);
      await savePosts(updated);
    },
    [posts]
  );

  const getClubPosts = useCallback(
    (clubName: string) => posts.filter((p) => p.userClub === clubName),
    [posts]
  );

  return (
    <CommunityContext.Provider value={{ posts, createPost, toggleLike, addComment, getClubPosts }}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error("useCommunity must be used within CommunityProvider");
  return ctx;
}
