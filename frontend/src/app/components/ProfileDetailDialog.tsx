import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { MapPin, GraduationCap, Mail, Phone } from "lucide-react";
import { availabilityApi } from "../utils/api";
import { CircleGuyAvatar } from "./CircleGuyAvatar";

function slotsToWeeklyAvailability(slots: any[]): Record<string, string[]> {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const result: Record<string, string[]> = {};
  for (const slot of slots) {
    const date = new Date(slot.date + "T00:00:00");
    const day = dayNames[date.getDay()];
    const start = slot.start_time.slice(0, 5);
    const end = slot.end_time.slice(0, 5);
    const timeSlot = `${start}-${end}`;
    if (!result[day]) result[day] = [];
    if (!result[day].includes(timeSlot)) result[day].push(timeSlot);
  }
  return result;
}

interface ProfileDetailDialogProps {
  profile: any;
  userType: "student" | "tutor";
  onClose: () => void;
  showActions?: boolean;
  showContact?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
}

export function ProfileDetailDialog({
  profile,
  userType,
  onClose,
  showActions = false,
  showContact = false,
  onAccept,
  onReject,
}: ProfileDetailDialogProps) {
  const getAge = () => profile.age ?? "—";
  const [availability, setAvailability] = useState<Record<string, string[]> | null>(null);

  useEffect(() => {
    if (profile.userType !== "tutor") return;
    // If availability is already pre-loaded and in the right shape, use it
    if (profile.availability && typeof profile.availability === "object") {
      const values = Object.values(profile.availability);
      if (values.length > 0 && Array.isArray(values[0])) {
        setAvailability(profile.availability);
        return;
      }
    }
    // Otherwise fetch from backend
    availabilityApi.getSlots(profile.id).then((res: any) => {
      const slots = res.availability || [];
      setAvailability(slots.length > 0 ? slotsToWeeklyAvailability(slots) : {});
    }).catch(() => setAvailability({}));
  }, [profile.id, profile.userType]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-[#F5F3EF] border-[#D6CFBF] max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl text-[#2F3B3D]">{profile.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="aspect-[3/2] relative bg-[#EDE9DF] rounded-2xl flex items-center justify-center">
            <CircleGuyAvatar id={profile.id ?? profile.name} size={160} />
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#EDE9DF] p-4 rounded-xl">
              <div className="text-sm text-[#2F3B3D]/70 mb-1">Age</div>
              <div className="text-lg text-[#2F3B3D]">{getAge()} years</div>
            </div>
            <div className="bg-[#EDE9DF] p-4 rounded-xl">
              <div className="text-sm text-[#2F3B3D]/70 mb-1">Gender</div>
              <div className="text-lg text-[#2F3B3D]">{profile.gender}</div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-[#2F3B3D]">
            <MapPin className="w-5 h-5 text-[#7C8D8C]" />
            <span>{profile.location}</span>
          </div>

          {/* Qualification (for tutors) */}
          {profile.qualification && (
            <div className="flex items-center gap-2 text-[#2F3B3D]">
              <GraduationCap className="w-5 h-5 text-[#7C8D8C]" />
              <span>{profile.qualification}</span>
            </div>
          )}

          {/* Contact details — only shown on matched page */}
          {showContact && (
            <div className="space-y-2">
              {profile.email && (
                <div className="flex items-center gap-2 text-[#2F3B3D]">
                  <Mail className="w-5 h-5 text-[#7C8D8C]" />
                  <span>{profile.email}</span>
                </div>
              )}
              {profile.contactNumber && (
                <div className="flex items-center gap-2 text-[#2F3B3D]">
                  <Phone className="w-5 h-5 text-[#7C8D8C]" />
                  <span>{profile.contactNumber}</span>
                </div>
              )}
            </div>
          )}

          {/* Subjects */}
          <div>
            <h4 className="text-lg text-[#2F3B3D] mb-3">
              {userType === "student" ? "Teaching Subjects" : "Interested Subjects"}
            </h4>
            <div className="space-y-2">
              {profile.subjects?.map((subject: any, index: number) => (
                <div key={index} className="bg-[#EDE9DF] p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[#2F3B3D]">{subject.subject}</div>
                      <div className="text-sm text-[#2F3B3D]/70">{subject.level}</div>
                    </div>
                    <div className="text-lg text-[#7C8D8C]">
                      ${subject.hourlyRate || subject.budget}/hr
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Availability (for tutors only) */}
          {profile.userType === "tutor" && (
            <div>
              <h4 className="text-lg text-[#2F3B3D] mb-3">Availability</h4>
              {availability === null ? (
                <p className="text-sm text-[#2F3B3D]/50">Loading...</p>
              ) : Object.keys(availability).length === 0 ? (
                <p className="text-sm text-[#2F3B3D]/50">No availability set</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(availability).map(([day, slots]) => (
                    <div key={day} className="bg-[#EDE9DF] p-4 rounded-xl">
                      <div className="text-[#2F3B3D] mb-2">{day}</div>
                      <div className="flex flex-wrap gap-2">
                        {slots.map((slot) => (
                          <span
                            key={slot}
                            className="px-3 py-1 bg-[#7C8D8C] text-white text-sm rounded-full"
                          >
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {showActions && onAccept && onReject && (
            <div className="flex gap-4">
              <button
                onClick={onReject}
                className="flex-1 px-6 py-3 bg-white text-[#2F3B3D] rounded-full border-2 border-[#D6CFBF] hover:bg-[#EDE9DF] transition-all duration-300"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
