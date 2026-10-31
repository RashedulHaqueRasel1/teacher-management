import { useEffect, useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SessionState = {
  /** Staff ID of the signed-in teacher ("TCH-001"), null when signed out. */
  teacherId: string | null;
  signIn: (teacherId: string) => void;
  signOut: () => void;
};

/**
 * Demo teacher session (localStorage).
 * TODO (backend phase): replace with NextAuth — the session carries the teacher's
 * ID and role "teacher", and every API call is scoped to that teacher server-side.
 */
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      teacherId: null,
      signIn: (teacherId) => set({ teacherId }),
      signOut: () => set({ teacherId: null }),
    }),
    { name: "teacher-session-demo", skipHydration: true },
  ),
);

export function useSessionHydrated() {
  const hydrated = useSyncExternalStore(
    (onChange) => useSessionStore.persist.onFinishHydration(onChange),
    () => useSessionStore.persist.hasHydrated(),
    () => false,
  );
  useEffect(() => {
    if (!useSessionStore.persist.hasHydrated()) void useSessionStore.persist.rehydrate();
  }, []);
  return hydrated;
}
