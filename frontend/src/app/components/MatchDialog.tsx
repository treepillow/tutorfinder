import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Lottie from "lottie-react";
import confetti from "canvas-confetti";
import { Dialog, DialogContent } from "./ui/dialog";
import circleGuyIdleData from "../assets/circleGuyIdle.json";
import { getCurrentUser } from "../utils/api";

interface MatchDialogProps {
  profile: any;
  onClose: () => void;
}

export function MatchDialog({ profile, onClose }: MatchDialogProps) {
  const mascotRef  = useRef<HTMLDivElement>(null);
  const heartsRef  = useRef<HTMLDivElement>(null);
  const titleRef   = useRef<HTMLDivElement>(null);
  const avatarsRef = useRef<HTMLDivElement>(null);
  const btnRef     = useRef<HTMLButtonElement>(null);
  const currentUser = getCurrentUser();

  useEffect(() => {
    // ── Canvas-confetti burst (full-screen, proven to work) ──
    const fireConfetti = () => {
      const opts = {
        particleCount: 60,
        spread: 80,
        startVelocity: 45,
        scalar: 1.4,          // bigger particles
        shapes: ["rect"] as confetti.Shape[],
        colors: ["#F44336","#FF9800","#FFEB3B","#4CAF50","#2196F3","#9C27B0","#FF4081","#00BCD4"],
      };
      confetti({ ...opts, origin: { x: 0.3, y: 0.45 } });
      confetti({ ...opts, origin: { x: 0.7, y: 0.45 } });
    };
    fireConfetti();
    // Second burst after a short delay
    const t = setTimeout(fireConfetti, 400);

    // ── Floating hearts from mascot ──
    const spawnHeart = () => {
      const container = heartsRef.current;
      if (!container) return;
      const el = document.createElement("div");
      const size = 18 + Math.random() * 16;
      const xOffset = (Math.random() - 0.5) * 80;
      el.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
        <path d="M12 21C12 21 3 14.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 13 5.08C14.09 3.81 15.76 3 17.5 3C20.58 3 23 5.42 23 8.5C23 14.5 12 21 12 21Z"
          fill="#F44336" stroke="#C62828" stroke-width="1.5" stroke-linejoin="round" transform="translate(-1,0)"/>
        <ellipse cx="8.5" cy="8" rx="2" ry="1.1" fill="white" opacity="0.4" transform="translate(-1,0)"/>
      </svg>`;
      el.style.cssText = `position:absolute; bottom:10px; left:50%; transform:translateX(-50%); pointer-events:none; opacity:0;`;
      container.appendChild(el);

      gsap.fromTo(el,
        { opacity: 0, y: 0, x: xOffset, scale: 0.5 },
        {
          opacity: 1, y: -(60 + Math.random() * 60), x: xOffset + (Math.random() - 0.5) * 30,
          scale: 1, duration: 0.4, ease: "back.out(1.5)",
          onComplete: () => gsap.to(el, {
            opacity: 0, y: `-=${30 + Math.random() * 30}`,
            duration: 0.6 + Math.random() * 0.4, ease: "power1.out",
            onComplete: () => el.remove(),
          }),
        }
      );
    };

    // Spawn hearts repeatedly
    spawnHeart();
    const heartInterval = setInterval(spawnHeart, 600);

    // ── Entrance animations ──
    const tl = gsap.timeline();

    tl.fromTo(mascotRef.current,
      { scale: 0.4, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.55, ease: "back.out(2.5)" }
    );

    // Gentle continuous bounce
    gsap.to(mascotRef.current, {
      y: -8, duration: 0.65, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.6,
    });

    tl.fromTo(titleRef.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.38, ease: "power2.out" },
      "-=0.15"
    );
    tl.fromTo(avatarsRef.current,
      { opacity: 0, scale: 0.85 },
      { opacity: 1, scale: 1, duration: 0.38, ease: "back.out(1.8)" },
      "-=0.1"
    );
    tl.fromTo(btnRef.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" },
      "-=0.05"
    );

    return () => {
      clearTimeout(t);
      clearInterval(heartInterval);
    };
  }, []);

  const myInitial    = (currentUser?.name ?? "?").charAt(0).toUpperCase();
  const theirInitial = profile.name.charAt(0).toUpperCase();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-[#F5F3EF] border-[#D6CFBF]">
        <div className="text-center space-y-5 py-6 px-2">

          {/* Mascot + floating hearts container */}
          <div className="relative mx-auto" style={{ width: 150, height: 150 }}>
            <div ref={mascotRef}>
              <Lottie
                animationData={circleGuyIdleData}
                autoplay={true}
                loop={true}
                style={{ width: 150, height: 150 }}
              />
            </div>
            {/* Hearts float up from here */}
            <div ref={heartsRef} className="absolute inset-0 pointer-events-none overflow-visible" />
          </div>

          {/* Title */}
          <div ref={titleRef}>
            <h2 className="text-3xl font-bold tracking-tight text-[#2F3B3D]">
              It's a Match!
            </h2>
            <p className="text-[#2F3B3D]/60 text-sm mt-1">
              You and <span className="font-semibold text-[#2F3B3D]">{profile.name}</span> liked each other
            </p>
          </div>

          {/* You + Heart + Them */}
          <div ref={avatarsRef} className="flex items-center justify-center gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7C8D8C] to-[#2F3B3D] flex items-center justify-center shadow-md">
                <span className="text-2xl font-bold text-white">{myInitial}</span>
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
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C2714F] to-[#7C4B30] flex items-center justify-center shadow-md">
                <span className="text-2xl font-bold text-white">{theirInitial}</span>
              </div>
              <span className="text-xs text-[#2F3B3D]/60 font-medium truncate max-w-[64px]">{profile.name}</span>
            </div>
          </div>

          {/* CTA */}
          <button
            ref={btnRef}
            onClick={onClose}
            className="w-full px-8 py-3.5 bg-[#7C8D8C] text-white rounded-full hover:bg-[#2F3B3D] transition-all duration-300 font-medium"
          >
            Continue Swiping
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
