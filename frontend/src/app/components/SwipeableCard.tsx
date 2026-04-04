import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { MapPin, X, Heart } from "lucide-react";

// body, legs, highlight
const CIRCLE_GUY_COLORS = [
  { body: "#4d7fe8", legs: "#3b4dbf", hi: "#6b97f0" }, // blue (original)
  { body: "#9b4de8", legs: "#6b29b3", hi: "#b46bf0" }, // purple
  { body: "#e8714d", legs: "#b34229", hi: "#f08d6b" }, // orange
  { body: "#4dab7f", legs: "#2b7a52", hi: "#6bbf97" }, // green
  { body: "#e84d9b", legs: "#b32970", hi: "#f06bba" }, // pink
  { body: "#4db8e8", legs: "#2980b3", hi: "#6bcbf0" }, // cyan
  { body: "#e8c44d", legs: "#b39229", hi: "#f0d46b" }, // yellow
];

function getCircleGuyColor(id: number | string) {
  const n = typeof id === "string"
    ? id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
    : Number(id);
  return CIRCLE_GUY_COLORS[Math.abs(n) % CIRCLE_GUY_COLORS.length];
}

function CircleGuyAvatar({ id, size = 96 }: { id: number | string; size?: number }) {
  const c = getCircleGuyColor(id);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="93" rx="20" ry="5" fill="#888" opacity="0.35"/>
      <rect x="31" y="74" width="14" height="15" rx="5" fill={c.legs}/>
      <rect x="55" y="74" width="14" height="15" rx="5" fill={c.legs}/>
      <circle cx="50" cy="46" r="38" fill={c.body}/>
      <circle cx="38" cy="32" r="14" fill={c.hi} opacity="0.35"/>
      <circle cx="37" cy="43" r="10" fill="white"/>
      <circle cx="63" cy="43" r="10" fill="white"/>
      <circle cx="39" cy="45" r="6" fill="#1a1a2e"/>
      <circle cx="65" cy="45" r="6" fill="#1a1a2e"/>
      <path d="M40 60 Q50 69 60 60" stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round"/>
    </svg>
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

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
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

  const getAge = () => profile.age ?? 20;
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
        <div className="aspect-[3/2] relative bg-[#EDE9DF] flex items-center justify-center">
          <CircleGuyAvatar id={profile.id ?? profile.name} size={140} />
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
