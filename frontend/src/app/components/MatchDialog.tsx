import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import confetti from "canvas-confetti";
import Lottie from "lottie-react";
import { Dialog, DialogContent } from "./ui/dialog";
import { getCurrentUser } from "../utils/api";
import circleGuyIdleData from "../assets/circleGuyIdle.json";

const CIRCLE_GUY_COLORS = [
  { body: "#4d7fe8", legs: "#3b4dbf", hi: "#6b97f0" },
  { body: "#9b4de8", legs: "#6b29b3", hi: "#b46bf0" },
  { body: "#e8714d", legs: "#b34229", hi: "#f08d6b" },
  { body: "#4dab7f", legs: "#2b7a52", hi: "#6bbf97" },
  { body: "#e84d9b", legs: "#b32970", hi: "#f06bba" },
  { body: "#4db8e8", legs: "#2980b3", hi: "#6bcbf0" },
  { body: "#e8c44d", legs: "#b39229", hi: "#f0d46b" },
];
function CircleGuyAvatar({ id, size = 56 }: { id: number | string; size?: number }) {
  const n = typeof id === "string" ? id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) : Number(id);
  const c = CIRCLE_GUY_COLORS[Math.abs(n) % CIRCLE_GUY_COLORS.length];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
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


const CONFETTI_COLORS = ["#F44336","#FF9800","#FFEB3B","#4CAF50","#2196F3","#9C27B0","#FF4081","#00BCD4"];

function FloatingConfetti() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let alive = true;

    const spawn = () => {
      if (!alive) return;
      const el = document.createElement("div");
      const size = 4 + Math.random() * 5;
      const isRect = Math.random() > 0.5;
      const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      // Spawn near the top of the mascot area
      const startX = 5 + Math.random() * 90;
      const startY = 5 + Math.random() * 30;
      el.style.cssText = `
        position:absolute;
        width:${size}px; height:${isRect ? size * 2.2 : size}px;
        background:${color};
        border-radius:${isRect ? "2px" : "50%"};
        left:${startX}%; top:${startY}%;
        opacity:0;
        pointer-events:none;
      `;
      container.appendChild(el);

      gsap.fromTo(el,
        { opacity: 0, y: 0, rotation: Math.random() * 360, scale: 0.7 },
        {
          opacity: 0.4,
          y: 40 + Math.random() * 40,
          x: (Math.random() - 0.5) * 22,
          rotation: `+=${Math.random() * 200 - 100}`,
          scale: 1,
          duration: 0.8 + Math.random() * 0.4,
          ease: "power1.in",
          onComplete: () => gsap.to(el, {
            opacity: 0,
            y: `+=${15 + Math.random() * 15}`,
            duration: 0.4,
            ease: "power1.in",
            onComplete: () => el.remove(),
          }),
        }
      );
    };

    // Stagger initial spawns then keep a slow trickle
    for (let i = 0; i < 6; i++) setTimeout(spawn, i * 120);
    const interval = setInterval(spawn, 280);

    return () => { alive = false; clearInterval(interval); };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ overflow: "visible" }}
    />
  );
}

interface MatchDialogProps {
  profile: any;
  onClose: () => void;
}

