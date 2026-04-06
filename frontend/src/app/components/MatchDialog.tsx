import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import confetti from "canvas-confetti";
import Lottie from "lottie-react";
import { Dialog, DialogContent } from "./ui/dialog";
import { getCurrentUser } from "../utils/api";
import circleGuyIdleData from "../assets/circleGuyIdle.json";
import handshake from "../assets/agreement.png";

import { CircleGuyAvatar } from "./CircleGuyAvatar";


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

            <img src={handshake} className="w-12 h-12 object-contain" />

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
