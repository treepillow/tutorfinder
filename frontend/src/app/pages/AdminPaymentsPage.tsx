import { useState, useEffect } from "react";
import { bookingApi, paymentApi, profileApi, enrichProfile } from "../utils/api";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { CircleGuyAvatar } from "../components/CircleGuyAvatar";
import Lottie from "lottie-react";
import circleGuyLoadingData from "../assets/circleGuyLoading.json";

type PaymentStatusFilter = "All" | "HELD" | "RELEASED" | "REFUNDED" | "PENDING";

const STATUS_PILL: Record<string, string> = {
  HELD:     "bg-[#2F3B3D] text-white",
  RELEASED: "bg-[#16A34A] text-white",
  REFUNDED: "bg-[#EF4444] text-white",
  PENDING:  "bg-[#60A5FA] text-white",
  FAILED:   "bg-[#EF4444] text-white",
};

const PAYMENT_STATUS_INFO: Record<PaymentStatusFilter, { border: string; text: string }> = {
  All: {
    border: "border-[#2F3B3D]",
    text: "All payment transactions.",
  },
  HELD: {
    border: "border-[#2F3B3D]",
    text: "Funds held in escrow — waiting for lesson completion or dispute resolution.",
  },
  RELEASED: {
    border: "border-[#16A34A]",
    text: "Lesson completed successfully, no disputes — funds sent to tutor.",
  },
  REFUNDED: {
    border: "border-[#EF4444]",
    text: "Booking cancelled or student won dispute — funds refunded to student.",
  },
  PENDING: {
    border: "border-[#60A5FA]",
    text: "Payment awaiting processing, confirmation, or admin review.",
  },
};

function fmtDateTime(s: string) {
  if (!s) return "—";
  return new Date(s).toLocaleString("en-SG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Singapore" });
}

const TAB_LABELS: Record<PaymentStatusFilter, string> = {
  All: "All",
  HELD: "Held",
  RELEASED: "Released",
  REFUNDED: "Refunded",
  PENDING: "Pending",
};

const PAYMENT_STATUS_DISPLAY: Record<string, string> = {
  HELD: "Held",
  RELEASED: "Released",
  REFUNDED: "Refunded",
  PENDING: "Pending",
  FAILED: "Failed",
};

function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-[#EDE9DF] rounded-2xl p-6">
      <p className="text-xs text-[#2F3B3D]/40 uppercase tracking-widest mb-3">{label}</p>
      <p className="text-3xl font-semibold text-[#2F3B3D] leading-none">{value}</p>
      {sub && <p className="text-xs text-[#2F3B3D]/40 mt-2">{sub}</p>}
    </div>
  );
}

