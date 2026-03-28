import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";

interface BookingDialogProps {
  profile: any;
  onClose: () => void;
}

export function BookingDialog({ profile, onClose }: BookingDialogProps) {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [price, setPrice] = useState(0);

  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    setSelectedLevel("");
    setPrice(0);
  };

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    
    // Find the matching subject and level to get price
    const subjectData = profile.subjects.find(
      (s: any) => s.subject === selectedSubject && s.level === level
    );
    
    if (subjectData) {
      setPrice(parseFloat(subjectData.hourlyRate));
    }
  };

  const handleDayChange = (day: string) => {
    setSelectedDay(day);
    setSelectedSlots([]);
  };

  const toggleSlot = (slot: string) => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter((s) => s !== slot));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const handleConfirm = () => {
    if (!selectedSubject || !selectedLevel || selectedSlots.length === 0) {
      toast.error("Please select subject, level and at least one time slot");
      return;
    }

    // Create booking request
    const requests = JSON.parse(localStorage.getItem("requests") || "[]");
    const newRequest = {
      id: Date.now().toString(),
      tutorId: profile.id,
      tutorName: profile.name,
      subject: selectedSubject,
      level: selectedLevel,
      day: selectedDay,
      slots: selectedSlots,
      price: price * selectedSlots.length,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    
    requests.push(newRequest);
    localStorage.setItem("requests", JSON.stringify(requests));

    toast.success("Booking request sent successfully!");
    onClose();
  };

  const availableDays = profile.availability ? Object.keys(profile.availability) : [];
  const availableSlots = selectedDay && profile.availability ? profile.availability[selectedDay] : [];

  // Get unique subjects and levels
  const uniqueSubjects = [...new Set(profile.subjects.map((s: any) => s.subject))];
  const levelsForSubject = selectedSubject
    ? profile.subjects
        .filter((s: any) => s.subject === selectedSubject)
        .map((s: any) => s.level)
    : [];

  const totalPrice = price * selectedSlots.length;

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
                  {levelsForSubject.map((level) => (
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

          {/* Day Selection */}
          <div className="space-y-2">
            <label className="text-sm text-[#2F3B3D]">Select Day</label>
            <Select value={selectedDay} onValueChange={handleDayChange}>
              <SelectTrigger className="bg-[#EDE9DF] border-[#D6CFBF]">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {availableDays.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Slots */}
          {selectedDay && availableSlots.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm text-[#2F3B3D]">
                Select Time Slots (can select multiple)
              </label>
              <div className="bg-[#EDE9DF] p-4 rounded-xl">
                <div className="flex flex-wrap gap-2">
                  {availableSlots.map((slot: string) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => toggleSlot(slot)}
                      className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                        selectedSlots.includes(slot)
                          ? "bg-[#7C8D8C] text-white"
                          : "bg-white text-[#2F3B3D] hover:bg-[#D6CFBF]"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Total Price */}
          {selectedSlots.length > 0 && (
            <div className="bg-[#7C8D8C] text-white p-4 rounded-xl flex items-center justify-between">
              <span>Total ({selectedSlots.length} hour{selectedSlots.length > 1 ? 's' : ''})</span>
              <span className="text-2xl">${totalPrice}</span>
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
              disabled={!selectedSubject || !selectedLevel || selectedSlots.length === 0}
              className="flex-1 px-6 py-3 bg-[#7C8D8C] text-white rounded-full hover:bg-[#2F3B3D] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Request
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
