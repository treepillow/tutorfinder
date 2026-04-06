import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { profileApi, bookingApi, paymentApi } from "../utils/api";
import { Users, BookOpen, AlertTriangle, DollarSign, ArrowRight, RefreshCw } from "lucide-react";
import Lottie from "lottie-react";
import circleGuyLoadingData from "../assets/circleGuyLoading.json";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-[#EDE9DF] rounded-2xl p-6">
      <p className="text-xs text-[#2F3B3D]/40 uppercase tracking-widest mb-3">{label}</p>
      <p className="text-4xl font-semibold text-[#2F3B3D] leading-none">{value}</p>
      {sub && <p className="text-xs text-[#2F3B3D]/40 mt-2">{sub}</p>}
    </div>
  );
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0, totalTutors: 0, totalStudents: 0,
    activeDisputes: 0,
    totalBookings: 0, confirmedBookings: 0, completedBookings: 0, cancelledBookings: 0,
    totalEscrow: 0, totalReleased: 0, totalRefunded: 0, totalVolume: 0,
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const statuses = ["AwaitingPayment", "Confirmed", "Completed", "Cancelled", "Disputed"];
      const [usersRes, ...bookingResults] = await Promise.allSettled([
        profileApi.getAllProfiles(),
        ...statuses.map((s) => bookingApi.getByStatus(s)),
      ]);

      // Debug: Log user fetch status
      if (usersRes.status === "rejected") {
        console.error("Failed to fetch users:", usersRes.reason);
      }

      const users = usersRes.status === "fulfilled" ? (usersRes.value?.profiles || []) : [];
      console.log("Users fetched:", users.length, users);

      const allBookings: any[] = bookingResults.flatMap((r) =>
        r.status === "fulfilled" ? (r.value?.bookings || []) : []
      );

      const paymentResults = await Promise.allSettled(
        allBookings.map((b) => paymentApi.getByBooking(b.booking_id))
      );
      const payments = paymentResults
        .filter((r) => r.status === "fulfilled")
        .map((r: any) => r.value);

      const sum = (s: string) =>
        payments.filter((p) => p.status === s).reduce((a, p) => a + parseFloat(p.amount || "0"), 0);

      const newStats = {
        totalUsers:        users.filter((u: any) => u.role !== "Admin").length,
        totalTutors:       users.filter((u: any) => u.role === "Tutor").length,
        totalStudents:     users.filter((u: any) => u.role === "Student").length,
        activeDisputes:    allBookings.filter((b) => b.status === "Disputed").length,
        totalBookings:     allBookings.length,
        confirmedBookings: allBookings.filter((b) => b.status === "Confirmed").length,
        completedBookings: allBookings.filter((b) => b.status === "Completed").length,
        cancelledBookings: allBookings.filter((b) => b.status === "Cancelled").length,
        totalEscrow:   sum("HELD"),
        totalReleased: sum("RELEASED"),
        totalRefunded: sum("REFUNDED"),
        totalVolume:   payments.reduce((a, p) => a + parseFloat(p.amount || "0"), 0),
      };
      
      console.log("Stats updated:", newStats);
      setStats(newStats);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm bg-white/30">
        <Lottie animationData={circleGuyLoadingData} loop autoplay style={{ width: 500, height: 500, transform: "translateY(-80px)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl tracking-tight text-[#2F3B3D] mb-1">Dashboard</h1>
            <p className="text-[#2F3B3D]/50">Platform overview</p>
          </div>
          <button
            onClick={() => load()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#2F3B3D] hover:bg-[#7C8D8C] text-white rounded-full text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Users */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-[#7C8D8C]" />
            <h2 className="text-xs uppercase tracking-widest text-[#2F3B3D]/40">Users</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Total" value={stats.totalUsers} />
            <StatCard label="Tutors" value={stats.totalTutors} sub={stats.totalUsers > 0 ? `${Math.round(stats.totalTutors / stats.totalUsers * 100)}% of users` : undefined} />
            <StatCard label="Students" value={stats.totalStudents} sub={stats.totalUsers > 0 ? `${Math.round(stats.totalStudents / stats.totalUsers * 100)}% of users` : undefined} />
          </div>
        </section>

        {/* Bookings */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-[#7C8D8C]" />
            <h2 className="text-xs uppercase tracking-widest text-[#2F3B3D]/40">Bookings</h2>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <StatCard label="Total" value={stats.totalBookings} />
            <StatCard label="Confirmed" value={stats.confirmedBookings} />
            <StatCard label="Completed" value={stats.completedBookings} />
            <StatCard label="Cancelled" value={stats.cancelledBookings} />
          </div>
        </section>

        {/* Disputes — prominent */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-[#7C8D8C]" />
            <h2 className="text-xs uppercase tracking-widest text-[#2F3B3D]/40">Disputes</h2>
          </div>
          <button
            onClick={() => navigate("/app/admin/disputes")}
            className={`w-full rounded-2xl p-6 flex items-center justify-between transition-all duration-200 group ${
              stats.activeDisputes > 0
                ? "bg-[#2F3B3D] hover:bg-[#3d4d50]"
                : "bg-[#EDE9DF] hover:bg-[#E3DDD3]"
            }`}
          >
            <div className="text-left">
              <p className={`text-xs uppercase tracking-widest mb-3 ${stats.activeDisputes > 0 ? "text-white/50" : "text-[#2F3B3D]/40"}`}>
                Active disputes
              </p>
              <p className={`text-5xl font-semibold leading-none ${stats.activeDisputes > 0 ? "text-white" : "text-[#2F3B3D]"}`}>
                {stats.activeDisputes}
              </p>
              <p className={`text-xs mt-3 ${stats.activeDisputes > 0 ? "text-white/50" : "text-[#2F3B3D]/30"}`}>
                {stats.activeDisputes > 0 ? "Requires your attention" : "No disputes pending"}
              </p>
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium transition-transform duration-200 group-hover:translate-x-1 ${
              stats.activeDisputes > 0 ? "text-white/70" : "text-[#2F3B3D]/30"
            }`}>
              Review <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </section>

        {/* Payments */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4 text-[#7C8D8C]" />
            <h2 className="text-xs uppercase tracking-widest text-[#2F3B3D]/40">Payments</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="In Escrow" value={`$${stats.totalEscrow.toFixed(2)}`} sub="Currently held" />
            <StatCard label="Released to Tutors" value={`$${stats.totalReleased.toFixed(2)}`} />
            <StatCard label="Refunded to Students" value={`$${stats.totalRefunded.toFixed(2)}`} />
            <StatCard label="Total Volume" value={`$${stats.totalVolume.toFixed(2)}`} sub="All time" />
          </div>
        </section>

      </div>
    </div>
  );
}
