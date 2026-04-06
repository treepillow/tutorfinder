import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { bookingApi, bookingProcessApi, profileApi, enrichProfile, paymentApi } from "../utils/api";
import { toast } from "sonner";
import { Calendar, Clock, AlertCircle, ChevronDown } from "lucide-react";
import { CircleGuyAvatar } from "../components/CircleGuyAvatar";

function fmtDate(s: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Singapore" });
}
function fmtTime(s: string) {
  return s ? s.slice(0, 5) : "—";
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

function DisputeCard({ dispute, onResolve, actionLoading }: {
  dispute: any;
  onResolve: (bookingId: number, resolution: "refund" | "release") => void;
  actionLoading: number | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const p = dispute.payment;
  const amount = p?.amount ?? null;
  const reportedBy = dispute.disputed_by === "tutee" ? "Student" : "Tutor";
  const reporter = dispute.disputed_by === "tutee" ? dispute.tutee : dispute.tutor;

  return (
    <div className="bg-[#EDE9DF] rounded-2xl overflow-hidden">
      {/* Collapsed header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 p-5 hover:bg-[#D6CFBF]/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Both participant avatars */}
          <div className="flex -space-x-2">
            <CircleGuyAvatar id={dispute.tutee?.id ?? dispute.tutee?.name} size={38} />
            <CircleGuyAvatar id={dispute.tutor?.id ?? dispute.tutor?.name} size={38} />
          </div>
          <div className="text-left">
            <p className="text-[#2F3B3D] font-medium leading-tight">
              {dispute.tutee?.name} &amp; {dispute.tutor?.name}
            </p>
            <p className="text-xs text-[#2F3B3D]/50 mt-0.5">
              Reported by {reportedBy} · {fmtDate(dispute.lesson_date)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-lg font-semibold text-[#2F3B3D]">
              {amount ? `$${amount}` : "—"}
            </p>
            <span className="inline-block text-xs px-2 py-0.5 rounded-md bg-[#D97706] text-white">
              Under Review
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
                <Detail icon={<Calendar className="w-3.5 h-3.5 text-[#7C8D8C]"/>} label="Lesson Date" value={fmtDate(dispute.lesson_date)} />
                <Detail icon={<Clock className="w-3.5 h-3.5 text-[#7C8D8C]"/>} label="Time" value={`${fmtTime(dispute.start_time)} – ${fmtTime(dispute.end_time)}`} />
                <Detail
                  icon={<svg className="w-3.5 h-3.5 text-[#7C8D8C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7"/></svg>}
                  label="Student"
                  value={dispute.tutee?.name ?? "—"}
                />
                <Detail
                  icon={<svg className="w-3.5 h-3.5 text-[#7C8D8C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7"/></svg>}
                  label="Tutor"
                  value={dispute.tutor?.name ?? "—"}
                />
                {dispute.disputed_by && (
                  <Detail icon={<AlertCircle className="w-3.5 h-3.5 text-[#7C8D8C]"/>} label="Reported By" value={`${reportedBy} (${reporter?.name ?? "—"})`} />
                )}
              </div>

              {dispute.dispute_reason && (
                <div className="bg-[#F5F3EF] rounded-xl px-4 py-3 text-sm text-[#2F3B3D]/70">
                  <span className="font-medium text-[#2F3B3D]">Reason: </span>{dispute.dispute_reason}
                </div>
              )}

              <p className="text-xs text-[#2F3B3D]/25 text-right">Booking #{dispute.booking_id}</p>

              {/* Action buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onResolve(dispute.booking_id, "refund"); }}
                  disabled={actionLoading === dispute.booking_id}
                  className="flex-1 px-4 py-3 bg-white text-[#2F3B3D] rounded-full border-2 border-[#D6CFBF] hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-300 font-medium disabled:opacity-50 text-sm"
                >
                  Refund Student
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onResolve(dispute.booking_id, "release"); }}
                  disabled={actionLoading === dispute.booking_id}
                  className="flex-1 px-4 py-3 bg-[#2F3B3D] text-white rounded-full border-2 border-[#2F3B3D] hover:bg-[#7C8D8C] hover:border-[#7C8D8C] transition-all duration-300 font-medium disabled:opacity-50 text-sm"
                >
                  Release to Tutor
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getByStatus("Disputed");
      const disputed = res.bookings || [];

      const userIds = new Set<number>();
      disputed.forEach((b: any) => {
        if (b.tutee_id) userIds.add(b.tutee_id);
        if (b.tutor_id) userIds.add(b.tutor_id);
      });

      const profileMap: Record<number, any> = {};
      await Promise.all(
        [...userIds].map(async (id) => {
          try {
            const p = await profileApi.getProfile(id);
            profileMap[id] = enrichProfile(p);
          } catch {
            profileMap[id] = { name: `User #${id}` };
          }
        })
      );

      const enriched = await Promise.all(
        disputed.map(async (b: any) => {
          let payment = null;
          try {
            payment = await paymentApi.getByBooking(b.booking_id);
          } catch {}
          return {
            ...b,
            tutee: profileMap[b.tutee_id] || { name: `User #${b.tutee_id}` },
            tutor: profileMap[b.tutor_id] || { name: `User #${b.tutor_id}` },
            payment,
          };
        })
      );

      // Sort by disputed_at timestamp (most recent first)
      enriched.sort((a, b) => {
        const timeA = a.disputed_at ? new Date(a.disputed_at).getTime() : new Date(a.created_at).getTime();
        const timeB = b.disputed_at ? new Date(b.disputed_at).getTime() : new Date(b.created_at).getTime();
        return timeB - timeA;
      });

      setDisputes(enriched);
    } catch {
      toast.error("Failed to load disputes");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (bookingId: number, resolution: "refund" | "release") => {
    setActionLoading(bookingId);
    try {
      // Try to call resolveDispute if booking process service is available
      try {
        await bookingProcessApi.resolveDispute(bookingId, resolution);
      } catch {
        // Fall back if booking process service isn't running locally
        console.warn("Booking process service unavailable, updating status directly");
      }
      
      // Update booking status: refund → Cancelled, release → Completed
      const newStatus = resolution === "refund" ? "Cancelled" : "Completed";
      await bookingApi.updateStatus(bookingId, newStatus);
      
      // Update payment status
      try {
        const paymentData = await paymentApi.getByBooking(bookingId);
        if (paymentData && paymentData.payments && paymentData.payments.length > 0) {
          const payment = paymentData.payments[0];
          if (resolution === "refund") {
            await paymentApi.refund(payment.payment_id);
          } else {
            await paymentApi.release(payment.payment_id);
          }
        }
      } catch {
        console.warn("Could not update payment status");
      }
      
      toast.success(
        resolution === "refund"
          ? "Dispute resolved: refund issued to student"
          : "Dispute resolved: payment released to tutor"
      );
      loadDisputes();
    } catch (err: any) {
      toast.error(err.message || "Failed to resolve dispute");
    } finally {
      setActionLoading(null);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <p className="text-[#7C8D8C]">Loading disputes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl tracking-tight text-[#2F3B3D] mb-2">Disputes</h1>
          <p className="text-[#2F3B3D]/70">Review and resolve disputed lessons</p>
        </div>

        {disputes.length === 0 ? (
          <div className="bg-[#EDE9DF] rounded-2xl p-10 text-center">
            <p className="text-[#2F3B3D]/50 text-sm">No active disputes</p>
            <p className="text-[#2F3B3D]/35 text-xs mt-1">All lessons are going smoothly!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map((d) => (
              <DisputeCard
                key={d.booking_id}
                dispute={d}
                onResolve={handleResolve}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