export function MatchDialog({ profile, onClose }: MatchDialogProps) {
  const mascotRef  = useRef<HTMLDivElement>(null);
  const titleRef   = useRef<HTMLDivElement>(null);
  const avatarsRef = useRef<HTMLDivElement>(null);
  const btnRef     = useRef<HTMLButtonElement>(null);
  const currentUser = getCurrentUser();

  useEffect(() => {
    // Single confetti burst on open
    const burst = (originX: number) =>
      confetti({
        particleCount: 70,
        spread: 80,
        startVelocity: 45,
        scalar: 1.4,
        shapes: ["rect"] as confetti.Shape[],
        colors: ["#F44336","#FF9800","#FFEB3B","#4CAF50","#2196F3","#9C27B0","#FF4081"],
        origin: { x: originX, y: 0.5 },
      });

    burst(0.25);
    burst(0.75);
    const t = setTimeout(() => { burst(0.2); burst(0.8); }, 500);

    // Entrance animations
    const tl = gsap.timeline();
    tl.fromTo(mascotRef.current,
      { scale: 0.4, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.55, ease: "back.out(2.5)" }
    );

    // Gentle celebratory bob — small jump, single wiggle, long pause
    const jumpLoop = () => {
      gsap.timeline({ onComplete: jumpLoop })
        .to(mascotRef.current, { y: -10, scaleY: 1.06, scaleX: 0.96, duration: 0.22, ease: "power2.out" })
        .to(mascotRef.current, { y: 0,   scaleY: 0.96, scaleX: 1.04, duration: 0.18, ease: "bounce.out" })
        .to(mascotRef.current, { scaleY: 1, scaleX: 1, duration: 0.1 })
        .to(mascotRef.current, { rotation: 6,  duration: 0.1, ease: "sine.inOut" })
        .to(mascotRef.current, { rotation: -6, duration: 0.1, ease: "sine.inOut" })
        .to(mascotRef.current, { rotation: 0,  duration: 0.1, ease: "sine.inOut" })
        .to(mascotRef.current, { duration: 0.6 }); // long pause between jumps
    };
    const jumpDelay = setTimeout(jumpLoop, 600);

    tl.fromTo(titleRef.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.36, ease: "power2.out" },
      "-=0.15"
    );
    tl.fromTo(avatarsRef.current,
      { opacity: 0, scale: 0.85 },
      { opacity: 1, scale: 1, duration: 0.36, ease: "back.out(1.8)" },
      "-=0.1"
    );
    tl.fromTo(btnRef.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.26, ease: "power2.out" },
      "-=0.05"
    );

    return () => { clearTimeout(t); clearTimeout(jumpDelay); };
  }, []);

  const myInitial    = (currentUser?.name ?? "?").charAt(0).toUpperCase();
  const theirInitial = profile.name.charAt(0).toUpperCase();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-[#F5F3EF] border-[#D6CFBF]">
        <div className="text-center py-4 px-2">

          {/* Real mascot + faint floating confetti */}
          <div ref={mascotRef} className="relative mx-auto" style={{ width: 150, height: 150 }}>
            <FloatingConfetti />
            <Lottie
              animationData={circleGuyIdleData}
              autoplay={true}
              loop={true}
              style={{ width: 150, height: 150 }}
            />
          </div>

          {/* Title — sits close to mascot */}
          <div ref={titleRef} className="mt-2">
            <h2 className="text-3xl font-bold tracking-tight text-[#2F3B3D]">
              It's a Match!
            </h2>
            <p className="text-[#2F3B3D]/60 text-sm mt-1">
              You and <span className="font-semibold text-[#2F3B3D]">{profile.name}</span> liked each other
            </p>
          </div>

          {/* You + Heart + Them */}
          <div ref={avatarsRef} className="flex items-center justify-center gap-4 mt-3">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-16 h-16 rounded-full bg-[#EDE9DF] flex items-center justify-center shadow-md overflow-hidden">
                <CircleGuyAvatar id={currentUser?.user_id ?? currentUser?.id ?? 0} size={56} />
              </div>
              <span className="text-xs text-[#2F3B3D]/60 font-medium">You</span>
            </div>

            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21C12 21 3 14.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 13 5.08C14.09 3.81 15.76 3 17.5 3C20.58 3 23 5.42 23 8.5C23 14.5 12 21 12 21Z"
                fill="#F44336" stroke="#C62828" strokeWidth="1.5" strokeLinejoin="round"
                transform="translate(-1,0)"
              />
              <ellipse cx="8.5" cy="8" rx="2.2" ry="1.3" fill="white" opacity="0.35" transform="translate(-1,0)"/>
            </svg>

            <div className="flex flex-col items-center gap-1.5">
              <div className="w-16 h-16 rounded-full bg-[#EDE9DF] flex items-center justify-center shadow-md overflow-hidden">
                <CircleGuyAvatar id={profile.id ?? profile.name} size={56} />
              </div>
              <span className="text-xs text-[#2F3B3D]/60 font-medium truncate max-w-[64px]">{profile.name}</span>
            </div>
          </div>

          {/* CTA — pushed down away from avatars */}
          <button
            ref={btnRef}
            onClick={onClose}
            className="w-full px-8 py-3.5 mt-6 bg-[#7C8D8C] text-white rounded-full hover:bg-[#2F3B3D] transition-all duration-300 font-medium"
          >
            Continue Swiping
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
