import { useState } from "react";
import { Calendar, Clock, BookOpen, DollarSign, ChevronDown, ChevronUp } from "lucide-react";

interface RequestCardProps {
  request: any;
  userType: "student" | "tutor";
  onCancel?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onPay?: () => void;
  onComplete?: () => void;
}

export function RequestCard({ request, userType, onCancel, onAccept, onReject, onPay, onComplete }: RequestCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayDate = request.lesson_date || request.day;
  const formattedDate = displayDate
    ? (() => {
        try {
          return new Date(displayDate + "T00:00:00").toLocaleDateString("en-US", {
            weekday: "short", month: "short", day: "numeric",
          });
        } catch {
          return displayDate;
        }
      })()
    : "TBD";

  return (
    <div className="bg-[#EDE9DF] rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-[#D6CFBF]/30 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#D6CFBF] to-[#7C8D8C] rounded-full flex items-center justify-center text-2xl">
            {userType === "student" ? "👨‍🏫" : "🎓"}
          </div>
          <div className="text-left">
            <div className="text-lg text-[#2F3B3D]">
              {userType === "student" ? request.tutorName : (request.studentName || "Student Request")}
            </div>
            <div className="text-sm text-[#2F3B3D]/70">
              {request.subject}{request.level ? ` - ${request.level}` : ""}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {request.status && (
            <span className={`text-xs px-3 py-1 rounded-full ${
              request.status === "pending" || request.status === "AwaitingConfirmation"
                ? "bg-yellow-100 text-yellow-700"
                : request.status === "accepted" || request.status === "AwaitingPayment"
                ? "bg-blue-100 text-blue-700"
                : request.status === "confirmed" || request.status === "Confirmed"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}>
              {request.status === "AwaitingConfirmation" ? "Pending" :
               request.status === "AwaitingPayment" ? "Awaiting Payment" :
               request.status === "Confirmed" ? "Confirmed" :
               request.status}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-[#2F3B3D]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#2F3B3D]" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-[#F5F3EF] p-4 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-[#2F3B3D]">
              <Calendar className="w-4 h-4 text-[#7C8D8C]" />
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-start gap-2 text-[#2F3B3D]">
              <Clock className="w-4 h-4 text-[#7C8D8C] mt-1" />
              <div className="flex flex-wrap gap-2">
                {(request.slots || []).map((slot: string) => (
                  <span key={slot} className="px-3 py-1 bg-[#EDE9DF] rounded-full text-sm">
                    {slot}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-[#2F3B3D]">
              <BookOpen className="w-4 h-4 text-[#7C8D8C]" />
              <span>{request.subject}{request.level ? ` (${request.level})` : ""}</span>
            </div>

            {request.price > 0 && (
              <div className="flex items-center gap-2 text-[#2F3B3D]">
                <DollarSign className="w-4 h-4 text-[#7C8D8C]" />
                <span className="text-lg">${request.price}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {userType === "student" && (request.status === "pending" || request.status === "AwaitingConfirmation") && onCancel && (
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 bg-white text-[#2F3B3D] rounded-full border-2 border-[#D6CFBF] hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-300"
              >
                Cancel Request
              </button>
            )}

            {(request.status === "accepted" || request.status === "AwaitingPayment") && onCancel && (
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 bg-white text-[#2F3B3D] rounded-full border-2 border-[#D6CFBF] hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-300"
              >
                Cancel
              </button>
            )}

            {userType === "student" && (request.status === "accepted" || request.status === "AwaitingPayment") && onPay && (
              <button
                onClick={onPay}
                className="flex-1 px-4 py-2 bg-[#7C8D8C] text-white rounded-full hover:bg-[#2F3B3D] transition-all duration-300"
              >
                Pay Now
              </button>
            )}

            {userType === "tutor" && (request.status === "pending" || request.status === "AwaitingConfirmation") && onAccept && onReject && (
              <>
                <button
                  onClick={onReject}
                  className="flex-1 px-4 py-2 bg-white text-[#2F3B3D] rounded-full border-2 border-[#D6CFBF] hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-300"
                >
                  Decline
                </button>
                <button
                  onClick={onAccept}
                  className="flex-1 px-4 py-2 bg-[#7C8D8C] text-white rounded-full hover:bg-[#2F3B3D] transition-all duration-300"
                >
                  Accept
                </button>
              </>
            )}

            {userType === "tutor" && (request.status === "confirmed" || request.status === "Confirmed") && onComplete && (
              <button
                onClick={onComplete}
                className="flex-1 px-4 py-2 bg-[#7C8D8C] text-white rounded-full hover:bg-[#2F3B3D] transition-all duration-300"
              >
                Mark Complete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
