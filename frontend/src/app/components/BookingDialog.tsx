import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { availabilityApi, bookingProcessApi, bookingApi } from "../utils/api";
import { useRefreshNavCounts } from "../context/NavCountsContext";

interface BookingDialogProps {
  profile: any;
  currentUser: any;
  onClose: () => void;
}

export function BookingDialog({ profile, currentUser, onClose }: BookingDialogProps) {
  const refreshNavCounts = useRefreshNavCounts();
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [price, setPrice] = useState(0);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(true);

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    setLoadingSlots(true);
    try {
      const res = await availabilityApi.getSlots(profile.id);
      // Only show "Available" slots
      const available = (res.availability || []).filter(
        (s: any) => s.status === "Available"
      );
      setAvailableSlots(available);
    } catch (err) {
      console.error("Failed to load availability:", err);
      toast.error("Failed to load tutor's availability");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    setSelectedLevel("");
    setPrice(0);
  };

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);

    const subjectData = profile.subjects?.find(
      (s: any) => s.subject === selectedSubject && s.level === level
    );

    if (subjectData) {
      setPrice(parseFloat(subjectData.hourlyRate || subjectData.budget || "0"));
    }
  };

  const handleConfirm = async () => {
    if (!selectedSubject || !selectedLevel || !selectedSlotId) {
      toast.error("Please select subject, level and a time slot");
      return;
    }

    const slot = availableSlots.find((s: any) => s.availability_id === selectedSlotId);
    if (!slot) return;

    setLoading(true);
    try {
      // Try the OutSystems booking process service first
      try {
        await bookingProcessApi.initiate({
          tutee_id: currentUser.id,
          tutor_id: profile.id,
          availability_id: selectedSlotId,
          lesson_date: slot.date,
          start_time: slot.start_time,
          end_time: slot.end_time,
          amount: price.toFixed(2),
          subject: selectedSubject,
          level: selectedLevel,
        });
      } catch {
        // If OutSystems is unavailable, fall back to direct booking service
        const booking = await bookingApi.create({
          tutor_id: profile.id,
          tutee_id: currentUser.id,
          availability_id: selectedSlotId,
          lesson_date: slot.date,
          start_time: slot.start_time,
          end_time: slot.end_time,
          subject: selectedSubject,
          level: selectedLevel,
        });
        try {
          await availabilityApi.updateSlot(selectedSlotId, "Reserved");
        } catch {
          // Roll back the booking so both services stay in sync
          await bookingApi.cancel(booking.booking_id).catch(console.error);
          throw new Error("Failed to reserve slot — booking has been cancelled.");
        }
      }

      toast.success("Booking request sent!");
      refreshNavCounts();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to send booking request");
    } finally {
      setLoading(false);
    }
  };

  // Get unique subjects and levels from profile
  const uniqueSubjects = [...new Set((profile.subjects || []).map((s: any) => s.subject))];
  const levelsForSubject = selectedSubject
    ? (profile.subjects || [])
        .filter((s: any) => s.subject === selectedSubject)
        .map((s: any) => s.level)
    : [];

  const selectedSlot = availableSlots.find((s: any) => s.availability_id === selectedSlotId);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-[#F5F3EF] border-[#D6CFBF] max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#2F3B3D]">
            Book a Lesson with {profile.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Subject Selection */}
          <div className="space-y-2">
            <label className="text-sm text-[#2F3B3D]">Subject</label>
            <Select value={selectedSubject} onValueChange={handleSubjectChange}>
              <SelectTrigger className="bg-[#EDE9DF] border-[#D6CFBF]">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {uniqueSubjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Level Selection */}
          {selectedSubject && (
            <div className="space-y-2">
              <label className="text-sm text-[#2F3B3D]">Level</label>
              <Select value={selectedLevel} onValueChange={handleLevelChange}>
                <SelectTrigger className="bg-[#EDE9DF] border-[#D6CFBF]">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {levelsForSubject.map((level: string) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Price Display */}
          {selectedLevel && price > 0 && (
            <div className="bg-[#EDE9DF] p-4 rounded-xl flex items-center justify-between">
              <span className="text-[#2F3B3D]">Hourly Rate</span>
              <span className="text-xl text-[#7C8D8C]">${price}/hr</span>
            </div>
          )}

          {/* Available Time Slots from Backend */}
          <div className="space-y-2">
            <label className="text-sm text-[#2F3B3D]">Select Time Slot</label>
            {loadingSlots ? (
              <div className="bg-[#EDE9DF] p-4 rounded-xl text-center">
                <p className="text-[#2F3B3D]/70 animate-pulse">Loading availability...</p>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="bg-[#EDE9DF] p-4 rounded-xl text-center">
                <p className="text-[#2F3B3D]/70">No available time slots</p>
              </div>
            ) : (
              <div className="bg-[#EDE9DF] p-4 rounded-xl space-y-4">
                {(() => {
                  // Filter to 2 weeks in advance and group by date
                  const twoWeeksLater = new Date();
                  twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
                  const filtered = availableSlots.filter((s: any) => {
                    const d = new Date(s.date + "T00:00:00");
                    return d <= twoWeeksLater;
                  });
                  const grouped: Record<string, any[]> = {};
                  for (const slot of filtered) {
                    if (!grouped[slot.date]) grouped[slot.date] = [];
                    grouped[slot.date].push(slot);
                  }
                  const sortedDates = Object.keys(grouped).sort();
                  if (sortedDates.length === 0) {
                    return <p className="text-[#2F3B3D]/70 text-center">No slots in the next 2 weeks</p>;
                  }
                  return sortedDates.map((date) => {
                    const dateObj = new Date(date + "T00:00:00");
                    const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
                    return (
                      <div key={date}>
                        <div className="text-sm font-medium text-[#2F3B3D] mb-2">
                          {dateStr} — {dayName}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {grouped[date].map((slot: any) => (
                            <button
                              key={slot.availability_id}
                              type="button"
                              onClick={() => setSelectedSlotId(
                                selectedSlotId === slot.availability_id ? null : slot.availability_id
                              )}
                              className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                                selectedSlotId === slot.availability_id
                                  ? "bg-[#7C8D8C] text-white"
                                  : "bg-white text-[#2F3B3D] hover:bg-[#D6CFBF]"
                              }`}
                            >
                              {slot.start_time.slice(0, 5)}-{slot.end_time.slice(0, 5)}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>

          {/* Total Price */}
          {selectedSlot && price > 0 && (
            <div className="bg-[#7C8D8C] text-white p-4 rounded-xl flex items-center justify-between">
              <span>Total (1 hour)</span>
              <span className="text-2xl">${price}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white text-[#2F3B3D] rounded-full border-2 border-[#D6CFBF] hover:bg-[#EDE9DF] transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedSubject || !selectedLevel || !selectedSlotId || loading}
              className="flex-1 px-6 py-3 bg-[#7C8D8C] text-white rounded-full hover:bg-[#2F3B3D] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Request"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
