import { MapPin, Mail, Phone, CalendarPlus, ChevronRight } from "lucide-react";

const CIRCLE_GUY_COLORS = [
  { body: "#4d7fe8", legs: "#3b4dbf", hi: "#6b97f0" },
  { body: "#9b4de8", legs: "#6b29b3", hi: "#b46bf0" },
  { body: "#e8714d", legs: "#b34229", hi: "#f08d6b" },
  { body: "#4dab7f", legs: "#2b7a52", hi: "#6bbf97" },
  { body: "#e84d9b", legs: "#b32970", hi: "#f06bba" },
  { body: "#4db8e8", legs: "#2980b3", hi: "#6bcbf0" },
  { body: "#e8c44d", legs: "#b39229", hi: "#f0d46b" },
];

function getCircleGuyColor(id: number | string) {
  const n = typeof id === "string"
    ? id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
    : Number(id);
  return CIRCLE_GUY_COLORS[Math.abs(n) % CIRCLE_GUY_COLORS.length];
}

function CircleGuyAvatar({ id, size = 80 }: { id: number | string; size?: number }) {
  const c = getCircleGuyColor(id);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
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

interface ProfileCardProps {
  profile: any;
  onClick: () => void;
  userType: "student" | "tutor";
}

export function ProfileCard({ profile, onClick, userType }: ProfileCardProps) {
  const displaySubjects = profile.subjects?.slice(0, 2) || [];
  const subjectText = displaySubjects
    .map((s: any) => `${s.subject} (${s.level})`)
    .join(", ");

  const rateOrBudget = userType === "student" 
    ? displaySubjects[0]?.hourlyRate 
    : displaySubjects[0]?.budget;

  return (
    <div
      onClick={onClick}
      className="bg-[#EDE9DF] rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-full"
    >
      <div className="aspect-[4/3] relative bg-[#EDE9DF] flex items-center justify-center shrink-0">
        <CircleGuyAvatar id={profile.id ?? profile.name} size={110} />
        {profile.age && (
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-[#2F3B3D]">
            {profile.age} years
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Name + subjects + rate */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <h3 className="text-2xl text-[#2F3B3D] group-hover:text-[#7C8D8C] transition-colors leading-tight">
              {profile.name}
            </h3>
            {rateOrBudget && (
              <div className="text-right shrink-0">
                <span className="text-xl font-semibold text-[#7C8D8C]">${rateOrBudget}</span>
                <span className="text-sm text-[#7C8D8C]/70">/hr</span>
              </div>
            )}
          </div>
          <p className="text-sm text-[#2F3B3D]/70 line-clamp-2">{subjectText}</p>
        </div>

        {/* Contact + location grouped (students only) */}
        {userType === "student" && (
          <div className="bg-[#F5F3EF] rounded-xl px-3 py-2.5 space-y-1.5">
            {profile.location && (
              <div className="flex items-center gap-2 text-sm text-[#2F3B3D]/70">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-[#7C8D8C]" />
                <span className="truncate">{profile.location}</span>
              </div>
            )}
            {profile.email && (
              <div className="flex items-center gap-2 text-sm text-[#2F3B3D]/70">
                <Mail className="w-3.5 h-3.5 shrink-0 text-[#7C8D8C]" />
                <span className="truncate">{profile.email}</span>
              </div>
            )}
            {profile.contactNumber && (
              <div className="flex items-center gap-2 text-sm text-[#2F3B3D]/70">
                <Phone className="w-3.5 h-3.5 shrink-0 text-[#7C8D8C]" />
                <span>{profile.contactNumber}</span>
              </div>
            )}
          </div>
        )}

        {/* Spacer pushes CTA to bottom */}
        <div className="flex-1" />

        {/* CTA */}
        <div className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
          userType === "student"
            ? "bg-[#7C8D8C] text-white group-hover:bg-[#2F3B3D]"
            : "bg-[#F5F3EF] text-[#2F3B3D] group-hover:bg-[#D6CFBF]"
        }`}>
          {userType === "student" ? (
            <><CalendarPlus className="w-4 h-4" /> Book a Lesson</>
          ) : (
            <><ChevronRight className="w-4 h-4" /> View Student Details</>
          )}
        </div>
      </div>
    </div>
  );
}
