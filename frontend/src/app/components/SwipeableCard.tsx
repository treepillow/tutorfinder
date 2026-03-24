import { useState } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { MapPin, X, Heart } from "lucide-react";

interface SwipeableCardProps {
  profile: any;
  onSwipe: (direction: "left" | "right") => void;
  onClick: () => void;
  isTop: boolean;
  userType: "student" | "tutor";
}

export function SwipeableCard({ profile, onSwipe, onClick, isTop, userType }: SwipeableCardProps) {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_: any, info: any) => {
    if (Math.abs(info.offset.x) > 100) {
      const direction = info.offset.x > 0 ? "right" : "left";
      setExitX(info.offset.x > 0 ? 500 : -500);
      onSwipe(direction);
    }
  };

  const handleButtonClick = (direction: "left" | "right", e: React.MouseEvent) => {
    e.stopPropagation();
    setExitX(direction === "right" ? 500 : -500);
    onSwipe(direction);
  };

  const getAge = () => {
    if (profile.age) return profile.age;
    // Calculate from birthday if available
    return 20; // default
  };

  const displaySubjects = profile.subjects?.slice(0, 2) || [];
  const subjectText = displaySubjects
    .map((s: any) => `${s.subject} (${s.level})`)
    .join(", ");

  const rateOrBudget = userType === "student" 
    ? displaySubjects[0]?.hourlyRate 
    : displaySubjects[0]?.budget;

  return (
    <motion.div
      style={{
        x,
        rotate,
        opacity,
        position: isTop ? "relative" : "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: isTop ? 2 : 1,
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={exitX !== 0 ? { x: exitX } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-full"
    >
      <div
        onClick={onClick}
        className="bg-[#E9D8BB] rounded-3xl overflow-hidden shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
      >
        <div className="aspect-[3/4] relative bg-gradient-to-br from-[#C9B08E] to-[#7C8D8C] flex items-center justify-center">
          <div className="text-8xl">{profile.gender === "Female" ? "👩" : "👨"}</div>
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-[#2F3B3D]">
            {getAge()} years
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-3xl text-[#2F3B3D] mb-1">{profile.name}</h3>
            <div className="flex items-center gap-2 text-[#2F3B3D]/70">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{profile.location}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-[#2F3B3D]/70">
              {userType === "student" ? "Teaching" : "Looking for"}
            </div>
            <div className="text-[#2F3B3D]">{subjectText}</div>
          </div>

          {rateOrBudget && (
            <div className="flex items-center justify-between py-3 px-4 bg-[#FFF2D5] rounded-xl">
              <span className="text-sm text-[#2F3B3D]/70">
                {userType === "student" ? "Rate" : "Budget"}
              </span>
              <span className="text-lg text-[#7C8D8C]">
                ${rateOrBudget}/hr
              </span>
            </div>
          )}

          {isTop && (
            <div className="flex gap-4 pt-4">
              <button
                onClick={(e) => handleButtonClick("left", e)}
                className="flex-1 py-4 bg-white rounded-full hover:bg-red-50 transition-all duration-300 flex items-center justify-center group border-2 border-transparent hover:border-red-200"
              >
                <X className="w-6 h-6 text-red-500" />
              </button>
              <button
                onClick={(e) => handleButtonClick("right", e)}
                className="flex-1 py-4 bg-[#7C8D8C] text-white rounded-full hover:bg-[#2F3B3D] transition-all duration-300 flex items-center justify-center group"
              >
                <Heart className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
