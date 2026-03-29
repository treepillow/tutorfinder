import { useState, useEffect } from "react";
import { ProfileCard } from "../components/ProfileCard";
import { BookingDialog } from "../components/BookingDialog";
import { ProfileDetailDialog } from "../components/ProfileDetailDialog";

export function MatchedPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }

    const matchedProfiles = JSON.parse(localStorage.getItem("matches") || "[]");
    setMatches(matchedProfiles);
  }, []);

  const handleProfileClick = (profile: any) => {
    setSelectedProfile(profile);
    
    // Students can book, tutors just view
    if (currentUser?.userType === "student") {
      setShowBooking(true);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl tracking-tight text-[#2F3B3D] mb-2">
            Matches
          </h1>
          <p className="text-[#2F3B3D]/70">
            {currentUser.userType === "student"
              ? "Your matched tutors - click to book a lesson"
              : "Students who matched with you"}
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="bg-[#EDE9DF] rounded-3xl p-16 text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-2xl text-[#2F3B3D] mb-2">
              No matches yet
            </h3>
            <p className="text-[#2F3B3D]/70">
              Keep swiping to find your perfect match!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onClick={() => handleProfileClick(profile)}
                userType={currentUser.userType}
              />
            ))}
          </div>
        )}
      </div>

      {selectedProfile && currentUser.userType === "student" && showBooking && (
        <BookingDialog
          profile={selectedProfile}
          onClose={() => {
            setSelectedProfile(null);
            setShowBooking(false);
          }}
        />
      )}

      {selectedProfile && currentUser.userType === "tutor" && (
        <ProfileDetailDialog
          profile={selectedProfile}
          userType={currentUser.userType}
          onClose={() => setSelectedProfile(null)}
          showActions={true}
          onAccept={() => {
            // Handle messaging
            setSelectedProfile(null);
          }}
          onReject={() => setSelectedProfile(null)}
        />
      )}
    </div>
  );
}
