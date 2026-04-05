import { useState, useEffect } from "react";
import { bookingApi, bookingProcessApi, profileApi, enrichProfile, paymentApi } from "../utils/api";
import { toast } from "sonner";

export function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showTestCases, setShowTestCases] = useState(false);

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

  // Test data fixtures
  const generateTestCases = () => {
    const testDisputes = [
      {
        booking_id: 9001,
        tutor_id: 2,
        tutee_id: 3,
        lesson_date: "2025-04-10",
        start_time: "14:00:00",
        end_time: "15:00:00",
        status: "Disputed",
        disputed_by: "tutor",
        dispute_reason: "Student did not show up for the lesson",
        created_at: "2025-04-10T14:05:00",
        confirmed_at: "2025-04-09T10:00:00",
        tutee: { name: "Alex Johnson", id: 3, userType: "student" },
        tutor: { name: "Sarah Smith", id: 2, userType: "tutor" },
        payment: { amount: 50, status: "PENDING", booking_id: 9001 },
      },
      {
        booking_id: 9002,
        tutor_id: 4,
        tutee_id: 5,
        lesson_date: "2025-04-09",
        start_time: "10:00:00",
        end_time: "11:30:00",
        status: "Disputed",
        disputed_by: "tutee",
        dispute_reason: "Tutor did not show up for the lesson",
        created_at: "2025-04-09T10:05:00",
        confirmed_at: "2025-04-08T09:00:00",
        tutee: { name: "Maya Chen", id: 5, userType: "student" },
        tutor: { name: "James Wilson", id: 4, userType: "tutor" },
        payment: { amount: 75, status: "PENDING", booking_id: 9002 },
      },
    ];

    setDisputes(testDisputes);
    setShowTestCases(true);
    toast.success("Test cases loaded - Tutor no-show & Student no-show scenarios");
  };

  const clearTestCases = () => {
    setShowTestCases(false);
    loadDisputes();
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-white flex items-center justify-center">
        <p className="text-[#7C8D8C]">Loading disputes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-4xl tracking-tight text-[#2F3B3D]">
              Disputes
            </h1>
            {!showTestCases ? (
              <button
                onClick={generateTestCases}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full border-2 border-blue-300 hover:bg-blue-200 hover:border-blue-400 transition-all duration-300 text-sm font-medium"
              >
                📋 Test Cases
              </button>
            ) : (
              <button
                onClick={clearTestCases}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full border-2 border-gray-300 hover:bg-gray-200 hover:border-gray-400 transition-all duration-300 text-sm font-medium"
              >
                ✕ Clear Test
              </button>
            )}
          </div>
          <p className="text-[#2F3B3D]/70">
            Review and resolve disputed lessons
          </p>
        </div>

        {showTestCases && (
          <div className="mb-6 bg-[#E8F4F8] border-2 border-[#7C8D8C]/30 rounded-2xl p-4">
            <p className="text-sm font-medium text-[#2F3B3D]">
              🧪 Test Mode Active
            </p>
            <p className="text-sm text-[#7C8D8C] mt-2">
              Showing 2 test scenarios: Tutor no-show (Booking #9001) and Student no-show (Booking #9002)
            </p>
          </div>
        )}

        {disputes.length === 0 ? (
          <div className="bg-[#EDE9DF] rounded-3xl p-12 text-center">
            <p className="text-[#2F3B3D]/70 text-lg">No active disputes</p>
            <p className="text-[#2F3B3D]/50 text-sm mt-2">All lessons are going smoothly!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map((d) => (
              <div
                key={d.booking_id}
                className="bg-[#EDE9DF] hover:bg-[#E3DDD3] rounded-3xl p-6 transition-colors duration-150"
              >
                {/* Header section */}
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 className="text-lg font-medium text-[#2F3B3D]">
                      Lesson Dispute
                    </h3>
                    <p className="text-sm text-[#2F3B3D]/60 mt-1">
                      {d.lesson_date} · {d.start_time?.slice(0, 5)} - {d.end_time?.slice(0, 5)}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    Disputed
                  </span>
                </div>

                {/* Dispute reason - prominent */}
                {d.disputed_by && (
                  <div className="bg-white rounded-2xl p-4 mb-5 border-l-4 border-red-500">
                    <p className="text-xs font-medium text-[#7C8D8C] uppercase tracking-wide">
                      Reported by {d.disputed_by === "tutee" ? "Student" : "Tutor"}
                    </p>
                    <p className="text-[#2F3B3D] font-medium mt-2">
                      {d.dispute_reason}
                    </p>
                    <p className="text-sm text-[#2F3B3D]/60 mt-1">
                      {d.disputed_by === "tutee" ? d.tutee?.name : d.tutor?.name}
                    </p>
                  </div>
                )}

                {/* Participants */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <p className="text-xs font-medium text-[#7C8D8C] uppercase tracking-wide mb-1">
                      Student
                    </p>
                    <p className="text-[#2F3B3D] font-medium">
                      {d.tutee?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#7C8D8C] uppercase tracking-wide mb-1">
                      Tutor
                    </p>
                    <p className="text-[#2F3B3D] font-medium">
                      {d.tutor?.name}
                    </p>
                  </div>
                </div>

                {/* Payment info */}
                {d.payment && (
                  <div className="bg-white rounded-2xl p-4 mb-5">
                    <p className="text-xs font-medium text-[#7C8D8C] uppercase tracking-wide mb-1">
                      Payment Amount
                    </p>
                    <p className="text-[#2F3B3D] font-medium">
                      ${d.payment.amount} · <span className="text-[#7C8D8C] font-normal">{d.payment.status}</span>
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleResolve(d.booking_id, "refund")}
                    disabled={actionLoading === d.booking_id}
                    className="flex-1 px-4 py-3 bg-white text-[#2F3B3D] rounded-full border-2 border-[#D6CFBF] hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-300 font-medium disabled:opacity-50 text-sm"
                  >
                    Refund Student
                  </button>
                  <button
                    onClick={() => handleResolve(d.booking_id, "release")}
                    disabled={actionLoading === d.booking_id}
                    className="flex-1 px-4 py-3 bg-[#2F3B3D] text-white rounded-full border-2 border-[#2F3B3D] hover:bg-[#7C8D8C] hover:border-[#7C8D8C] transition-all duration-300 font-medium disabled:opacity-50 text-sm"
                  >
                    Release to Tutor
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
