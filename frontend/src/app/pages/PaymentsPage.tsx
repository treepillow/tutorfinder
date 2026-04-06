import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { getCurrentUser, bookingApi, paymentApi, profileApi, enrichProfile } from "../utils/api";
import { toast } from "sonner";
import { Calendar, Clock, CheckCircle, AlertCircle, XCircle, ChevronDown } from "lucide-react";
import Lottie from "lottie-react";
import circleGuyLoadingData from "../assets/circleGuyLoading.json";
import { CircleGuyAvatar } from "../components/CircleGuyAvatar";

// ── Tab icons ────────────────────────────────────────────────────────────────
function IconHeld({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill={active ? "#d97706" : "none"} stroke={active ? "#d97706" : "currentColor"} strokeWidth="2"/>
      <path d="M12 7v5l3 3" stroke={active ? "white" : "currentColor"} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
function IconCompleted({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill={active ? "#16a34a" : "none"} stroke={active ? "#16a34a" : "currentColor"} strokeWidth="2"/>
      <path d="M8 12l3 3 5-5" stroke={active ? "white" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconDisputed({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill={active ? "#ea580c" : "none"} stroke={active ? "#ea580c" : "currentColor"} strokeWidth="2"/>
      <path d="M12 8v5" stroke={active ? "white" : "currentColor"} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="16" r="1" fill={active ? "white" : "currentColor"}/>
    </svg>
  );
}
function IconCancelled({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill={active ? "#dc2626" : "none"} stroke={active ? "#dc2626" : "currentColor"} strokeWidth="2"/>
      <path d="M9 9l6 6M15 9l-6 6" stroke={active ? "white" : "currentColor"} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

// ── Types & constants ─────────────────────────────────────────────────────────
type Tab = "held" | "completed" | "disputed" | "cancelled";

const TABS: { id: Tab; label: string; bookingStatuses: string[]; Icon: any }[] = [
  { id: "held",      label: "Held",      bookingStatuses: ["Confirmed"],   Icon: IconHeld },
  { id: "completed", label: "Completed", bookingStatuses: ["Completed"],   Icon: IconCompleted },
  { id: "disputed",  label: "Disputed",  bookingStatuses: ["Disputed"],    Icon: IconDisputed },
  { id: "cancelled", label: "Cancelled", bookingStatuses: ["Cancelled"],   Icon: IconCancelled },
];

const TAB_INFO: Record<Tab, { border: string; text: string }> = {
  held: {
    border: "border-[#7C8D8C]",
    text: "Lesson is confirmed and payment is securely held in escrow. Funds are released to the tutor only after the lesson is completed with no disputes.",
  },
  completed: {
    border: "border-[#7C8D8C]",
    text: "Lesson has been marked complete and funds released to the tutor. Includes lessons that concluded normally and disputes resolved in the tutor's favour.",
  },
  disputed: {
    border: "border-[#D6CFBF]",
    text: "A no-show or issue was reported for this lesson. Payment remains held while admin reviews the dispute — resolution will move it to Completed or Cancelled.",
  },
  cancelled: {
    border: "border-[#D6CFBF]",
    text: "Lesson was cancelled after payment was made. The student's payment has been refunded. Includes bookings cancelled by either party and disputes resolved in the student's favour.",
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(s: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Singapore" });
}
function fmtDateTime(s: string) {
  if (!s) return "—";
  return new Date(s).toLocaleString("en-SG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Singapore" });
}
function fmtTime(s: string) {
  return s ? s.slice(0, 5) : "—";
}

// ── Payment card (expandable) ─────────────────────────────────────────────────
function PaymentCard({ record, userType, tab }: { record: any; userType: string; tab: Tab }) {
  const [expanded, setExpanded] = useState(false);
  const p = record.payment;
  const other = record.otherProfile;

  // Completed tab: distinguish normal completion vs dispute resolved
  const completedViaDispute = tab === "completed" && !!record.dispute_reason;
  // Cancelled tab: distinguish dispute refund vs booking cancellation
  const cancelledViaDispute = tab === "cancelled" && !!record.dispute_reason;

  const statusLabel: Record<Tab, string> = {
    held:      "Payment Held",
    completed: completedViaDispute ? "Dispute: Resolved" : "Lesson Complete",
    disputed:  "Under Review",
    cancelled: cancelledViaDispute ? "Dispute: Refunded" : "Refunded",
  };
  const statusPill: Record<Tab, string> = {
    held:      "bg-[#2F3B3D] text-white",
    completed: "bg-[#16A34A] text-white",
    disputed:  "bg-[#D97706] text-white",
    cancelled: "bg-[#EF4444] text-white",
  };

  // Reason note shown in expanded section
  const reasonNote = (() => {
    if (tab === "completed") {
      return completedViaDispute
        ? "Payment released to tutor following dispute resolution."
        : "Lesson completed successfully. Payment released to tutor.";
    }
    if (tab === "cancelled") {
      return cancelledViaDispute
        ? "Dispute resolved in your favour. Payment refunded."
        : "Booking was cancelled. Payment refunded.";
    }
    return null;
  })();

  const amount = p?.amount ?? null;

  return (
    <div className="bg-[#EDE9DF] rounded-2xl overflow-hidden">
      {/* Collapsed header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 p-5 hover:bg-[#D6CFBF]/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <CircleGuyAvatar id={other.id ?? other.name} size={44} />
          <div className="text-left">
            <p className="text-[#2F3B3D] font-medium leading-tight">{other.name}</p>
            <p className="text-xs text-[#2F3B3D]/50 mt-0.5">
              {userType === "student" ? "Tutor" : "Student"} · {fmtDate(record.lesson_date)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-lg font-semibold text-[#2F3B3D]">
              {amount ? `$${amount}` : "—"}
            </p>
            <span className={`inline-block text-xs px-2 py-0.5 rounded-md ${statusPill[tab]}`}>
              {statusLabel[tab]}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-[#2F3B3D]/40 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* Expanded details */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-3 border-t border-[#D6CFBF]/60 pt-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <Detail icon={<Calendar className="w-3.5 h-3.5 text-[#7C8D8C]"/>} label="Lesson Date" value={fmtDate(record.lesson_date)} />
                <Detail icon={<Clock className="w-3.5 h-3.5 text-[#7C8D8C]"/>} label="Time" value={`${fmtTime(record.start_time)} – ${fmtTime(record.end_time)}`} />
                {tab === "held" && p?.updated_at && (
                  <Detail
                    icon={<svg className="w-3.5 h-3.5 text-[#7C8D8C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="14" rx="3"/><path d="M2 10h20"/></svg>}
                    label="Payment Date"
                    value={fmtDateTime(p.updated_at)}
                  />
                )}
                {tab === "completed" && (
                  <Detail icon={<CheckCircle className="w-3.5 h-3.5 text-[#7C8D8C]"/>} label="Released At" value={p?.updated_at ? fmtDateTime(p.updated_at) : "—"} />
                )}
                {tab === "cancelled" && (
                  <Detail
                    icon={<XCircle className="w-3.5 h-3.5 text-[#7C8D8C]"/>}
                    label="Refunded At"
                    value={p?.updated_at ? fmtDateTime(p.updated_at) : "Pending"}
                  />
                )}
                {tab === "disputed" && record.disputed_by && (
                  <Detail icon={<AlertCircle className="w-3.5 h-3.5 text-[#7C8D8C]"/>} label="Reported By" value={record.disputed_by === "tutee" ? "Student" : "Tutor"} />
                )}
              </div>

              {/* Reason note */}
              {reasonNote && (
                <div className="bg-[#F5F3EF] rounded-xl px-4 py-3 text-sm text-[#2F3B3D]/70">
                  <span className="font-medium text-[#2F3B3D]">Reason: </span>{reasonNote}
                </div>
              )}

              {/* Dispute reason for disputed tab */}
              {tab === "disputed" && record.dispute_reason && (
                <div className="bg-[#F5F3EF] rounded-xl px-4 py-3 text-sm text-[#2F3B3D]/70">
                  <span className="font-medium text-[#2F3B3D]">Reason: </span>{record.dispute_reason}
                </div>
              )}

              <p className="text-xs text-[#2F3B3D]/25 text-right">Booking #{record.booking_id}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-[#2F3B3D]/50">{label}</p>
        <p className="text-sm text-[#2F3B3D]">{value}</p>
      </div>
    </div>
  );
}

// ── Helper: Get sort timestamp based on status ──────────────────────────────
function getSortTimestamp(booking: any): number {
  if (booking.completed_at) return new Date(booking.completed_at).getTime();
  if (booking.cancelled_at) return new Date(booking.cancelled_at).getTime();
  if (booking.disputed_at) return new Date(booking.disputed_at).getTime();
  if (booking.confirmed_at) return new Date(booking.confirmed_at).getTime();
  if (booking.created_at) return new Date(booking.created_at).getTime();
  if (booking.lesson_date) return new Date(booking.lesson_date).getTime();
  return 0;
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function PaymentsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>("held");
  const [allRecords, setAllRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const prevTab = useRef<Tab>("held");

  useEffect(() => {
    const user = getCurrentUser();
    if (user) { setCurrentUser(user); loadAll(user); }
  }, []);

  const loadAll = async (user: any) => {
    setLoading(true);
    try {
      const statuses = ["AwaitingPayment", "Confirmed", "Completed", "Cancelled", "Disputed"];
      const results = await Promise.all(
        statuses.map((s) => bookingApi.getByUser(user.id, s).catch(() => ({ bookings: [] })))
      );
      const allBookings: any[] = results.flatMap((r) => r.bookings || []);

      // Deduplicate
      const seen = new Set<number>();
      const unique = allBookings.filter((b) => { if (seen.has(b.booking_id)) return false; seen.add(b.booking_id); return true; });

      // Fetch other profiles
      const otherIds = [...new Set(unique.map((b) => user.userType === "student" ? b.tutor_id : b.tutee_id))] as number[];
      const profileMap: Record<number, any> = {};
      await Promise.all(otherIds.map(async (id) => {
        try { profileMap[id] = enrichProfile(await profileApi.getProfile(id)); }
        catch { profileMap[id] = { id, name: `User #${id}` }; }
      }));

      // Fetch payments
      const enriched = await Promise.all(unique.map(async (booking) => {
        let payment: any = null;
        try { payment = await paymentApi.getByBooking(booking.booking_id); } catch {}
        const otherId = user.userType === "student" ? booking.tutor_id : booking.tutee_id;
        return { ...booking, payment, otherProfile: profileMap[otherId] || { id: otherId, name: `User #${otherId}` } };
      }));

      // Sort newest first by most relevant status timestamp
      enriched.sort((a, b) => getSortTimestamp(b) - getSortTimestamp(a));
      setAllRecords(enriched);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load payment history");
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab: Tab) => { prevTab.current = activeTab; setActiveTab(tab); };

  const tabRecords = allRecords.filter((r) => {
    const inTab = TABS.find((t) => t.id === activeTab)?.bookingStatuses.includes(r.status);
    if (!inTab) return false;
    // Cancelled tab: only show records where payment was already made
    if (activeTab === "cancelled") return !!r.payment;
    return true;
  });

  const tabCount = (tab: Tab) =>
    allRecords.filter((r) => {
      const inTab = TABS.find((t) => t.id === tab)?.bookingStatuses.includes(r.status);
      if (!inTab) return false;
      if (tab === "cancelled") return !!r.payment;
      return true;
    }).length;

  if (!currentUser) return null;

  const tabOrder = TABS.map((t) => t.id);
  const direction = tabOrder.indexOf(activeTab) > tabOrder.indexOf(prevTab.current) ? 1 : -1;

  const info = TAB_INFO[activeTab];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl tracking-tight text-[#2F3B3D] mb-2">Payments</h1>
            <p className="text-[#2F3B3D]/70">
              {currentUser.userType === "student"
                ? "Track your lesson payments and their status"
                : "Track payments you'll receive for completed lessons"}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="relative flex p-1.5 bg-[#EDE9DF] rounded-2xl mb-5">
          {/* Sliding pill */}
          <div
            className="absolute top-1.5 bottom-1.5 bg-[#2F3B3D] rounded-xl shadow transition-all duration-300 ease-in-out"
            style={{
              width: `calc(${100 / TABS.length}% - 6px)`,
              left: `calc(${(TABS.findIndex((t) => t.id === activeTab) / TABS.length) * 100}% + 3px)`,
            }}
          />
          {TABS.map((tab) => {
            const count = tabCount(tab.id);
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`relative z-10 flex-1 py-2.5 rounded-xl text-xs font-medium transition-colors duration-200 flex items-center justify-center gap-1.5 ${
                  isActive ? "text-white" : "text-[#2F3B3D]/50 hover:text-[#2F3B3D]"
                }`}
              >
                <tab.Icon active={isActive} />
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full leading-none ${
                    isActive ? "bg-white/20 text-white" : "bg-[#D6CFBF] text-[#2F3B3D]/60"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab info */}
        <div className={`border-l-2 pl-3 mb-5 ${info.border}`}>
          <p className="text-xs text-[#2F3B3D]/50">{info.text}</p>
        </div>

        {/* Content */}
        {!loading && (
          <div className="overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              <motion.div
                key={activeTab}
                custom={direction}
                initial={{ x: direction * 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction * -50, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="space-y-4"
              >
                {tabRecords.length === 0 ? (
                  <div className="bg-[#EDE9DF] rounded-2xl p-10 text-center">
                    <p className="text-[#2F3B3D]/50 text-sm">No payments here yet</p>
                  </div>
                ) : (
                  tabRecords.map((record) => (
                    <PaymentCard
                      key={record.booking_id}
                      record={record}
                      userType={currentUser.userType}
                      tab={activeTab}
                    />
                  ))
                )}
              </motion.div>
            </AnimatePresence>
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
