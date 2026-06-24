import React, { createContext, useContext, useState, ReactNode } from 'react';
import profilePlaceholder from "@assets/download_1782289661545.png";

export interface UserProfile {
  fullName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth: string;
  gender: string;
  state: string;
  city: string;
  clubName: string;
  profilePhoto: string | null;
  totalDistance: number;
  totalActivities: number;
  totalSteps: number;
}

interface UserContextType {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const defaultProfile: UserProfile = {
  fullName: "Jay Patel",
  email: "jaypatel@gmail.com",
  mobileNumber: "+91 98765 43210",
  dateOfBirth: "12/08/1998",
  gender: "Male",
  state: "Gujarat",
  city: "Ahmedabad",
  clubName: "DOKRA Ahmedabad Running Club",
  profilePhoto: profilePlaceholder,
  totalDistance: 512.6,
  totalActivities: 48,
  totalSteps: 125430,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({
      ...prev,
      ...updates,
      ...(updates.city ? { clubName: `DOKRA ${updates.city} Running Club` } : {})
    }));
  };

  return (
    <UserContext.Provider value={{ profile, setProfile, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
