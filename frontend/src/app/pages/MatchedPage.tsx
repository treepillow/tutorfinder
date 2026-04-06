import { useState, useEffect } from "react";
import { ProfileCard } from "../components/ProfileCard";
import { BookingDialog } from "../components/BookingDialog";
import { ProfileDetailDialog } from "../components/ProfileDetailDialog";
import { getCurrentUser, matchApi, profileApi, enrichProfile, reviewApi } from "../utils/api";
import { toast } from "sonner";
import { io } from "socket.io-client";
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
    if (!user) return;
    setCurrentUser(user);
    loadMatches(user.id);

    const socket = io(import.meta.env.VITE_MATCH_SERVICE, { transports: ["websocket"] });
    socket.on("new_match", (match: any) => {
      if (match.user_a_id === user.id || match.user_b_id === user.id) {
        toast("New match!", { description: "Someone matched with you." });
        loadMatches(user.id, true);
      }
    });
    return () => { socket.disconnect(); };
  }, []);

  const loadMatches = async (userId: number, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const matchRecords = await matchApi.getMatches(userId);

      const profilePromises = matchRecords.map(async (m: any) => {
        try {
          const profile = await profileApi.getProfile(m.other_user_id);
          return { ...enrichProfile(profile), _matchedAt: m.created_at };
        } catch {
          return null;
        }
      });

      const profiles = (await Promise.all(profilePromises)).filter(Boolean);

      // Fetch average rating for each tutor
      const withRatings = await Promise.all(
        profiles.map(async (profile: any) => {
          if (profile.userType !== "tutor") return profile;
          try {
            const reviews = await reviewApi.getByTutor(profile.id);
            const list = Array.isArray(reviews) ? reviews : [];
            const avg = list.length > 0
              ? list.reduce((sum: number, r: any) => sum + (r.Rating || r.rating || 0), 0) / list.length
              : null;
            return { ...profile, avgRating: avg, reviewCount: list.length };
          } catch {
            return profile;
          }
        })
      );

      // newest match first → oldest match last
      withRatings.sort((a: any, b: any) => new Date(b._matchedAt).getTime() - new Date(a._matchedAt).getTime());
      setMatches(withRatings);
    } catch (err: any) {
      console.error("Failed to load matches:", err);
      toast.error("Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileClick = (profile: any) => {
    setSelectedProfile(profile);
    if (currentUser?.userType === "student") {
      setShowBooking(true);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl tracking-tight text-[#2F3B3D] mb-2">Matches</h1>
          <p className="text-[#2F3B3D]/70">
            {currentUser.userType === "student"
              ? "Your matched tutors — tap a card to book a lesson"
              : "Students who matched with you — tap a card to view their details"}
          </p>
        </div>

        {matches.length === 0 && !loading ? (
          <div className="bg-[#EDE9DF] rounded-3xl p-12 text-center flex flex-col items-center">
            <CircleGuyLonely size={130} />
            <h3 className="text-2xl text-[#2F3B3D] mt-4 mb-2">No matches yet</h3>
            <p className="text-[#2F3B3D]/70 text-sm">Keep swiping to find your perfect match!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
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
          <Lottie animationData={circleGuyLoadingData} loop autoplay style={{ width: 500, height: 500, transform: "translateY(-80px)" }} />
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
          showActions={false}
          showContact={true}
        />
      )}
    </div>
  );
}
