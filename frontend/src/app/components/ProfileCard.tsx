import { MapPin, Mail, Phone, CalendarPlus, ChevronRight } from "lucide-react";
import { CircleGuyAvatar } from "./CircleGuyAvatar";

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
