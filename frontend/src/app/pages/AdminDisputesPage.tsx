import { useState, useEffect } from "react";
import { bookingApi, bookingProcessApi, profileApi, enrichProfile, paymentApi } from "../utils/api";
import { toast } from "sonner";

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

      // Enrich with profile data
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

      // Enrich with payment data
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

      setDisputes(enriched);
    } catch (err: any) {
      toast.error("Failed to load disputes");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (bookingId: number, resolution: "refund" | "release") => {
    setActionLoading(bookingId);
    try {
      await bookingProcessApi.resolveDispute(bookingId, resolution);
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
      <div className="flex items-center justify-center h-full">
        <p className="text-[#7C8D8C]">Loading disputes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-[#2F3B3D] mb-6">
        Dispute Management
      </h1>

      {disputes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#7C8D8C] text-lg">No active disputes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <div
              key={d.booking_id}
              className="bg-white rounded-2xl border-2 border-[#D6CFBF] p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-[#2F3B3D]">
                    Booking #{d.booking_id}
                  </h3>
                  <p className="text-sm text-[#7C8D8C] mt-1">
                    {d.lesson_date} &middot; {d.start_time} - {d.end_time}
                  </p>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                  Disputed
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-[#F5F2EB] rounded-xl p-3">
                  <p className="text-xs text-[#7C8D8C]">Student</p>
                  <p className="font-medium text-[#2F3B3D]">{d.tutee?.name}</p>
                </div>
                <div className="bg-[#F5F2EB] rounded-xl p-3">
                  <p className="text-xs text-[#7C8D8C]">Tutor</p>
                  <p className="font-medium text-[#2F3B3D]">{d.tutor?.name}</p>
                </div>
              </div>

              {d.payment && (
                <div className="bg-[#EDE9DF] rounded-xl p-3 mb-4">
                  <p className="text-sm text-[#7C8D8C]">
                    Payment: ${d.payment.amount} &middot; Status: {d.payment.status}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleResolve(d.booking_id, "refund")}
                  disabled={actionLoading === d.booking_id}
                  className="flex-1 px-4 py-2 bg-white text-[#2F3B3D] rounded-full border-2 border-[#D6CFBF] hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-300 disabled:opacity-50"
                >
                  Refund Student
                </button>
                <button
                  onClick={() => handleResolve(d.booking_id, "release")}
                  disabled={actionLoading === d.booking_id}
                  className="flex-1 px-4 py-2 bg-[#2F3B3D] text-white rounded-full border-2 border-[#2F3B3D] hover:bg-[#7C8D8C] hover:border-[#7C8D8C] transition-all duration-300 disabled:opacity-50"
                >
                  Release to Tutor
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
