import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { matchApi, bookingApi, getCurrentUser } from "../utils/api";

export interface NavCounts {
  matched: number;
  awaitingResponse: number;
  awaitingPayment: number;
  scheduled: number;
  disputes: number;
}

interface NavCountsContextValue {
  counts: NavCounts;
  refresh: () => void;
}

const NavCountsContext = createContext<NavCountsContextValue | null>(null);

export function NavCountsProvider({ children }: { children: React.ReactNode }) {
  const [counts, setCounts] = useState<NavCounts>({
    matched: 0,
    awaitingResponse: 0,
    awaitingPayment: 0,
    scheduled: 0,
    disputes: 0,
  });

  // Use a ref so the interval callback always has the latest version
  const fetchRef = useRef<() => void>(() => {});

  const fetchCounts = useCallback(async () => {
    const user = getCurrentUser();
    if (!user?.user_id) return;
    const isAdmin = user?.role?.toLowerCase() === "admin" || user?.userType === "admin";
    try {
      const [matchesRes, bookingsRes, disputesRes] = await Promise.allSettled([
        matchApi.getMatches(user.user_id),
        bookingApi.getByUser(user.user_id),
        isAdmin ? bookingApi.getByStatus("Disputed") : Promise.resolve(null),
      ]);

      const matches = matchesRes.status === "fulfilled"
        ? (matchesRes.value?.matches ?? matchesRes.value ?? [])
        : [];

      const bookings = bookingsRes.status === "fulfilled"
        ? (bookingsRes.value?.bookings ?? bookingsRes.value ?? [])
        : [];

      const disputedBookings = disputesRes.status === "fulfilled" && disputesRes.value
        ? (disputesRes.value?.bookings ?? [])
        : [];

      setCounts({
        matched: Array.isArray(matches) ? matches.length : 0,
        awaitingResponse: Array.isArray(bookings)
          ? bookings.filter((b: any) => b.status === "AwaitingConfirmation").length
          : 0,
        awaitingPayment: Array.isArray(bookings)
          ? bookings.filter((b: any) => b.status === "AwaitingPayment").length
          : 0,
        scheduled: Array.isArray(bookings)
          ? bookings.filter((b: any) => b.status === "Confirmed").length
          : 0,
        disputes: Array.isArray(disputedBookings) ? disputedBookings.length : 0,
      });
    } catch {
      // silently fail — counts are decorative
    }
  }, []);

  fetchRef.current = fetchCounts;

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(() => fetchRef.current(), 30_000);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  return (
    <NavCountsContext.Provider value={{ counts, refresh: fetchCounts }}>
      {children}
    </NavCountsContext.Provider>
  );
}

export function useNavCounts() {
  const ctx = useContext(NavCountsContext);
  if (!ctx) throw new Error("useNavCounts must be used within NavCountsProvider");
  return ctx.counts;
}

export function useRefreshNavCounts() {
  const ctx = useContext(NavCountsContext);
  if (!ctx) throw new Error("useRefreshNavCounts must be used within NavCountsProvider");
  return ctx.refresh;
}
