import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type ActivityType = "running" | "walking" | "cycling";

export interface RoutePoint {
  latitude: number;
  longitude: number;
}

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  distance: number;
  duration: number;
  avgSpeed: number;
  maxSpeed: number;
  calories: number;
  steps: number;
  avgHeartRate: number;
  elevationGain: number;
  date: string;
  route: RoutePoint[];
  clubName: string;
  city: string;
  state: string;
}

interface ActivityContextType {
  activities: Activity[];
  addActivity: (activity: Omit<Activity, "id">) => Promise<Activity>;
  deleteActivity: (id: string) => Promise<void>;
  getActivitiesByUser: (userId: string) => Activity[];
  getAllActivities: () => Activity[];
  getTodayStats: (userId: string) => { steps: number; distance: number; calories: number; activeTime: number };
  getWeeklyData: (userId: string) => { day: string; distance: number }[];
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);
const ACTIVITIES_KEY = "dokra_activities";
const STEPS_PER_KM = 1312;

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => { loadActivities(); }, []);

  const loadActivities = async () => {
    try {
      const stored = await AsyncStorage.getItem(ACTIVITIES_KEY);
      if (stored) setActivities(JSON.parse(stored));
    } catch (e) {
      console.error("Failed to load activities", e);
    }
  };

  const addActivity = useCallback(async (activityData: Omit<Activity, "id">) => {
    const newActivity: Activity = {
      ...activityData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    const updated = [newActivity, ...activities];
    setActivities(updated);
    await AsyncStorage.setItem(ACTIVITIES_KEY, JSON.stringify(updated));
    return newActivity;
  }, [activities]);

  const deleteActivity = useCallback(async (id: string) => {
    const updated = activities.filter((a) => a.id !== id);
    setActivities(updated);
    await AsyncStorage.setItem(ACTIVITIES_KEY, JSON.stringify(updated));
  }, [activities]);

  const getActivitiesByUser = useCallback(
    (userId: string) => activities.filter((a) => a.userId === userId),
    [activities]
  );

  const getAllActivities = useCallback(() => activities, [activities]);

  const getTodayStats = useCallback(
    (userId: string) => {
      const today = new Date().toDateString();
      const todayActivities = activities.filter(
        (a) => a.userId === userId && new Date(a.date).toDateString() === today
      );
      const distance = todayActivities.reduce((sum, a) => sum + a.distance, 0);
      const calories = todayActivities.reduce((sum, a) => sum + a.calories, 0);
      const activeTime = todayActivities.reduce((sum, a) => sum + a.duration, 0);
      const steps = Math.round(distance * STEPS_PER_KM);
      return { steps, distance, calories, activeTime };
    },
    [activities]
  );

  const getWeeklyData = useCallback(
    (userId: string) => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
      monday.setHours(0, 0, 0, 0);

      return DAY_LABELS.map((day, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const dStr = d.toDateString();
        const dist = activities
          .filter((a) => a.userId === userId && new Date(a.date).toDateString() === dStr)
          .reduce((sum, a) => sum + a.distance, 0);
        return { day, distance: dist };
      });
    },
    [activities]
  );

  return (
    <ActivityContext.Provider
      value={{ activities, addActivity, deleteActivity, getActivitiesByUser, getAllActivities, getTodayStats, getWeeklyData }}
    >
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error("useActivity must be used within ActivityProvider");
  return ctx;
}
