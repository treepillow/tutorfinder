import { useState, useEffect } from "react";
import { RequestCard } from "../components/RequestCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";

export function RequestsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [acceptedRequests, setAcceptedRequests] = useState<any[]>([]);

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
          <Tabs defaultValue="awaiting" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#E9D8BB]">
              <TabsTrigger value="awaiting">Awaiting Response</TabsTrigger>
              <TabsTrigger value="payment">Awaiting Payment</TabsTrigger>
            </TabsList>
            
            <TabsContent value="awaiting" className="space-y-4 mt-6">
              {requests.length === 0 ? (
                <div className="bg-[#E9D8BB] rounded-2xl p-12 text-center">
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
              )}
            </TabsContent>

            <TabsContent value="payment" className="space-y-4 mt-6">
              {acceptedRequests.length === 0 ? (
                <div className="bg-[#E9D8BB] rounded-2xl p-12 text-center">
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
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="bg-[#E9D8BB] rounded-2xl p-12 text-center">
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
