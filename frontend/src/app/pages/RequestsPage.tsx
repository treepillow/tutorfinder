import { useState, useEffect, useRef } from "react";
import { RequestCard } from "../components/RequestCard";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";

export function RequestsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [acceptedRequests, setAcceptedRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"awaiting" | "payment">("awaiting");
  const prevTab = useRef<"awaiting" | "payment">("awaiting");

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }

    loadRequests();
  }, []);

  const loadRequests = () => {
    const allRequests = JSON.parse(localStorage.getItem("requests") || "[]");
    const pending = allRequests.filter((r: any) => r.status === "pending");
    const accepted = allRequests.filter((r: any) => r.status === "accepted");
    
    setRequests(pending);
    setAcceptedRequests(accepted);
  };

  const handleCancelRequest = (requestId: string) => {
    const allRequests = JSON.parse(localStorage.getItem("requests") || "[]");
    const updated = allRequests.filter((r: any) => r.id !== requestId);
    localStorage.setItem("requests", JSON.stringify(updated));
    loadRequests();
    toast.success("Request cancelled");
  };

  const handleAcceptRequest = (requestId: string) => {
    const allRequests = JSON.parse(localStorage.getItem("requests") || "[]");
    const updated = allRequests.map((r: any) =>
      r.id === requestId ? { ...r, status: "accepted" } : r
    );
    localStorage.setItem("requests", JSON.stringify(updated));
    loadRequests();
    toast.success("Request accepted");
  };

  const handleRejectRequest = (requestId: string) => {
    handleCancelRequest(requestId);
  };

  const handlePay = (request: any) => {
    toast.success("Redirecting to Stripe...");
    // In real implementation, would redirect to Stripe
    setTimeout(() => {
      alert(`Payment of $${request.price} processed successfully!`);
    }, 1000);
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

        {isStudent ? (
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
                    requests.length === 0 ? (
                      <div className="bg-[#EDE9DF] rounded-2xl p-12 text-center">
                        <div className="text-5xl mb-3">📫</div>
                        <p className="text-[#2F3B3D]/70">No pending requests</p>
                      </div>
                    ) : (
                      requests.map((request) => (
                        <RequestCard
                          key={request.id}
                          request={request}
                          userType="student"
                          onCancel={() => handleCancelRequest(request.id)}
                        />
                      ))
                    )
                  ) : (
                    acceptedRequests.length === 0 ? (
                      <div className="bg-[#EDE9DF] rounded-2xl p-12 text-center">
                        <div className="text-5xl mb-3">💳</div>
                        <p className="text-[#2F3B3D]/70">No payments pending</p>
                      </div>
                    ) : (
                      acceptedRequests.map((request) => (
                        <RequestCard
                          key={request.id}
                          request={request}
                          userType="student"
                          onPay={() => handlePay(request)}
                        />
                      ))
                    )
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="bg-[#EDE9DF] rounded-2xl p-12 text-center">
                <div className="text-5xl mb-3">📬</div>
                <p className="text-[#2F3B3D]/70">No requests yet</p>
              </div>
            ) : (
              requests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  userType="tutor"
                  onAccept={() => handleAcceptRequest(request.id)}
                  onReject={() => handleRejectRequest(request.id)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
