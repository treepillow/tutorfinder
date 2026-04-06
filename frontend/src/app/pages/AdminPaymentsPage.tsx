import { useState, useEffect, useRef } from "react";
import { bookingApi, paymentApi, profileApi, enrichProfile } from "../utils/api";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { CircleGuyAvatar } from "../components/CircleGuyAvatar";
import Lottie from "lottie-react";
import circleGuyLoadingData from "../assets/circleGuyLoading.json";

type AdminTab = "held" | "completed" | "disputed" | "cancelled";

// ── Tab icons (same style as user PaymentsPage) ──
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

const TABS: { id: AdminTab; label: string; Icon: React.ComponentType<{ active: boolean }>; border: string; text: string }[] = [
  { id: "held",      label: "Held",             Icon: IconHeld,      border: "border-[#d97706]", text: "Funds held in escrow — lesson confirmed, awaiting completion or dispute resolution." },
  { id: "completed", label: "Completed",         Icon: IconCompleted, border: "border-[#16a34a]", text: "Lessons successfully completed with no issues. Funds released to tutor. Includes disputes resolved in the tutor's favour." },
  { id: "disputed",  label: "Ongoing Disputes",  Icon: IconDisputed,  border: "border-[#ea580c]", text: "Active disputes awaiting admin resolution. Funds remain held." },
  { id: "cancelled", label: "Cancelled",         Icon: IconCancelled, border: "border-[#dc2626]", text: "Cancelled bookings and disputes resolved in the student's favour. Funds refunded." },
];

const STATUS_PILL: Record<string, string> = {
  HELD:     "bg-[#2F3B3D] text-white",
  RELEASED: "bg-[#16A34A] text-white",
  REFUNDED: "bg-[#EF4444] text-white",
  PENDING:  "bg-[#60A5FA] text-white",
  FAILED:   "bg-[#EF4444] text-white",
};

const PAYMENT_STATUS_DISPLAY: Record<string, string> = {
  HELD: "Held",
  RELEASED: "Released",
  REFUNDED: "Refunded",
  PENDING: "Pending",
  FAILED: "Failed",
};

function fmtDateTime(s: string) {
  if (!s) return "—";
  const d = new Date(s.includes("Z") || s.includes("+") ? s : s + "Z");
  return d.toLocaleString("en-SG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Singapore" });
}

function matchesTab(r: any, tab: AdminTab): boolean {
  if (tab === "held")      return r.status === "Confirmed" && !!r.payment;
  if (tab === "completed") return r.status === "Completed" && !!r.payment;
  if (tab === "disputed")  return r.status === "Disputed"  && !!r.payment;
  if (tab === "cancelled") return r.status === "Cancelled" && !!r.payment;
  return false;
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-[#EDE9DF] rounded-2xl p-6">
      <p className="text-xs text-[#2F3B3D]/40 uppercase tracking-widest mb-3">{label}</p>
      <p className="text-3xl font-semibold text-[#2F3B3D] leading-none">{value}</p>
      {sub && <p className="text-xs text-[#2F3B3D]/40 mt-2">{sub}</p>}
    </div>
  );
}

