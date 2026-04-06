import { useState, useEffect } from "react";
import { bookingApi, profileApi, enrichProfile } from "../utils/api";
import { ChevronDown, Calendar, Clock } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { CircleGuyAvatar } from "../components/CircleGuyAvatar";
import Lottie from "lottie-react";
import circleGuyLoadingData from "../assets/circleGuyLoading.json";

type StatusFilter = "All" | "Confirmed" | "Completed" | "Cancelled" | "Disputed" | "AwaitingPayment";

const STATUS_PILL: Record<string, string> = {
  Confirmed:       "bg-[#2F3B3D] text-white",
  Completed:       "bg-[#16A34A] text-white",
  Cancelled:       "bg-[#EF4444] text-white",
  Disputed:        "bg-[#D97706] text-white",
  AwaitingPayment: "bg-[#60A5FA] text-white",
};

const STATUS_PILL_CLASS = "inline-block text-xs px-2 py-0.5 rounded-md";

const STATUS_LABEL: Record<string, string> = {
  AwaitingPayment: "Awaiting Payment",
};

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-SG", { 
    day: "numeric", 
    month: "short", 
    year: "numeric",
    timeZone: "Asia/Singapore"
  });
}
function fmtTime(s: string) { return s ? s.slice(0, 5) : "—"; }

