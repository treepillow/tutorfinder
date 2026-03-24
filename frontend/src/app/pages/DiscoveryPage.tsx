import { useState, useEffect } from "react";
import { getMockProfiles } from "../utils/mockData";
import { SwipeableCard } from "../components/SwipeableCard";
import { ProfileDetailDialog } from "../components/ProfileDetailDialog";
import { MatchDialog } from "../components/MatchDialog";

export function DiscoveryPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser(user);
      
      // Load profiles based on user type
      const mockProfiles = getMockProfiles(user.userType);
      setProfiles(mockProfiles);
    }
  }, []);

  const handleSwipe = (direction: "left" | "right", profile: any) => {
    if (direction === "right") {
      // Simulate matching (50% chance for demo)
      const isMatch = Math.random() > 0.5;
      
      if (isMatch) {
        // Add to matches
        const matches = JSON.parse(localStorage.getItem("matches") || "[]");
        matches.push(profile);
        localStorage.setItem("matches", JSON.stringify(matches));
        
        setMatchedProfile(profile);
        setShowMatchDialog(true);
      }
      
      // Store the swipe
      const swipes = JSON.parse(localStorage.getItem("swipes") || "[]");
      swipes.push({ profileId: profile.id, direction: "right" });
      localStorage.setItem("swipes", JSON.stringify(swipes));
    }

    // Move to next profile
    setCurrentIndex(currentIndex + 1);
  };

  const handleCardClick = (profile: any) => {
    setSelectedProfile(profile);
  };

  const currentProfile = profiles[currentIndex];

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl tracking-tight text-[#2F3B3D] mb-2">
            Discover
          </h1>
          <p className="text-[#2F3B3D]/70">
            {currentUser.userType === "student"
              ? "Find your perfect tutor"
              : "Connect with students"}
          </p>
        </div>

        {currentIndex < profiles.length ? (
          <div className="relative">
            {profiles.slice(currentIndex, currentIndex + 2).map((profile, idx) => (
              <SwipeableCard
                key={profile.id}
                profile={profile}
                onSwipe={(direction) => handleSwipe(direction, profile)}
                onClick={() => handleCardClick(profile)}
                isTop={idx === 0}
                userType={currentUser.userType}
              />
            ))}
          </div>
        ) : (
          <div className="bg-[#E9D8BB] rounded-3xl p-16 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl text-[#2F3B3D] mb-2">
              You've seen everyone!
            </h3>
            <p className="text-[#2F3B3D]/70">
              Check back later for new profiles
            </p>
          </div>
        )}
      </div>

      {selectedProfile && (
        <ProfileDetailDialog
          profile={selectedProfile}
          userType={currentUser.userType}
          onClose={() => setSelectedProfile(null)}
          showActions={false}
        />
      )}

      {showMatchDialog && matchedProfile && (
        <MatchDialog
          profile={matchedProfile}
          onClose={() => {
            setShowMatchDialog(false);
            setMatchedProfile(null);
          }}
        />
      )}
    </div>
  );
}
