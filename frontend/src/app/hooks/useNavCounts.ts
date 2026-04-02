import { useState, useEffect } from "react";
import { matchApi, bookingApi, getCurrentUser } from "../utils/api";

export interface NavCounts {
  matched: number;
  awaitingResponse: number;
  awaitingPayment: number;
  scheduled: number;
}

export function useNavCounts() {
  const [counts, setCounts] = useState<NavCounts>({
    matched: 0,
    awaitingResponse: 0,
    awaitingPayment: 0,
    scheduled: 0,
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (!user?.user_id) return;

    async function fetchCounts() {
      try {
        const [matchesRes, bookingsRes] = await Promise.allSettled([
          matchApi.getMatches(user.user_id),
          bookingApi.getByUser(user.user_id),
        ]);

        const matches =
          matchesRes.status === "fulfilled"
            ? (matchesRes.value?.matches ?? matchesRes.value ?? [])
            : [];

        const bookings =
          bookingsRes.status === "fulfilled"
            ? (bookingsRes.value?.bookings ?? bookingsRes.value ?? [])
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
        });
      } catch {
        // silently fail — counts are decorative
      }
    }

    fetchCounts();
    const interval = setInterval(fetchCounts, 30_000);
    return () => clearInterval(interval);
  }, []);

  return counts;
}
