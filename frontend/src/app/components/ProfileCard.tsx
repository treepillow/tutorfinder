import { MapPin } from "lucide-react";

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
      className="bg-[#EDE9DF] rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
    >
      <div className="aspect-[4/3] relative bg-gradient-to-br from-[#7C8D8C] to-[#2F3B3D] flex items-center justify-center">
        <div className="text-7xl">{profile.gender === "Female" ? "👩" : "👨"}</div>
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-[#2F3B3D]">
          {profile.age || 20} years
        </div>
      </div>

      <div className="p-5 space-y-3">
        <div>
          <h3 className="text-2xl text-[#2F3B3D] mb-1 group-hover:text-[#7C8D8C] transition-colors">
            {profile.name}
          </h3>
          <div className="flex items-center gap-2 text-[#2F3B3D]/70">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{profile.location}</span>
          </div>
        </div>

        <div className="text-sm text-[#2F3B3D] line-clamp-2">
          {subjectText}
        </div>

        {rateOrBudget && (
          <div className="flex items-center justify-between py-2 px-3 bg-[#F5F3EF] rounded-lg">
            <span className="text-sm text-[#2F3B3D]/70">
              {userType === "student" ? "Rate" : "Budget"}
            </span>
            <span className="text-[#7C8D8C]">
              ${rateOrBudget}/hr
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
