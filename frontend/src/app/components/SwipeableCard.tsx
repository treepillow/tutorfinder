import { useRef, useState } from "react";
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
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-18, 18]);
  const dragStartX = useRef(0);
  const [exitX, setExitX] = useState<number | null>(null);

  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-120, -20], [1, 0]);

  const handleDragStart = (_: any, info: any) => {
    dragStartX.current = info.point.x;
  };

  const handleDragEnd = (_: any, info: any) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    if (Math.abs(offset) > 100 || Math.abs(velocity) > 500) {
      const direction = offset > 0 || velocity > 0 ? "right" : "left";
      setExitX(direction === "right" ? 600 : -600);
      onSwipe(direction);
    }
  };

  const handleClick = () => {
    if (Math.abs(x.get()) > 5) return;
    onClick();
  };

  const handleButtonSwipe = (direction: "left" | "right", e: React.MouseEvent) => {
    e.stopPropagation();
    setExitX(direction === "right" ? 600 : -600);
    onSwipe(direction);
  };

  const getAge = () => profile.age ?? 20;

  const displaySubjects = profile.subjects?.slice(0, 2) || [];
  const subjectText = displaySubjects.map((s: any) => `${s.subject} (${s.level})`).join(", ");
  const rateOrBudget = userType === "student"
    ? displaySubjects[0]?.hourlyRate
    : displaySubjects[0]?.budget;

  return (
    <motion.div
      style={{
        x,
        rotate,
        position: isTop ? "relative" : "absolute",
        top: 0, left: 0, right: 0,
        zIndex: isTop ? 2 : 1,
        cursor: isTop ? "grab" : "default",
      }}
      drag={isTop && !exitX ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      whileDrag={{ cursor: "grabbing" }}
      animate={exitX !== null ? { x: exitX, opacity: 0, rotate: exitX > 0 ? 20 : -20 } : { x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="w-full select-none"
    >
      <div onClick={handleClick} className="bg-[#EDE9DF] rounded-3xl overflow-hidden shadow-xl">

        {/* Image area */}
        <div className="aspect-[3/2] relative bg-gradient-to-br from-[#7C8D8C] to-[#2F3B3D] flex items-center justify-center">
          <div className="text-7xl">{profile.gender === "Female" ? "👩" : "👨"}</div>

          {/* LIKE overlay */}
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute inset-0 bg-[#7C8D8C]/20 flex items-center justify-center pointer-events-none"
          >
            <span className="text-white text-4xl font-bold border-4 border-white rounded-xl px-4 py-1 rotate-[-15deg]">
              LIKE
            </span>
          </motion.div>

          {/* NOPE overlay */}
          <motion.div
            style={{ opacity: nopeOpacity }}
            className="absolute inset-0 bg-red-400/20 flex items-center justify-center pointer-events-none"
          >
            <span className="text-red-200 text-4xl font-bold border-4 border-red-200 rounded-xl px-4 py-1 rotate-[15deg]">
              NOPE
            </span>
          </motion.div>
        </div>

        {/* Info */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-3xl text-[#2F3B3D] mb-1">{profile.name}, {getAge()}</h3>
            <div className="flex items-center gap-2 text-[#2F3B3D]/70">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{profile.location}</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-[#2F3B3D]/70">
              {userType === "student" ? "Teaching" : "Looking for"}
            </div>
            <div className="text-[#2F3B3D] text-sm">{subjectText}</div>
          </div>

          {rateOrBudget && (
            <div className="flex items-center justify-between py-3 px-4 bg-[#F5F3EF] rounded-xl">
              <span className="text-sm text-[#2F3B3D]/70">
                {userType === "student" ? "Rate" : "Budget"}
              </span>
              <span className="text-lg text-[#7C8D8C]">${rateOrBudget}/hr</span>
            </div>
          )}

          {isTop && (
            <div className="flex gap-4 pt-2">
              <button
                onClick={(e) => handleButtonSwipe("left", e)}
                className="flex-1 py-4 bg-white rounded-full hover:bg-red-50 transition-all duration-300 flex items-center justify-center border-2 border-transparent hover:border-red-200"
              >
                <X className="w-6 h-6 text-red-500" />
              </button>
              <button
                onClick={(e) => handleButtonSwipe("right", e)}
                className="flex-1 py-4 bg-[#7C8D8C] text-white rounded-full hover:bg-[#2F3B3D] transition-all duration-300 flex items-center justify-center"
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
