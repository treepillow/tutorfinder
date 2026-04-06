import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { RequestCard } from "../components/RequestCard";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { getCurrentUser, bookingApi, bookingProcessApi, profileApi, paymentApi, enrichProfile, availabilityApi } from "../utils/api";
import Lottie from "lottie-react";
import circleGuyLoadingData from "../assets/circleGuyLoading.json";
import { useRefreshNavCounts } from "../context/NavCountsContext";
import thinkingGuy from "../assets/thinkingGuy.png";
import creditGuy from "../assets/creditGuy.png";
import { io } from "socket.io-client";

export function RequestsPage() {
  const refreshNavCounts = useRefreshNavCounts();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"awaiting" | "payment">("awaiting");
  const prevTab = useRef<"awaiting" | "payment">("awaiting");
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;
    setCurrentUser(user);

    const paymentStatus = searchParams.get("payment");
    const bookingId = searchParams.get("booking_id");

    if (paymentStatus === "success" && bookingId) {
      setSearchParams({});
      setActiveTab("payment");
      // Complete payment through OutSystems orchestrator
      (async () => {
        try {
          await bookingProcessApi.completePayment(parseInt(bookingId));
          toast.success("Payment successful! Lesson confirmed.");
        } catch (err: any) {
          toast.error(err.message || "Failed to confirm payment");
        }
        loadRequests(user);
      })();
    } else {
      if (paymentStatus === "cancelled") {
        setSearchParams({});
        toast.error("Payment was cancelled");
      }
      loadRequests(user);
    }

    // WebSocket: auto-refresh when relevant booking events come in
    const socket = io(import.meta.env.VITE_BOOKING_SERVICE, { transports: ["websocket"] });

    // Tutor sees new request in "Awaiting Response" tab
    socket.on("new_booking", (booking: any) => {
      if (user.userType === "tutor" && booking.tutor_id === user.id) {
        loadRequests(user, true);
        refreshNavCounts();
        toast("New lesson request!", { description: "A student has requested a lesson." });
      }
    });

    // Student sees accepted request move to "Awaiting Payment" tab
    socket.on("booking_confirmed", (booking: any) => {
      if (user.userType === "student" && booking.tutee_id === user.id) {
        loadRequests(user, true);
        refreshNavCounts();
        toast("Tutor accepted your request!", { description: "Head to Awaiting Payment to confirm your lesson." });
      }
    });

    // Payment completed — booking leaves the Awaiting Payment tab for both sides
    socket.on("booking_status_changed", (booking: any) => {
      if (booking.tutor_id === user.id || booking.tutee_id === user.id) {
        loadRequests(user, true);
        refreshNavCounts();
      }
    });

    return () => { socket.disconnect(); };
  }, []);

  const loadRequests = async (user: any, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await bookingApi.getByUser(user.id);
      const bookings = res.bookings || [];

      // Fetch other-user profiles + the current user's own profile for subject/price info
      const otherIds = [...new Set(bookings.map((b: any) =>
        user.userType === "student" ? b.tutor_id : b.tutee_id
      ))] as number[];

      const profileMap: Record<number, any> = {};
      let myProfile: any = null;
      await Promise.all([
        ...otherIds.map(async (id) => {
          try {
            const p = await profileApi.getProfile(id);
            profileMap[id] = enrichProfile(p);
          } catch {
            profileMap[id] = { name: `User #${id}` };
          }
        }),
        profileApi.getProfile(user.id).then((p) => { myProfile = enrichProfile(p); }).catch(() => {}),
      ]);

      // For tutors, use their own profile for subject/level/price
      // For students, use the tutor's profile
      const enriched = bookings.map((booking: any) => {
        const otherUserId = user.userType === "student" ? booking.tutor_id : booking.tutee_id;
        const otherProfile = profileMap[otherUserId] || { name: `User #${otherUserId}` };
        const infoProfile = user.userType === "tutor" && myProfile ? myProfile : otherProfile;
        return {
          ...booking,
          id: booking.booking_id,
          tutorName: user.userType === "student" ? otherProfile.name : user.name,
          studentName: user.userType === "tutor" ? otherProfile.name : user.name,
          otherProfile,
          subject: booking.subject || infoProfile.subjects?.[0]?.subject || "Lesson",
          level: booking.level || infoProfile.subjects?.[0]?.level || "",
          day: booking.lesson_date,
          slots: [`${booking.start_time?.slice(0, 5)}-${booking.end_time?.slice(0, 5)}`],
          price: infoProfile.subjects?.[0]?.hourlyRate || infoProfile.price_rate || 0,
        };
      });

      // Split by status
      const pending = enriched.filter((b: any) => b.status === "AwaitingConfirmation");
      const awaiting_payment = enriched.filter((b: any) => b.status === "AwaitingPayment");
      setPendingRequests(pending);
      setPaymentRequests(awaiting_payment);

      // Recovery: if any AwaitingPayment booking already has a HELD payment,
      // the completePayment call must have failed after Stripe succeeded — retry it silently
      if (user.userType === "student" && awaiting_payment.length > 0) {
        for (const booking of awaiting_payment) {
          try {
            const payment = await paymentApi.getByBooking(booking.booking_id);
            if (payment?.status === "HELD") {
              console.warn(`[Payment recovery] Booking ${booking.booking_id} stuck in AwaitingPayment with HELD payment — retrying completePayment`);
              await bookingProcessApi.completePayment(booking.booking_id);
              toast.success("Payment confirmed — your booking is now active!");
            }
          } catch {
            // silently ignore — don't block the page
          }
        }
        // Reload if any recovery happened
        loadRequests(user, true);
      }
    } catch (err: any) {
      console.error("Failed to load requests:", err);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (bookingId: number, availabilityId: number) => {
    setLoading(true);
    try {
      await bookingProcessApi.cancel(bookingId, currentUser.userType === "student" ? "tutee" : "tutor");
      toast.success("Request cancelled");
      loadRequests(currentUser);
      refreshNavCounts();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel");
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (bookingId: number) => {
    setLoading(true);
    try {
      await bookingProcessApi.confirm(bookingId);
      toast.success("Request accepted! Student will be notified to pay.");
      loadRequests(currentUser);
      refreshNavCounts();
    } catch (err: any) {
      toast.error(err.message || "Failed to accept");
      setLoading(false);
    }
  };

  const handleRejectRequest = async (bookingId: number) => {
    setLoading(true);
    try {
      await bookingProcessApi.reject(bookingId);
      toast.success("Request rejected");
      loadRequests(currentUser);
      refreshNavCounts();
    } catch (err: any) {
      toast.error(err.message || "Failed to reject");
      setLoading(false);
    }
  };

  const handlePay = async (request: any) => {
    setLoading(true);
    try {
      const amount = parseFloat(request.price) || 50;
      const checkoutRes = await paymentApi.checkout({
        booking_id: request.booking_id,
        tutee_id: currentUser.id,
        tutor_id: request.tutor_id,
        amount,
      });

      if (checkoutRes.checkout_url) {
        // Redirect to Stripe Checkout
        window.location.href = checkoutRes.checkout_url;
      } else {
        // Mock mode — no Stripe key, auto-confirm
        await bookingProcessApi.paymentCaptured(
          request.booking_id,
          checkoutRes.stripe_payment_intent_id
        );
        toast.success("Payment processed (mock mode)");
        loadRequests(currentUser);
        refreshNavCounts();
      }
    } catch (err: any) {
      toast.error(err.message || "Payment failed");
      setLoading(false);
    }
  };




  if (!currentUser) {
    return null;
  }

  const isStudent = currentUser.userType === "student";
  const direction = activeTab === "payment" ? 1 : -1;

  const switchTab = (tab: "awaiting" | "payment") => {
    prevTab.current = activeTab;
    setActiveTab(tab);
  };

  const tabs = [
    { key: "awaiting" as const, label: "Awaiting Response", count: pendingRequests.length },
    { key: "payment" as const, label: "Awaiting Payment", count: paymentRequests.length },
  ];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl tracking-tight text-[#2F3B3D] mb-2">
            Requests
          </h1>
          <p className="text-[#2F3B3D]/70">
            {isStudent ? "Manage your lesson requests" : "View and respond to student requests"}
          </p>
        </div>

        {!loading && (
          <div className="w-full">
            {/* Tab bar */}
            <div className="relative flex p-1 bg-[#EDE9DF] rounded-full mb-6">
              <div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#2F3B3D] rounded-full shadow transition-transform duration-300 ease-in-out"
                style={{ transform: activeTab === "awaiting" ? "translateX(0%)" : "translateX(calc(100% + 8px))" }}
              />
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => switchTab(tab.key)}
                  className={`relative z-10 flex-1 py-2 rounded-full text-sm font-medium transition-colors duration-300 flex items-center justify-center gap-2 ${
                    activeTab === tab.key ? "text-white" : "text-[#2F3B3D]/60 hover:text-[#2F3B3D]"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold flex items-center justify-center leading-none transition-colors duration-300 ${
                      activeTab === tab.key ? "bg-white/20 text-white" : "bg-[#2F3B3D]/10 text-[#2F3B3D]/70"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Sliding content */}
            <div className="overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                <motion.div
                  key={activeTab}
                  custom={direction}
                  initial={{ x: direction * 60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: direction * -60, opacity: 0 }}
                  transition={{ duration: 0.28, ease: "easeInOut" }}
                  className="space-y-4"
                >
                  {activeTab === "awaiting" ? (
                    pendingRequests.length === 0 ? (
                      <div className="bg-[#EDE9DF] rounded-2xl p-10 text-center flex flex-col items-center">
                        <img src={thinkingGuy} alt="Thinking" style={{ width: 120, height: 120, objectFit: "contain" }} />
                        <p className="text-[#2F3B3D] font-medium mt-3">No pending requests</p>
                        <p className="text-[#2F3B3D]/60 text-sm mt-1">Nothing here yet — check back soon!</p>
                      </div>
                    ) : (
                      pendingRequests.map((request) => (
                        <RequestCard
                          key={request.id}
                          request={request}
                          userType={currentUser.userType}
                          onCancel={isStudent ? () => handleCancelRequest(request.booking_id, request.availability_id) : undefined}
                          onAccept={!isStudent ? () => handleAcceptRequest(request.booking_id) : undefined}
                          onReject={!isStudent ? () => handleRejectRequest(request.booking_id) : undefined}
                        />
                      ))
                    )
                  ) : (
                    paymentRequests.length === 0 ? (
                      <div className="bg-[#EDE9DF] rounded-2xl p-10 text-center flex flex-col items-center">
                        <img src={creditGuy} alt="Credit" style={{ width: 120, height: 120, objectFit: "contain" }} />
                        <p className="text-[#2F3B3D] font-medium mt-3">No payments pending</p>
                        <p className="text-[#2F3B3D]/60 text-sm mt-1">All quiet on the payment front!</p>
                      </div>
                    ) : (
                      paymentRequests.map((request) => (
                        <RequestCard
                          key={request.id}
                          request={request}
                          userType={currentUser.userType}
                          onPay={isStudent ? () => handlePay(request) : undefined}
                          onCancel={() => handleCancelRequest(request.booking_id, request.availability_id)}
                        />
                      ))
                    )
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm bg-white/30">
          <Lottie animationData={circleGuyLoadingData} loop autoplay style={{ width: 500, height: 500, transform: 'translateY(-80px)' }} />
        </div>
      )}
    </div>
  );
}
