import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export type DeviceType = "apple_watch" | "samsung_watch" | "wear_os" | "garmin" | "fitbit" | "amazfit" | "noise" | "fire_boltt";
export type SyncStatus = "idle" | "syncing" | "success" | "error";

export interface WearableDevice {
  id: DeviceType;
  name: string;
  manufacturer: string;
  model: string;
  connected: boolean;
  batteryLevel: number;
  lastSync: string | null;
  heartRate: number | null;
  platform: "ios" | "android" | "both";
}

interface HealthRecord {
  date: string;
  steps: number;
  distance: number;
  calories: number;
  avgHeartRate: number;
  maxHeartRate: number;
  activeMinutes: number;
}

interface WearableContextType {
  devices: WearableDevice[];
  connectedDevice: WearableDevice | null;
  liveHeartRate: number | null;
  syncStatus: SyncStatus;
  lastSyncTime: string | null;
  healthToday: HealthRecord | null;
  connectDevice: (id: DeviceType) => Promise<void>;
  disconnectDevice: (id: DeviceType) => Promise<void>;
  syncNow: () => Promise<void>;
  startLiveHeartRate: (actType: string) => void;
  stopLiveHeartRate: () => void;
}

const WearableContext = createContext<WearableContextType | undefined>(undefined);

const DEVICE_CATALOG: WearableDevice[] = [
  { id: "apple_watch", name: "Apple Watch Series 9", manufacturer: "Apple", model: "Series 9", connected: false, batteryLevel: 78, lastSync: null, heartRate: null, platform: "ios" },
  { id: "samsung_watch", name: "Samsung Galaxy Watch 6", manufacturer: "Samsung", model: "Galaxy Watch 6", connected: false, batteryLevel: 65, lastSync: null, heartRate: null, platform: "android" },
  { id: "wear_os", name: "Wear OS Watch", manufacturer: "Google", model: "Pixel Watch 2", connected: false, batteryLevel: 82, lastSync: null, heartRate: null, platform: "android" },
  { id: "garmin", name: "Garmin Forerunner 265", manufacturer: "Garmin", model: "Forerunner 265", connected: false, batteryLevel: 91, lastSync: null, heartRate: null, platform: "both" },
  { id: "fitbit", name: "Fitbit Charge 6", manufacturer: "Google", model: "Charge 6", connected: false, batteryLevel: 55, lastSync: null, heartRate: null, platform: "both" },
  { id: "amazfit", name: "Amazfit GTR 4", manufacturer: "Zepp Health", model: "GTR 4", connected: false, batteryLevel: 73, lastSync: null, heartRate: null, platform: "both" },
  { id: "noise", name: "Noise ColorFit Ultra 3", manufacturer: "Noise", model: "ColorFit Ultra 3", connected: false, batteryLevel: 68, lastSync: null, heartRate: null, platform: "android" },
  { id: "fire_boltt", name: "Fire-Boltt Gladiator", manufacturer: "Fire-Boltt", model: "Gladiator", connected: false, batteryLevel: 44, lastSync: null, heartRate: null, platform: "android" },
];

const STORAGE_KEY = "@dokra_wearable";

const BPM_BASE: Record<string, number> = {
  running: 155,
  walking: 108,
  cycling: 140,
};

