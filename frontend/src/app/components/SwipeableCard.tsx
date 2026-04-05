import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { MapPin, X, Heart } from "lucide-react";

import cowboyGuy from "../assets/cowboyGuy.png";
import lilGuy from "../assets/lilGuy.png";
import peakyGuy from "../assets/peakyGuy.png";
import searchingGuy from "../assets/searchingGuy.png";
import sleepyGuy from "../assets/sleepyGuy.png";
import swaggyGuy from "../assets/swaggyGuy.png";
import wizardGuy from "../assets/wizardGuy.png";

const AVATARS = [cowboyGuy, lilGuy, peakyGuy, searchingGuy, sleepyGuy, swaggyGuy, wizardGuy];

function getAvatar(id: number | string) {
  const n = typeof id === "string"
    ? id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
    : Number(id);
  return AVATARS[Math.abs(n) % AVATARS.length];
}

function CircleGuyAvatar({ id, size = 96 }: { id: number | string; size?: number }) {
  return (
    <img src={getAvatar(id)} alt="avatar" width={size} height={size} style={{ objectFit: "contain" }} />
  );
}

interface SwipeableCardProps {
  profile: any;
  onSwipe: (direction: "left" | "right") => void;
  onClick: () => void;
  isTop: boolean;
  userType: "student" | "tutor";
  forceSwipe?: "left" | "right" | null;
}

export function SwipeableCard({ profile, onSwipe, onClick, isTop, userType, forceSwipe }: SwipeableCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-18, 18]);
  const dragStartX = useRef(0);
  const [exitX, setExitX] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const triggerSwipe = (direction: "left" | "right") => {
    setExitX(direction === "right" ? 600 : -600);
    onSwipe(direction);
  };

  // forceSwipe from keyboard
  useEffect(() => {
    if (!forceSwipe) return;
    triggerSwipe(forceSwipe);
  }, [forceSwipe]);

  // Non-passive wheel listener — also attach to document to intercept browser back gesture
  useEffect(() => {
    const el = cardRef.current;
    if (!el || !isTop) return;

    const wheelAccum = { value: 0 };
    let timer: ReturnType<typeof setTimeout> | null = null;

    const onWheel = (e: WheelEvent) => {
      if (exitX !== null) return;
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
      e.preventDefault();
      e.stopPropagation();

      wheelAccum.value += e.deltaX;
      x.set(x.get() - e.deltaX * 0.8);

      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const accum = wheelAccum.value;
        wheelAccum.value = 0;
        if (Math.abs(accum) > 30) {
          const direction = accum < 0 ? "right" : "left";
          setExitX(direction === "right" ? 600 : -600);
          onSwipe(direction);
        } else {
          x.set(0); // snap back
        }
      }, 80);
    };

    document.addEventListener("wheel", onWheel, { passive: false });
    return () => document.removeEventListener("wheel", onWheel);
  }, [isTop, exitX, x, onSwipe]);

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

  const getAge = () => profile.age ?? "?";
  const displaySubjects = profile.subjects?.slice(0, 2) || [];
  const subjectText = displaySubjects.map((s: any) => `${s.subject} (${s.level})`).join(", ");
  const rateOrBudget = userType === "student"
    ? displaySubjects[0]?.hourlyRate
    : displaySubjects[0]?.budget;

  return (
    <motion.div
      ref={cardRef}
      style={{
        x,
        rotate,
        position: isTop ? "relative" : "absolute",
        top: 0, left: 0, right: 0,
        zIndex: isTop ? 2 : 1,
        cursor: isTop ? "grab" : "default",
        overscrollBehaviorX: "none",
      } as any}
      drag={isTop && exitX === null ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      whileDrag={{ cursor: "grabbing" }}
      animate={exitX !== null ? { x: exitX, opacity: 0, rotate: exitX > 0 ? 20 : -20 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="w-full select-none"
    >
      <div onClick={handleClick} className="bg-[#EDE9DF] rounded-3xl overflow-hidden shadow-xl">

        {/* Image area */}
        <div className="aspect-[3/2] relative bg-[#D6CFBF] flex items-center justify-center">
<CircleGuyAvatar id={profile.id ?? profile.name} size={140} />
          <div className="absolute bottom-3 right-3 bg-black/20 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
            tap for details
          </div>
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
                onClick={(e) => { e.stopPropagation(); triggerSwipe("left"); }}
                className="flex-1 py-4 bg-white rounded-full hover:bg-red-50 transition-all duration-300 flex items-center justify-center border-2 border-transparent hover:border-red-200"
              >
                <X className="w-6 h-6 text-red-500" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); triggerSwipe("right"); }}
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
