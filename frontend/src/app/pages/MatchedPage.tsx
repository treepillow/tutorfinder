import { useState, useEffect } from "react";
import { ProfileCard } from "../components/ProfileCard";
import { BookingDialog } from "../components/BookingDialog";
import { ProfileDetailDialog } from "../components/ProfileDetailDialog";
import { getCurrentUser, matchApi, profileApi, enrichProfile } from "../utils/api";
import { toast } from "sonner";
import { CircleGuyLonely } from "../components/EmptyState";
import Lottie from "lottie-react";
import circleGuyLoadingData from "../assets/circleGuyLoading.json";

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

        {matches.length === 0 && !loading ? (
          <div className="bg-[#EDE9DF] rounded-3xl p-12 text-center flex flex-col items-center">
            <CircleGuyLonely size={130} />
            <h3 className="text-2xl text-[#2F3B3D] mt-4 mb-2">No matches yet</h3>
            <p className="text-[#2F3B3D]/70 text-sm">Keep swiping to find your perfect match!</p>
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

      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm bg-white/30">
          <Lottie animationData={circleGuyLoadingData} loop autoplay style={{ width: 500, height: 500, transform: 'translateY(-80px)' }} />
        </div>
      )}

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
