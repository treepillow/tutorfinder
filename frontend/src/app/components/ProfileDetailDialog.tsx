import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { MapPin, GraduationCap, Mail, Phone } from "lucide-react";

interface ProfileDetailDialogProps {
  profile: any;
  userType: "student" | "tutor";
  onClose: () => void;
  showActions?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
}

export function ProfileDetailDialog({
  profile,
  userType,
  onClose,
  showActions = false,
  onAccept,
  onReject,
}: ProfileDetailDialogProps) {
  const getAge = () => {
    if (profile.age) return profile.age;
    return 20;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-[#FFF2D5] border-[#C9B08E] max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl text-[#2F3B3D]">{profile.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="aspect-[3/2] relative bg-gradient-to-br from-[#C9B08E] to-[#7C8D8C] rounded-2xl flex items-center justify-center">
            <div className="text-9xl">{profile.gender === "Female" ? "👩" : "👨"}</div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#E9D8BB] p-4 rounded-xl">
              <div className="text-sm text-[#2F3B3D]/70 mb-1">Age</div>
              <div className="text-lg text-[#2F3B3D]">{getAge()} years</div>
            </div>
            <div className="bg-[#E9D8BB] p-4 rounded-xl">
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

          {/* Contact (for matched profiles) */}
          {showActions && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#2F3B3D]">
                <Mail className="w-5 h-5 text-[#7C8D8C]" />
                <span>contact@email.com</span>
              </div>
              <div className="flex items-center gap-2 text-[#2F3B3D]">
                <Phone className="w-5 h-5 text-[#7C8D8C]" />
                <span>+65 1234 5678</span>
              </div>
            </div>
          )}

          {/* Subjects */}
          <div>
            <h4 className="text-lg text-[#2F3B3D] mb-3">
              {userType === "student" ? "Teaching Subjects" : "Interested Subjects"}
            </h4>
            <div className="space-y-2">
              {profile.subjects?.map((subject: any, index: number) => (
                <div key={index} className="bg-[#E9D8BB] p-4 rounded-xl">
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

          {/* Availability (for tutors) */}
          {profile.availability && (
            <div>
              <h4 className="text-lg text-[#2F3B3D] mb-3">Availability</h4>
              <div className="space-y-2">
                {Object.entries(profile.availability).map(([day, slots]: [string, any]) => (
                  <div key={day} className="bg-[#E9D8BB] p-4 rounded-xl">
                    <div className="text-[#2F3B3D] mb-2">{day}</div>
                    <div className="flex flex-wrap gap-2">
                      {slots.map((slot: string) => (
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
            </div>
          )}

          {/* Actions */}
          {showActions && onAccept && onReject && (
            <div className="flex gap-4">
              <button
                onClick={onReject}
                className="flex-1 px-6 py-3 bg-white text-[#2F3B3D] rounded-full border-2 border-[#C9B08E] hover:bg-[#E9D8BB] transition-all duration-300"
              >
                Close
              </button>
              <button
                onClick={onAccept}
                className="flex-1 px-6 py-3 bg-[#7C8D8C] text-white rounded-full hover:bg-[#2F3B3D] transition-all duration-300"
              >
                Message
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
