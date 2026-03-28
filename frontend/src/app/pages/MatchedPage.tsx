import { useState, useEffect } from "react";
import { ProfileCard } from "../components/ProfileCard";
import { BookingDialog } from "../components/BookingDialog";
import { ProfileDetailDialog } from "../components/ProfileDetailDialog";
import { getCurrentUser, matchApi, profileApi, enrichProfile } from "../utils/api";
import { toast } from "sonner";

export function MatchedPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      loadMatches(user.id);
    }
  }, []);

  const loadMatches = async (userId: number) => {
    setLoading(true);
    try {
      // Get all match records
      const matchRecords = await matchApi.getMatches(userId);

      // Fetch profile for each matched user
      const profilePromises = matchRecords.map(async (m: any) => {
        try {
          const profile = await profileApi.getProfile(m.other_user_id);
          return enrichProfile(profile);
        } catch {
          return null;
        }
      });

      const profiles = (await Promise.all(profilePromises)).filter(Boolean);
      setMatches(profiles);
    } catch (err: any) {
      console.error("Failed to load matches:", err);
      toast.error("Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

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

        {loading ? (
          <div className="bg-[#EDE9DF] rounded-3xl p-16 text-center">
            <p className="text-[#2F3B3D]/70 animate-pulse">Loading matches...</p>
          </div>
        ) : matches.length === 0 ? (
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
          currentUser={currentUser}
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
            setSelectedProfile(null);
          }}
          onReject={() => setSelectedProfile(null)}
        />
      )}
    </div>
  );
}
