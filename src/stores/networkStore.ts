import { create } from "zustand";

type NetworkState = {
  isOnline: boolean;
  lastOnlineAt?: string;
  lastOfflineAt?: string;
  setOnlineState: (isOnline: boolean) => void;
  initializeNetworkListeners: () => () => void;
};

const readNavigatorOnline = () => (typeof navigator === "undefined" ? true : navigator.onLine);

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: readNavigatorOnline(),
  lastOnlineAt: readNavigatorOnline() ? new Date().toISOString() : undefined,
  lastOfflineAt: readNavigatorOnline() ? undefined : new Date().toISOString(),
  setOnlineState: (isOnline) => {
    set({
      isOnline,
      lastOnlineAt: isOnline ? new Date().toISOString() : undefined,
      lastOfflineAt: isOnline ? undefined : new Date().toISOString(),
    });
  },
  initializeNetworkListeners: () => {
    if (typeof window === "undefined") {
      return () => undefined;
    }

    const handleOnline = () => useNetworkStore.getState().setOnlineState(true);
    const handleOffline = () => useNetworkStore.getState().setOnlineState(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    useNetworkStore.getState().setOnlineState(readNavigatorOnline());

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  },
}));