function getStatusTimestamp(booking: any): string {
  if (booking.status === "Completed" && booking.completed_at) {
    return new Date(booking.completed_at).toLocaleString("en-SG", { 
      timeZone: "Asia/Singapore",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
  }
  if (booking.status === "Cancelled" && booking.cancelled_at) {
    return new Date(booking.cancelled_at).toLocaleString("en-SG", { 
      timeZone: "Asia/Singapore",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
  }
  if (booking.status === "Disputed" && booking.disputed_at) {
    return new Date(booking.disputed_at).toLocaleString("en-SG", { 
      timeZone: "Asia/Singapore",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
  }
  if ((booking.status === "Confirmed" || booking.status === "AwaitingPayment") && booking.confirmed_at) {
    return new Date(booking.confirmed_at).toLocaleString("en-SG", { 
      timeZone: "Asia/Singapore",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
  }
  if (booking.status === "AwaitingConfirmation" && booking.created_at) {
    return new Date(booking.created_at).toLocaleString("en-SG", { 
      timeZone: "Asia/Singapore",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
  }
  return "—";
}

function BookingCard({ booking }: { booking: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[#EDE9DF] rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#E3DDD3] transition-colors duration-150 text-left"
      >
        {/* Avatars */}
        <div className="flex -space-x-2 shrink-0">
          <CircleGuyAvatar id={booking.tutor_id} size={36} />
          <CircleGuyAvatar id={booking.tutee_id} size={36} />
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#2F3B3D] leading-tight truncate">
            {booking.tutorName}
            <span className="text-[#2F3B3D]/30 mx-1.5">·</span>
            {booking.tuteeName}
          </p>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-[#2F3B3D]/40">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {fmtDate(booking.lesson_date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {fmtTime(booking.start_time)}–{fmtTime(booking.end_time)}
            </span>
          </div>
        </div>

        {/* Status pill */}
        <span className={`${STATUS_PILL_CLASS} shrink-0 ${STATUS_PILL[booking.status] ?? "bg-[#EDE9DF] text-[#2F3B3D]"}`}>
          {STATUS_LABEL[booking.status] ?? booking.status}
        </span>

        <ChevronDown className={`w-4 h-4 text-[#2F3B3D]/30 shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-3 border-t border-[#D6CFBF]/50 grid grid-cols-2 gap-x-6 gap-y-3">
              <Detail label="Booking ID" value={`#${booking.booking_id}`} />
              <Detail label="Tutor ID" value={String(booking.tutor_id)} />
              <Detail label="Student ID" value={String(booking.tutee_id)} />
              <Detail label={`${booking.status} At`} value={getStatusTimestamp(booking)} />
              {booking.dispute_reason && (
                <div className="col-span-2 bg-[#F5F3EF] rounded-xl px-4 py-3">
                  <p className="text-xs text-[#2F3B3D]/40 mb-1">Dispute reason</p>
                  <p className="text-sm text-[#2F3B3D]">{booking.dispute_reason}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#2F3B3D]/40 mb-0.5">{label}</p>
      <p className="text-sm text-[#2F3B3D]">{value}</p>
    </div>
  );
}

// ── Helper: Get sort timestamp based on booking status ──────────────────────
function getSortTimestamp(booking: any): number {
  if (booking.completed_at) return new Date(booking.completed_at).getTime();
  if (booking.cancelled_at) return new Date(booking.cancelled_at).getTime();
  if (booking.disputed_at) return new Date(booking.disputed_at).getTime();
  if (booking.confirmed_at) return new Date(booking.confirmed_at).getTime();
  if (booking.created_at) return new Date(booking.created_at).getTime();
  if (booking.lesson_date) return new Date(booking.lesson_date).getTime();
  return 0;
}

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const statuses = ["AwaitingPayment", "Confirmed", "Completed", "Cancelled", "Disputed"];
      const results = await Promise.allSettled(statuses.map((s) => bookingApi.getByStatus(s)));
      const all: any[] = results.flatMap((r) =>
        r.status === "fulfilled" ? (r.value?.bookings || []) : []
      );

      const ids = [...new Set(all.flatMap((b) => [b.tutor_id, b.tutee_id]))] as number[];
      const profileMap: Record<number, any> = {};
      await Promise.allSettled(
        ids.map(async (id) => {
          try { profileMap[id] = enrichProfile(await profileApi.getProfile(id)); }
          catch { profileMap[id] = { name: `User #${id}` }; }
        })
      );

      const enriched = all
        .map((b) => ({
          ...b,
          tutorName: profileMap[b.tutor_id]?.name ?? `User #${b.tutor_id}`,
          tuteeName: profileMap[b.tutee_id]?.name ?? `User #${b.tutee_id}`,
        }))
        .sort((a, b) => {
          // Sort by most relevant status timestamp (most recent first)
          return getSortTimestamp(b) - getSortTimestamp(a);
        });

      setBookings(enriched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs: StatusFilter[] = ["All", "Confirmed", "Completed", "Cancelled", "Disputed", "AwaitingPayment"];
  const filtered = statusFilter === "All" ? bookings : bookings.filter((b) => b.status === statusFilter);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">

        <div className="mb-8">
          <h1 className="text-4xl tracking-tight text-[#2F3B3D] mb-1">Bookings</h1>
          <p className="text-[#2F3B3D]/50">{bookings.length} total across all statuses</p>
        </div>

        {/* Status tabs */}
        <div className="flex p-1.5 bg-[#EDE9DF] rounded-2xl mb-6 gap-1 flex-wrap">
          {tabs.map((t) => {
            const count = t === "All" ? bookings.length : bookings.filter((b) => b.status === t).length;
            const isActive = statusFilter === t;
            return (
              <button
                key={t}
                onClick={() => setStatusFilter(t)}
                className={`flex-1 min-w-fit px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive ? "bg-[#2F3B3D] text-white" : "text-[#2F3B3D]/50 hover:text-[#2F3B3D]"
                }`}
              >
                {STATUS_LABEL[t] ?? t}
                {count > 0 && (
                  <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-[#D6CFBF] text-[#2F3B3D]/60"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="bg-[#EDE9DF] rounded-2xl p-12 text-center">
            <p className="text-[#2F3B3D]/40 text-sm">No bookings found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((b) => <BookingCard key={b.booking_id} booking={b} />)}
          </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm bg-white/30">
          <Lottie animationData={circleGuyLoadingData} loop autoplay style={{ width: 500, height: 500, transform: "translateY(-80px)" }} />
        </div>
      )}
    </div>
  );
}