export function WearableProvider({ children }: { children: React.ReactNode }) {
  const [devices, setDevices] = useState<WearableDevice[]>(DEVICE_CATALOG);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [liveHeartRate, setLiveHeartRate] = useState<number | null>(null);
  const [healthToday, setHealthToday] = useState<HealthRecord | null>(null);
  const hrIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const connectedDevice = devices.find((d) => d.connected) ?? null;

  useEffect(() => {
    loadPersistedState();
  }, []);

  const loadPersistedState = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setDevices((prev) =>
          prev.map((d) => {
            const s = parsed.devices?.find((sd: WearableDevice) => sd.id === d.id);
            return s ? { ...d, connected: s.connected, batteryLevel: s.batteryLevel, lastSync: s.lastSync } : d;
          })
        );
        if (parsed.lastSyncTime) setLastSyncTime(parsed.lastSyncTime);
        if (parsed.healthToday) setHealthToday(parsed.healthToday);
      }
    } catch (_) {}
  };

  const persist = async (updatedDevices: WearableDevice[], syncTime?: string, health?: HealthRecord | null) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          devices: updatedDevices.map((d) => ({ id: d.id, connected: d.connected, batteryLevel: d.batteryLevel, lastSync: d.lastSync })),
          lastSyncTime: syncTime ?? lastSyncTime,
          healthToday: health ?? healthToday,
        })
      );
    } catch (_) {}
  };

  const connectDevice = useCallback(async (id: DeviceType) => {
    const now = new Date().toISOString();
    const updated = devices.map((d) => ({
      ...d,
      connected: d.id === id,
      lastSync: d.id === id ? now : d.lastSync,
    }));
    setDevices(updated);
    await persist(updated);
    await syncNow(updated);
  }, [devices]);

  const disconnectDevice = useCallback(async (id: DeviceType) => {
    const updated = devices.map((d) => ({
      ...d,
      connected: d.id === id ? false : d.connected,
    }));
    setDevices(updated);
    setLiveHeartRate(null);
    await persist(updated);
  }, [devices]);

  const syncNow = useCallback(async (devList?: WearableDevice[]) => {
    const list = devList ?? devices;
    const active = list.find((d) => d.connected);
    if (!active) return;
    setSyncStatus("syncing");
    await new Promise((r) => setTimeout(r, 1200));
    const now = new Date().toISOString();
    const health: HealthRecord = {
      date: now,
      steps: 7843 + Math.floor(Math.random() * 2000),
      distance: parseFloat((5.2 + Math.random() * 2).toFixed(2)),
      calories: 420 + Math.floor(Math.random() * 150),
      avgHeartRate: 72 + Math.floor(Math.random() * 20),
      maxHeartRate: 142 + Math.floor(Math.random() * 30),
      activeMinutes: 42 + Math.floor(Math.random() * 20),
    };
    const updated = list.map((d) => ({
      ...d,
      lastSync: d.id === active.id ? now : d.lastSync,
      heartRate: d.id === active.id ? (68 + Math.floor(Math.random() * 20)) : d.heartRate,
      batteryLevel: d.id === active.id ? Math.max(active.batteryLevel - 1, 1) : d.batteryLevel,
    }));
    setDevices(updated);
    setHealthToday(health);
    setLastSyncTime(now);
    setSyncStatus("success");
    await persist(updated, now, health);
    setTimeout(() => setSyncStatus("idle"), 2000);
  }, [devices]);

  const startLiveHeartRate = useCallback((actType: string) => {
    if (!connectedDevice) return;
    const base = BPM_BASE[actType] ?? 140;
    setLiveHeartRate(base - 10 + Math.floor(Math.random() * 6));
    hrIntervalRef.current = setInterval(() => {
      setLiveHeartRate((prev) => {
        if (!prev) return base;
        const delta = Math.floor(Math.random() * 7) - 3;
        return Math.max(base - 15, Math.min(base + 20, prev + delta));
      });
    }, 3000);
  }, [connectedDevice]);

  const stopLiveHeartRate = useCallback(() => {
    if (hrIntervalRef.current) {
      clearInterval(hrIntervalRef.current);
      hrIntervalRef.current = null;
    }
    setLiveHeartRate(null);
  }, []);

  return (
    <WearableContext.Provider
      value={{
        devices,
        connectedDevice,
        liveHeartRate,
        syncStatus,
        lastSyncTime,
        healthToday,
        connectDevice,
        disconnectDevice,
        syncNow: () => syncNow(),
        startLiveHeartRate,
        stopLiveHeartRate,
      }}
    >
      {children}
    </WearableContext.Provider>
  );
}

export function useWearable() {
  const ctx = useContext(WearableContext);
  if (!ctx) throw new Error("useWearable must be inside WearableProvider");
  return ctx;
}
