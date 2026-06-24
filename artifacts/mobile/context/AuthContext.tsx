import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface User {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  gender: string;
  dateOfBirth: string;
  state: string;
  city: string;
  clubName: string;
  profilePhoto: string | null;
  totalDistance: number;
  totalActivities: number;
  totalSteps: number;
  joinedAt: string;
  isGoogle?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<User, "id" | "totalDistance" | "totalActivities" | "joinedAt">, password: string) => Promise<void>;
  googleLogin: (googleUser: { fullName: string; email: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = "dokra_users";
const CURRENT_USER_KEY = "dokra_current_user";
const PASSWORDS_KEY = "dokra_passwords";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const stored = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load user", e);
    } finally {
      setIsLoading(false);
    }
  };

  const getUsers = async (): Promise<User[]> => {
    const stored = await AsyncStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  };

  const saveUsers = async (users: User[]) => {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  const getPasswords = async (): Promise<Record<string, string>> => {
    const stored = await AsyncStorage.getItem(PASSWORDS_KEY);
    return stored ? JSON.parse(stored) : {};
  };

  const login = useCallback(async (email: string, password: string) => {
    const users = await getUsers();
    const passwords = await getPasswords();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) throw new Error("No account found with this email. Please register first.");
    if (passwords[found.id] !== password) throw new Error("Incorrect password. Please try again.");
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(found));
    setUser(found);
  }, []);

  const register = useCallback(
    async (
      userData: Omit<User, "id" | "totalDistance" | "totalActivities" | "joinedAt">,
      password: string
    ) => {
      const users = await getUsers();
      const existing = users.find(
        (u) => u.email.toLowerCase() === userData.email.toLowerCase()
      );
      if (existing) throw new Error("An account with this email already exists.");
      const newUser: User = {
        ...userData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        totalDistance: 0,
        totalActivities: 0,
        totalSteps: 0,
        joinedAt: new Date().toISOString(),
      };
      const passwords = await getPasswords();
      passwords[newUser.id] = password;
      await AsyncStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));
      users.push(newUser);
      await saveUsers(users);
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      setUser(newUser);
    },
    []
  );

  const googleLogin = useCallback(
    async (googleUser: { fullName: string; email: string }) => {
      const users = await getUsers();
      let found = users.find(
        (u) => u.email.toLowerCase() === googleUser.email.toLowerCase()
      );
      if (!found) {
        found = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          fullName: googleUser.fullName,
          email: googleUser.email,
          mobile: "",
          gender: "",
          dateOfBirth: "",
          state: "",
          city: "",
          clubName: "DOKRA Running Club",
          profilePhoto: null,
          totalDistance: 0,
          totalActivities: 0,
          totalSteps: 0,
          joinedAt: new Date().toISOString(),
          isGoogle: true,
        };
        users.push(found);
        await saveUsers(users);
      }
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(found));
      setUser(found);
    },
    []
  );

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    const users = await getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) users[idx] = updatedUser;
    await saveUsers(users);
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, googleLogin, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