function PaymentCard({ payment }: { payment: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[#EDE9DF] rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#E3DDD3] transition-colors duration-150 text-left"
      >
        {/* Avatars */}
        <div className="flex -space-x-2 shrink-0">
          <CircleGuyAvatar id={payment.tutee_id} size={36} />
          <CircleGuyAvatar id={payment.tutor_id} size={36} />
        </div>

        {/* Names */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#2F3B3D] leading-tight truncate">
            {payment.tuteeName}
            <span className="text-[#2F3B3D]/30 mx-1.5">→</span>
            {payment.tutorName}
          </p>
          <p className="text-xs text-[#2F3B3D]/40 mt-0.5">Booking #{payment.booking_id}</p>
        </div>

        {/* Amount */}
        <p className="text-base font-semibold text-[#2F3B3D] shrink-0">
          ${parseFloat(payment.amount).toFixed(2)}
        </p>

        {/* Status pill */}
        {(() => {
          const fromDispute = !!payment._booking?.dispute_reason;
          const label =
            payment.status === "RELEASED" && fromDispute ? "Dispute: Resolved" :
            payment.status === "REFUNDED" && fromDispute ? "Dispute: Refunded" :
            (PAYMENT_STATUS_DISPLAY[payment.status] ?? payment.status);
          return (
            <span className={`text-xs px-3 py-1 rounded-full font-medium shrink-0 ${STATUS_PILL[payment.status] ?? "bg-[#EDE9DF] text-[#2F3B3D]"}`}>
              {label}
            </span>
          );
        })()}

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
                <Detail label="Payment ID" value={String(payment.payment_id)} />
                <Detail label="Created" value={fmtDateTime(payment.created_at)} />
                <Detail label="Last Updated" value={fmtDateTime(payment.updated_at)} />
                {payment.stripe_payment_intent_id && (
                  <Detail label="Stripe Intent" value={payment.stripe_payment_intent_id} />
                )}
                {payment.stripe_transfer_id && (
                  <Detail label="Stripe Transfer" value={payment.stripe_transfer_id} />
                )}
              </div>
              {payment._booking?.dispute_reason && (
                <div className="bg-[#F5F3EF] rounded-xl px-4 py-3 text-sm text-[#2F3B3D]/70">
                  <span className="font-medium text-[#2F3B3D]">Dispute reason: </span>{payment._booking.dispute_reason}
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
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>("All");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const statuses = ["AwaitingPayment", "Confirmed", "Completed", "Cancelled", "Disputed"];
      const bookingResults = await Promise.allSettled(statuses.map((s) => bookingApi.getByStatus(s)));
      const allBookings: any[] = bookingResults.flatMap((r) =>
        r.status === "fulfilled" ? (r.value?.bookings || []) : []
      );

      const paymentResults = await Promise.allSettled(
        allBookings.map((b) => paymentApi.getByBooking(b.booking_id))
      );
      const rawPayments = paymentResults
        .map((r, i) => r.status === "fulfilled" ? { ...r.value, _booking: allBookings[i] } : null)
        .filter(Boolean);

      const ids = [...new Set(rawPayments.flatMap((p: any) => [p.tutee_id, p.tutor_id]))] as number[];
      const profileMap: Record<number, any> = {};
      await Promise.allSettled(
        ids.map(async (id) => {
          try { profileMap[id] = enrichProfile(await profileApi.getProfile(id)); }
          catch { profileMap[id] = { name: `User #${id}` }; }
        })
      );

      const enriched = rawPayments
        .map((p: any) => ({
          ...p,
          tuteeName: profileMap[p.tutee_id]?.name ?? `User #${p.tutee_id}`,
          tutorName: profileMap[p.tutor_id]?.name ?? `User #${p.tutor_id}`,
        }))
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setPayments(enriched);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sum = (s: string) =>
    payments.filter((p) => p.status === s).reduce((a, p) => a + parseFloat(p.amount || "0"), 0);

  const filtered = statusFilter === "All" ? payments : payments.filter((p) => p.status === statusFilter);
  const tabs: PaymentStatusFilter[] = ["All", "HELD", "RELEASED", "REFUNDED", "PENDING"];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">

        <div className="mb-8">
          <h1 className="text-4xl tracking-tight text-[#2F3B3D] mb-1">Payments</h1>
          <p className="text-[#2F3B3D]/50">Financial overview across all transactions</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          <SummaryCard label="In Escrow" value={`$${sum("HELD").toFixed(2)}`} sub="Currently held" />
          <SummaryCard label="Released" value={`$${sum("RELEASED").toFixed(2)}`} />
          <SummaryCard label="Refunded" value={`$${sum("REFUNDED").toFixed(2)}`} />
          <SummaryCard
            label="Total Volume"
            value={`$${payments.reduce((a, p) => a + parseFloat(p.amount || "0"), 0).toFixed(2)}`}
            sub="All time"
          />
        </div>

        {/* Filter tabs — same pill style as bookings */}
        <div className="flex p-1.5 bg-[#EDE9DF] rounded-2xl mb-3 gap-1">
          {tabs.map((t) => {
            const count = t === "All" ? payments.length : payments.filter((p) => p.status === t).length;
            const isActive = statusFilter === t;
            return (
              <button
                key={t}
                onClick={() => setStatusFilter(t)}
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  isActive ? "bg-[#2F3B3D] text-white" : "text-[#2F3B3D]/50 hover:text-[#2F3B3D]"
                }`}
              >
                {TAB_LABELS[t]}
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

        {/* Tab info */}
        <div className={`border-l-2 pl-3 mb-6 ${PAYMENT_STATUS_INFO[statusFilter].border}`}>
          <p className="text-xs text-[#2F3B3D]/50">{PAYMENT_STATUS_INFO[statusFilter].text}</p>
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="bg-[#EDE9DF] rounded-2xl p-12 text-center">
            <p className="text-[#2F3B3D]/40 text-sm">No payments found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => <PaymentCard key={p.payment_id} payment={p} />)}
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
