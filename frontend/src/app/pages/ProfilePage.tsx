import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, GraduationCap, BookOpen, Calendar } from "lucide-react";

export function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  if (!currentUser) {
    return null;
  }

  const isTutor = currentUser.userType === "tutor";

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl tracking-tight text-[#2F3B3D] mb-2">
            Profile
          </h1>
          <p className="text-[#2F3B3D]/70">
            Your account information
          </p>
        </div>

        <div className="bg-[#E9D8BB] rounded-3xl p-8 space-y-8">
          {/* Profile Picture */}
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 bg-gradient-to-br from-[#C9B08E] to-[#7C8D8C] rounded-full flex items-center justify-center text-6xl">
              {currentUser.gender === "Female" ? "👩" : "👨"}
            </div>
            <div>
              <h2 className="text-3xl text-[#2F3B3D] mb-2">{currentUser.name}</h2>
              <div className="inline-block px-4 py-1 bg-[#7C8D8C] text-white text-sm rounded-full">
                {isTutor ? "Tutor" : "Student"}
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h3 className="text-xl text-[#2F3B3D] mb-4">Basic Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[#FFF2D5] p-4 rounded-xl">
                <div className="text-sm text-[#2F3B3D]/70 mb-1">Email</div>
                <div className="flex items-center gap-2 text-[#2F3B3D]">
                  <Mail className="w-4 h-4" />
                  <span>{currentUser.email}</span>
                </div>
              </div>

              <div className="bg-[#FFF2D5] p-4 rounded-xl">
                <div className="text-sm text-[#2F3B3D]/70 mb-1">Phone</div>
                <div className="flex items-center gap-2 text-[#2F3B3D]">
                  <Phone className="w-4 h-4" />
                  <span>{currentUser.contactNumber}</span>
                </div>
              </div>

              <div className="bg-[#FFF2D5] p-4 rounded-xl">
                <div className="text-sm text-[#2F3B3D]/70 mb-1">Birthday</div>
                <div className="flex items-center gap-2 text-[#2F3B3D]">
                  <Calendar className="w-4 h-4" />
                  <span>{currentUser.birthday}</span>
                </div>
              </div>

              <div className="bg-[#FFF2D5] p-4 rounded-xl">
                <div className="text-sm text-[#2F3B3D]/70 mb-1">Gender</div>
                <div className="text-[#2F3B3D]">{currentUser.gender}</div>
              </div>

              <div className="bg-[#FFF2D5] p-4 rounded-xl">
                <div className="text-sm text-[#2F3B3D]/70 mb-1">Location</div>
                <div className="flex items-center gap-2 text-[#2F3B3D]">
                  <MapPin className="w-4 h-4" />
                  <span>{currentUser.location}</span>
                </div>
              </div>

              {isTutor && (
                <div className="bg-[#FFF2D5] p-4 rounded-xl">
                  <div className="text-sm text-[#2F3B3D]/70 mb-1">Qualification</div>
                  <div className="flex items-center gap-2 text-[#2F3B3D]">
                    <GraduationCap className="w-4 h-4" />
                    <span>{currentUser.qualification}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Subjects */}
          <div>
            <h3 className="text-xl text-[#2F3B3D] mb-4">
              {isTutor ? "Teaching Subjects" : "Learning Subjects"}
            </h3>
            <div className="space-y-3">
              {currentUser.subjects?.map((subject: any, index: number) => (
                <div key={index} className="bg-[#FFF2D5] p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-[#7C8D8C]" />
                      <div>
                        <div className="text-[#2F3B3D]">{subject.subject}</div>
                        <div className="text-sm text-[#2F3B3D]/70">{subject.level}</div>
                      </div>
                    </div>
                    <div className="text-xl text-[#7C8D8C]">
                      ${subject.hourlyRate || subject.budget}/hr
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Availability (for tutors) */}
          {isTutor && currentUser.availability && (
            <div>
              <h3 className="text-xl text-[#2F3B3D] mb-4">Availability</h3>
              <div className="space-y-3">
                {Object.entries(currentUser.availability).map(([day, slots]: [string, any]) => (
                  <div key={day} className="bg-[#FFF2D5] p-4 rounded-xl">
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
        </div>
      </div>
    </div>
  );
}
