import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { MapPin, GraduationCap, Mail, Phone } from "lucide-react";

const CIRCLE_GUY_COLORS = [
  { body: "#4d7fe8", legs: "#3b4dbf", hi: "#6b97f0" },
  { body: "#9b4de8", legs: "#6b29b3", hi: "#b46bf0" },
  { body: "#e8714d", legs: "#b34229", hi: "#f08d6b" },
  { body: "#4dab7f", legs: "#2b7a52", hi: "#6bbf97" },
  { body: "#e84d9b", legs: "#b32970", hi: "#f06bba" },
  { body: "#4db8e8", legs: "#2980b3", hi: "#6bcbf0" },
  { body: "#e8c44d", legs: "#b39229", hi: "#f0d46b" },
];
function CircleGuyAvatar({ id, size = 140 }: { id: number | string; size?: number }) {
  const n = typeof id === "string" ? id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) : Number(id);
  const c = CIRCLE_GUY_COLORS[Math.abs(n) % CIRCLE_GUY_COLORS.length];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <ellipse cx="50" cy="93" rx="20" ry="5" fill="#888" opacity="0.35"/>
      <rect x="31" y="74" width="14" height="15" rx="5" fill={c.legs}/>
      <rect x="55" y="74" width="14" height="15" rx="5" fill={c.legs}/>
      <circle cx="50" cy="46" r="38" fill={c.body}/>
      <circle cx="38" cy="32" r="14" fill={c.hi} opacity="0.35"/>
      <circle cx="37" cy="43" r="10" fill="white"/>
      <circle cx="63" cy="43" r="10" fill="white"/>
      <circle cx="39" cy="45" r="6" fill="#1a1a2e"/>
      <circle cx="65" cy="45" r="6" fill="#1a1a2e"/>
      <path d="M40 60 Q50 69 60 60" stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

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

          {/* Availability (for tutors) */}
          {profile.availability && (
            <div>
              <h4 className="text-lg text-[#2F3B3D] mb-3">Availability</h4>
              <div className="space-y-2">
                {Object.entries(profile.availability).map(([day, slots]: [string, any]) => (
                  <div key={day} className="bg-[#EDE9DF] p-4 rounded-xl">
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