function PaymentCard({ record }: { record: any }) {
  const [expanded, setExpanded] = useState(false);
  const p = record.payment;
  const fromDispute = !!record.dispute_reason;

  const pillLabel =
    record.status === "Completed" && fromDispute ? "Dispute: Resolved" :
    record.status === "Cancelled" && fromDispute ? "Dispute: Refunded" :
    record.status === "Confirmed" ? "Held" :
    record.status === "Completed" ? "Released" :
    record.status === "Cancelled" ? "Refunded" :
    record.status === "Disputed"  ? "Under Review" :
    record.status;

  const pillClass =
    record.status === "Confirmed" ? "bg-[#2F3B3D] text-white" :
    record.status === "Completed" ? "bg-[#16A34A] text-white" :
    record.status === "Cancelled" ? "bg-[#EF4444] text-white" :
    record.status === "Disputed"  ? "bg-[#D97706] text-white" :
    "bg-[#EDE9DF] text-[#2F3B3D]";

  return (
    <div className="bg-[#EDE9DF] rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#E3DDD3] transition-colors duration-150 text-left"
      >
        <div className="flex -space-x-2 shrink-0">
          <CircleGuyAvatar id={record.tutee_id} size={36} />
          <CircleGuyAvatar id={record.tutor_id} size={36} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#2F3B3D] leading-tight truncate">
            {record.tuteeName}
            <span className="text-[#2F3B3D]/30 mx-1.5">→</span>
            {record.tutorName}
          </p>
          <p className="text-xs text-[#2F3B3D]/40 mt-0.5">Booking #{record.booking_id}</p>
        </div>

        <p className="text-base font-semibold text-[#2F3B3D] shrink-0">
          ${parseFloat(p?.amount || "0").toFixed(2)}
        </p>

        <span className={`text-xs px-3 py-1 rounded-full font-medium shrink-0 ${pillClass}`}>
          {pillLabel}
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
            <div className="px-5 pb-5 pt-3 border-t border-[#D6CFBF]/50 space-y-3">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <Detail label="Payment ID" value={String(p?.payment_id ?? "—")} />
                <Detail label="Created" value={fmtDateTime(p?.created_at)} />
                <Detail label="Last Updated" value={fmtDateTime(p?.updated_at)} />
                {p?.stripe_payment_intent_id && (
                  <Detail label="Stripe Intent" value={p.stripe_payment_intent_id} />
                )}
                {p?.stripe_transfer_id && (
                  <Detail label="Stripe Transfer" value={p.stripe_transfer_id} />
                )}
              </div>
              {record.dispute_reason && (
                <div className="bg-[#F5F3EF] rounded-xl px-4 py-3 text-sm text-[#2F3B3D]/70">
                  <span className="font-medium text-[#2F3B3D]">Dispute reason: </span>{record.dispute_reason}
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
      <p className="text-sm text-[#2F3B3D] break-all">{value}</p>
    </div>
  );
}

export function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>("held");
  const prevTab = useRef<AdminTab>("held");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const statuses = ["AwaitingPayment", "Confirmed", "Completed", "Cancelled", "Disputed"];
      const bookingResults = await Promise.allSettled(statuses.map((s) => bookingApi.getByStatus(s)));
      const allBookings: any[] = bookingResults.flatMap((r) =>
        r.status === "fulfilled" ? (r.value?.bookings || []) : []
      );

      // Attach payment to each booking (booking is primary, like user PaymentsPage)
      const withPayments = await Promise.all(
        allBookings.map(async (b) => {
          let payment: any = null;
          try { payment = await paymentApi.getByBooking(b.booking_id); } catch {}
          return { ...b, payment };
        })
      );
      // Only keep bookings that have a payment
      const rawRecords = withPayments.filter((r) => !!r.payment);

      const ids = [...new Set(rawRecords.flatMap((r: any) => [r.tutee_id, r.tutor_id]))] as number[];
      const profileMap: Record<number, any> = {};
      await Promise.allSettled(
        ids.map(async (id) => {
          try { profileMap[id] = enrichProfile(await profileApi.getProfile(id)); }
          catch { profileMap[id] = { name: `User #${id}` }; }
        })
      );

      const enriched = rawRecords
        .map((r: any) => ({
          ...r,
          tuteeName: profileMap[r.tutee_id]?.name ?? `User #${r.tutee_id}`,
          tutorName: profileMap[r.tutor_id]?.name ?? `User #${r.tutor_id}`,
        }))
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setPayments(enriched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab: AdminTab) => { prevTab.current = activeTab; setActiveTab(tab); };

  const tabPayments = payments.filter((p) => matchesTab(p, activeTab));
  const tabCount = (tab: AdminTab) => payments.filter((p) => matchesTab(p, tab)).length;

  const tabOrder = TABS.map((t) => t.id);
  const direction = tabOrder.indexOf(activeTab) > tabOrder.indexOf(prevTab.current) ? 1 : -1;
  const activeTabInfo = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">

        <div className="mb-8">
          <h1 className="text-4xl tracking-tight text-[#2F3B3D] mb-1">Payments</h1>
          <p className="text-[#2F3B3D]/50">Financial overview across all transactions</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          <SummaryCard label="In Escrow"    value={`$${payments.filter((r) => r.status === "Confirmed").reduce((a, r) => a + parseFloat(r.payment?.amount || "0"), 0).toFixed(2)}`} sub="Currently held" />
          <SummaryCard label="Released"     value={`$${payments.filter((r) => r.status === "Completed").reduce((a, r) => a + parseFloat(r.payment?.amount || "0"), 0).toFixed(2)}`} />
          <SummaryCard label="Refunded"     value={`$${payments.filter((r) => r.status === "Cancelled").reduce((a, r) => a + parseFloat(r.payment?.amount || "0"), 0).toFixed(2)}`} />
          <SummaryCard label="Total Volume" value={`$${payments.reduce((a, r) => a + parseFloat(r.payment?.amount || "0"), 0).toFixed(2)}`} sub="All time" />
        </div>

        {/* Tabs — sliding pill style matching user PaymentsPage */}
        <div className="relative flex p-1.5 bg-[#EDE9DF] rounded-2xl mb-3">
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
        <div className={`border-l-2 pl-3 mb-6 ${activeTabInfo.border}`}>
          <p className="text-xs text-[#2F3B3D]/50">{activeTabInfo.text}</p>
        </div>

        {/* Cards */}
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
                className="space-y-3"
              >
                {tabPayments.length === 0 ? (
                  <div className="bg-[#EDE9DF] rounded-2xl p-12 text-center">
                    <p className="text-[#2F3B3D]/40 text-sm">No payments found</p>
                  </div>
                ) : (
                  tabPayments.map((r) => <PaymentCard key={r.booking_id} record={r} />)
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
