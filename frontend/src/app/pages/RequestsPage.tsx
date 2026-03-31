import { useState, useEffect, useRef } from "react";
import { RequestCard } from "../components/RequestCard";
import { PaymentDialog } from "../components/PaymentDialog";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { getCurrentUser, bookingApi, bookingProcessApi, profileApi, paymentApi, enrichProfile, availabilityApi } from "../utils/api";

export function RequestsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"awaiting" | "payment">("awaiting");
  const prevTab = useRef<"awaiting" | "payment">("awaiting");
  const [loading, setLoading] = useState(true);
  const [paymentDialog, setPaymentDialog] = useState<{ clientSecret: string; amount: number; request: any } | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      loadRequests(user);
    }
  }, []);

  const loadRequests = async (user: any) => {
    setLoading(true);
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
          subject: infoProfile.subjects?.[0]?.subject || "Lesson",
          level: infoProfile.subjects?.[0]?.level || "",
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
    } catch (err: any) {
      console.error("Failed to load requests:", err);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (bookingId: number, availabilityId: number) => {
    try {
      try {
        await bookingProcessApi.cancel(bookingId, currentUser.userType === "student" ? "tutee" : "tutor");
      } catch {
        await bookingApi.cancel(bookingId);
        if (availabilityId) {
          await availabilityApi.updateSlot(availabilityId, "Available").catch(() => {});
        }
      }
      toast.success("Request cancelled");
      loadRequests(currentUser);
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel");
    }
  };

  const handleAcceptRequest = async (bookingId: number) => {
    try {
      try {
        await bookingProcessApi.confirm(bookingId);
      } catch {
        await bookingApi.confirm(bookingId);
      }
      toast.success("Request accepted! Student will be notified to pay.");
      loadRequests(currentUser);
    } catch (err: any) {
      toast.error(err.message || "Failed to accept");
    }
  };

  const handleRejectRequest = async (bookingId: number) => {
    try {
      try {
        await bookingProcessApi.reject(bookingId);
      } catch {
        await bookingApi.reject(bookingId);
      }
      toast.success("Request rejected");
      loadRequests(currentUser);
    } catch (err: any) {
      toast.error(err.message || "Failed to reject");
    }
  };

  const handlePay = async (request: any) => {
    try {
      const amount = parseFloat(request.price) || 50;
      const paymentRes = await paymentApi.createIntent({
        booking_id: request.booking_id,
        tutee_id: currentUser.id,
        tutor_id: request.tutor_id,
        amount,
      });

      if (paymentRes.client_secret && !paymentRes.client_secret.startsWith("mock_")) {
        // Real Stripe — open the payment dialog with card form
        setPaymentDialog({
          clientSecret: paymentRes.client_secret,
          amount,
          request: { ...request, stripe_payment_intent_id: paymentRes.stripe_payment_intent_id },
        });
      } else {
        // Mock mode — no Stripe key configured, auto-confirm
        try {
          await bookingProcessApi.paymentCaptured(
            request.booking_id,
            paymentRes.stripe_payment_intent_id || paymentRes.payment_intent_id
          );
        } catch {
          await paymentApi.capture({
            booking_id: request.booking_id,
            stripe_payment_intent_id: paymentRes.stripe_payment_intent_id || paymentRes.payment_intent_id,
          });
          await bookingApi.updateStatus(request.booking_id, "Confirmed");
        }
        toast.success("Payment processed (mock mode)");
        loadRequests(currentUser);
      }
    } catch (err: any) {
      toast.error(err.message || "Payment failed");
    }
  };

  const handlePaymentSuccess = async () => {
    if (!paymentDialog) return;
    const { request } = paymentDialog;
    setPaymentDialog(null);

    try {
      try {
        await bookingProcessApi.paymentCaptured(
          request.booking_id,
          request.stripe_payment_intent_id
        );
      } catch {
        await paymentApi.capture({
          booking_id: request.booking_id,
          stripe_payment_intent_id: request.stripe_payment_intent_id,
        });
        await bookingApi.updateStatus(request.booking_id, "Confirmed");
      }
      toast.success("Payment successful! Lesson confirmed.");
      loadRequests(currentUser);
    } catch (err: any) {
      toast.error(err.message || "Failed to confirm booking after payment");
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
    { key: "awaiting" as const, label: "Awaiting Response" },
    { key: "payment" as const, label: "Awaiting Payment" },
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

        {loading ? (
          <div className="bg-[#EDE9DF] rounded-2xl p-12 text-center">
            <p className="text-[#2F3B3D]/70 animate-pulse">Loading requests...</p>
          </div>
        ) : (
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
                  className={`relative z-10 flex-1 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                    activeTab === tab.key ? "text-white" : "text-[#2F3B3D]/60 hover:text-[#2F3B3D]"
                  }`}
                >
                  {tab.label}
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
                      <div className="bg-[#EDE9DF] rounded-2xl p-12 text-center">
                        <div className="text-5xl mb-3">📫</div>
                        <p className="text-[#2F3B3D]/70">No pending requests</p>
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
                      <div className="bg-[#EDE9DF] rounded-2xl p-12 text-center">
                        <div className="text-5xl mb-3">💳</div>
                        <p className="text-[#2F3B3D]/70">No payments pending</p>
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

      {paymentDialog && (
        <PaymentDialog
          clientSecret={paymentDialog.clientSecret}
          amount={paymentDialog.amount}
          onSuccess={handlePaymentSuccess}
          onClose={() => setPaymentDialog(null)}
        />
      )}
    </div>
  );
}
