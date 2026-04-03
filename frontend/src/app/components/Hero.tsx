import { ArrowRight, Star, MapPin } from "lucide-react";
import circleGrad from "../assets/circleGrad.png";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { gsap } from "gsap";
import Lottie from "lottie-react";
import circleGuyIdleData from "../assets/circleGuyIdle.json";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

// Warm complementary header colours — terracotta, amber, sage, dusty rose, ochre
const CARD_COLORS = ["#C2714F", "#D4956A", "#7C8D8C", "#B87B6E", "#C9956C", "#8FA68E", "#C47E5A"];

const cardData = [
  { emoji: "👨", name: "James L.", age: 34, location: "Bishan",    subject: "Physics (A-Level)",    rate: "$45/hr",  isTutor: true  },
  { emoji: "👩", name: "Sarah M.", age: 19, location: "Tampines",  subject: "English (O-Level)",    rate: "$30/hr",  isTutor: false },
  { emoji: "👨", name: "Alex K.",  age: 28, location: "Clementi",  subject: "Chemistry (A-Level)",  rate: "$55/hr",  isTutor: true  },
  { emoji: "👩", name: "Emily R.", age: 21, location: "Jurong",    subject: "Maths (Sec 3)",        rate: "$25/hr",  isTutor: false },
  { emoji: "👨", name: "Mike T.",  age: 31, location: "Bedok",     subject: "Biology (O-Level)",    rate: "$50/hr",  isTutor: true  },
  { emoji: "👩", name: "Lisa K.",  age: 20, location: "Yishun",    subject: "Biology (A-Level)",    rate: "$28/hr",  isTutor: false },
  { emoji: "👨", name: "Alex R.",  age: 40, location: "Orchard",   subject: "Mathematics (JC)",     rate: "$60/hr",  isTutor: true  },
];

const N = cardData.length;
const HALF = Math.floor(N / 2);

function wrap(offset: number) {
  return ((offset + HALF) % N + N) % N - HALF;
}

function ProfileCard({ card, colorIndex }: { card: typeof cardData[0]; colorIndex: number }) {
  const headerColor = CARD_COLORS[colorIndex % CARD_COLORS.length];
  return (
    <div className="w-[210px] bg-[#FAFAF8] rounded-2xl overflow-hidden select-none shadow-lg border border-[#E5E4E1]">
      <div className="h-[150px] relative flex items-center justify-center" style={{ backgroundColor: headerColor }}>
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold text-white">
          {card.name.charAt(0)}
        </div>
        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs text-[#2F3B3D] font-medium">
          {card.age} yrs
        </div>
      </div>
      <div className="p-4 space-y-2.5">
        <div>
          <p className="text-[#2F3B3D] font-semibold text-sm leading-tight">{card.name}</p>
          <div className="flex items-center gap-1 text-[#2F3B3D]/60 mt-0.5">
            <MapPin className="w-3 h-3" />
            <span className="text-xs">{card.location}</span>
          </div>
        </div>
        <p className="text-xs text-[#2F3B3D]/70">{card.subject}</p>
        <div className="flex items-center justify-between py-1.5 px-2.5 bg-[#F5F3EF] rounded-lg">
          <span className="text-xs text-[#2F3B3D]/60">{card.isTutor ? "Rate" : "Budget"}</span>
          <span className="text-xs font-semibold" style={{ color: headerColor }}>{card.rate}</span>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const mascotRef      = useRef<HTMLSpanElement>(null);
  const tagRef      = useRef<HTMLDivElement>(null);
  const titleRef    = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef  = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const sectionRef  = useRef<HTMLElement>(null);
  const blobTR      = useRef<HTMLDivElement>(null);
  const blobBL      = useRef<HTMLDivElement>(null);

  const posRef    = useRef(3.0);
  const velRef    = useRef(0.0);
  const speedRef  = useRef(0.0);
  const cardRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs   = useRef<(HTMLButtonElement | null)[]>([]);
  const prevActiveRef   = useRef(-1);
  const tickerActiveRef = useRef(false);

  // ── Parallax blobs on mouse move ──
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const onMove = (e: MouseEvent) => {
      const { innerWidth: W, innerHeight: H } = window;
      const rx = (e.clientX / W - 0.5) * 2;
      const ry = (e.clientY / H - 0.5) * 2;
      gsap.to(blobTR.current, { x: rx * 30, y: ry * 20, duration: 1.2, ease: "power2.out" });
      gsap.to(blobBL.current, { x: rx * -20, y: ry * -15, duration: 1.4, ease: "power2.out" });
    };
    section.addEventListener("mousemove", onMove);
    return () => section.removeEventListener("mousemove", onMove);
  }, []);

  // ── Entrance + fan animation ──
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(tagRef.current,      { y: 24, opacity: 0, duration: 0.6 })
      .from(titleRef.current,    { y: 40, opacity: 0, duration: 0.8 }, "-=0.35")
      .from(subtitleRef.current, { y: 28, opacity: 0, duration: 0.7 }, "-=0.5")
      .from(buttonsRef.current,  { y: 20, opacity: 0, duration: 0.6 }, "-=0.45")
      .from(carouselRef.current, { x: 40, opacity: 0, duration: 0.9, ease: "power2.out" }, "-=0.7");

    const wrapLocal = (offset: number) =>
      ((offset + HALF) % N + N) % N - HALF;

    const finalState = (cardIndex: number) => {
      const w   = wrapLocal(cardIndex - 3.0);
      const abs = Math.abs(w);
      return {
        visibility:           "visible",
        transformPerspective: 800,
        xPercent:             -50,
        x:                    w * 155,
        y:                    abs * abs * 7,
        scale:                1 - abs * 0.13,
        rotationY:            w * -6,
        rotationZ:            0,
        opacity:              Math.max(0, 1 - abs * 0.3),
      };
    };

    const FAN_ORDER = [5, 4, 3, 2, 1] as const;

    FAN_ORDER.forEach((cardIndex) => {
      const card = cardRefs.current[cardIndex];
      if (!card) return;
      gsap.set(card, {
        visibility: "visible", transformPerspective: 800,
        xPercent: -50, x: 520, y: 0, scale: 0.9,
        rotationY: -15, rotationZ: 8, opacity: 0,
      });
    });

    const fanTl = gsap.timeline({
      delay: 0.9,
      defaults: { ease: "power3.out", duration: 0.5 },
      onComplete() { tickerActiveRef.current = true; },
    });

    FAN_ORDER.forEach((cardIndex, i) => {
      const card = cardRefs.current[cardIndex];
      if (!card) return;
      fanTl.to(card, finalState(cardIndex), i === 0 ? 0 : `<+=0.12`);
    });

    // Swipe action: whole mascot lunges right fast, squashes, bounces back
    const swipeTl = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });
    swipeTl
      // wind-up: lean back left and squash slightly
      .to(mascotRef.current, { x: "-0.2em", scaleX: 0.85, scaleY: 1.1, duration: 0.2, ease: "power2.in" })
      // lunge right fast — the swipe
      .to(mascotRef.current, { x: "0.55em", scaleX: 1.2, scaleY: 0.85, rotation: 15, duration: 0.22, ease: "power4.out" })
      // snap back to rest with a little overshoot bounce
      .to(mascotRef.current, { x: 0, scaleX: 1, scaleY: 1, rotation: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });

    return () => { tl.kill(); fanTl.kill(); swipeTl.kill(); tickerActiveRef.current = false; };
  }, []);

  // ── Physics ticker ──
  useEffect(() => {
    const AUTO_SPEED = 0.001;
    const FRICTION   = 0.78;
    const MOUSE_MAX  = 0.045;
    const SNAP_SPEED = 0.08;

    const tick = () => {
      if (!tickerActiveRef.current) return;
      const mouseVel  = speedRef.current * MOUSE_MAX;
      const targetVel = speedRef.current !== 0 ? mouseVel : AUTO_SPEED;

      velRef.current += (targetVel - velRef.current) * 0.07;
      if (speedRef.current === 0) velRef.current *= FRICTION;

      if (speedRef.current === 0 && Math.abs(velRef.current) < 0.003) {
        const nearest = Math.round(posRef.current);
        posRef.current += (nearest - posRef.current) * SNAP_SPEED;
      } else {
        posRef.current = ((posRef.current + velRef.current) % N + N) % N;
      }

      const pos = posRef.current;

      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const w   = wrap(index - pos);
        const abs = Math.abs(w);

        if (abs > 2.6) { card.style.visibility = "hidden"; return; }
        card.style.visibility = "visible";

        const scale      = 1 - abs * 0.13;
        const blurPx     = abs * 2.8;
        const opacity    = Math.max(0, 1 - abs * 0.3);
        const rotateY    = w * -6;
        const translateY = abs * abs * 7;

        card.style.transform = `translateX(calc(-50% + ${w * 155}px)) translateY(${translateY}px) scale(${scale}) perspective(800px) rotateY(${rotateY}deg)`;
        card.style.filter    = blurPx > 0.15 ? `blur(${blurPx}px)` : "none";
        card.style.opacity   = String(opacity);
        card.style.zIndex    = String(Math.round(10 - abs * 2));
        card.style.boxShadow = abs < 0.25
          ? "0 24px 56px rgba(26,32,53,0.18)"
          : "0 8px 20px rgba(26,32,53,0.07)";
      });

      const activeI = Math.round(pos) % N;
      if (activeI !== prevActiveRef.current) {
        prevActiveRef.current = activeI;
        dotRefs.current.forEach((dot, i) => {
          if (!dot) return;
          if (i === activeI) {
            dot.style.width = "24px"; dot.style.height = "10px";
            dot.style.backgroundColor = "#7C8D8C";
          } else {
            dot.style.width = "10px"; dot.style.height = "10px";
            dot.style.backgroundColor = "rgba(26,32,53,0.2)";
          }
        });
      }
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    if      (pct < 0.28) speedRef.current = -(1 - pct / 0.28);
    else if (pct > 0.72) speedRef.current = (pct - 0.72) / 0.28;
    else                 speedRef.current = 0;
  };
  const handleMouseLeave = () => { speedRef.current = 0; };

  const handleDotClick = (i: number) => {
    const current = posRef.current;
    let diff = i - current;
    if (diff > HALF)  diff -= N;
    if (diff < -HALF) diff += N;
    gsap.to(posRef, { current: current + diff, duration: 0.65, ease: "power2.inOut" });
  };

  const handleGetStarted    = () => navigate("/register");
  const handleUserTypeSelect = (type: "student" | "tutor") => {
    setIsDialogOpen(false);
    sessionStorage.setItem("userType", type);
    navigate("/register?mode=signup");
  };

  const getCursor = (e: React.MouseEvent<HTMLDivElement>) => {
    const pct = (e.clientX - e.currentTarget.getBoundingClientRect().left) / e.currentTarget.getBoundingClientRect().width;
    if (pct < 0.28) return "w-resize";
    if (pct > 0.72) return "e-resize";
    return "default";
  };
  const [cursorStyle, setCursorStyle] = useState<string>("default");

  return (
    <section ref={sectionRef} className="relative bg-[#F5F3EF] pb-28">
      {/* Parallax bg blobs */}
      <div ref={blobTR} className="absolute -top-40 -right-40 w-[700px] h-[700px] bg-[#7C8D8C] rounded-full blur-[140px] opacity-[0.06] pointer-events-none will-change-transform" />
      <div ref={blobBL} className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-[#F59E0B] rounded-full blur-[120px] opacity-[0.06] pointer-events-none will-change-transform" />

      {/* Nav */}
      <nav className="relative z-10 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1">
            <img src={circleGrad} alt="TutorFinder" className="w-16 h-16 object-contain" />
            <h1 className="text-2xl font-semibold tracking-tight text-[#1A2035]">
              Tutor<span className="text-[#7C8D8C]">Finder</span>
            </h1>
          </div>
          <div className="flex items-center gap-8">
            <a href="#features"     className="text-sm text-[#1A2035]/70 hover:text-[#7C8D8C] transition-colors font-medium">Features</a>
            <a href="#how-it-works" className="text-sm text-[#1A2035]/70 hover:text-[#7C8D8C] transition-colors font-medium">How It Works</a>
            <a href="#reviews"      className="text-sm text-[#1A2035]/70 hover:text-[#7C8D8C] transition-colors font-medium">Reviews</a>
            <button onClick={() => navigate("/login")} className="px-5 py-2 bg-transparent text-[#1A2035] text-sm rounded-full border border-[#C8BFAE] hover:bg-[#EDE9DF] transition-all duration-300 font-medium">
              Log In
            </button>
            <button onClick={handleGetStarted} className="px-5 py-2 bg-[#7C8D8C] text-white text-sm rounded-full hover:bg-[#2F3B3D] transition-all duration-300 shadow-md shadow-[#7C8D8C]/20 font-medium">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero body */}
      <div className="max-w-7xl mx-auto px-8 pt-16">
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* Left copy */}
          <div className="space-y-8">
            <div ref={tagRef} className="inline-flex items-center px-4 py-1.5 bg-[#EDE9DF] border border-[#D6CFBF] text-[#1A2035]/80 text-sm rounded-full font-medium">
              Swipe. Match. Learn. ✨
            </div>
            <h2 ref={titleRef} className="text-6xl font-bold tracking-tight text-[#1A2035] leading-[1.1]">
              Find your perfect tutor with a{" "}
              <span className="inline-flex items-center gap-2">
                swipe
                {/* Mascot doing swipe gesture */}
                <span
                  ref={mascotRef}
                  className="inline-flex items-center justify-center relative"
                  style={{ width: "2em", height: "2em", verticalAlign: "middle" }}
                >
                  <Lottie
                    animationData={circleGuyIdleData}
                    autoplay={true}
                    loop={true}
                    style={{ width: "100%", height: "100%" }}
                  />
                </span>
              </span>
            </h2>
            <p ref={subtitleRef} className="text-lg text-[#1A2035]/60 leading-relaxed max-w-lg">
              Discover qualified tutors and eager students through an intuitive matching experience. Built for modern learners and educators.
            </p>
            <div ref={buttonsRef} className="flex gap-4">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-[#7C8D8C] text-white rounded-full hover:bg-[#2F3B3D] transition-all duration-300 flex items-center gap-2 group shadow-lg shadow-[#7C8D8C]/25 font-medium"
              >
                Start Matching
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                className="px-8 py-4 bg-[#EDE9DF] text-[#1A2035] rounded-full border border-[#D6CFBF] hover:bg-[#F5F3EF] transition-all duration-300 font-medium"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Right: card carousel */}
          <div ref={carouselRef} className="flex flex-col items-center gap-6">
            <div
              className="relative w-full h-[380px] overflow-hidden"
              style={{ cursor: cursorStyle }}
              onMouseMove={(e) => { handleMouseMove(e); setCursorStyle(getCursor(e)); }}
              onMouseLeave={handleMouseLeave}
            >
              {cardData.map((card, index) => (
                <div
                  key={card.name + index}
                  ref={(el) => { cardRefs.current[index] = el; }}
                  className="absolute left-1/2 top-4 rounded-2xl will-change-transform"
                  style={{ visibility: "hidden" }}
                >
                  <ProfileCard card={card} colorIndex={index} />
                </div>
              ))}
            </div>

            <div className="flex gap-2 items-center">
              {cardData.map((_, i) => (
                <button
                  key={i}
                  ref={(el) => { dotRefs.current[i] = el; }}
                  onClick={() => handleDotClick(i)}
                  className="rounded-full transition-all duration-300 bg-[#1A2035]/20 hover:bg-[#1A2035]/40"
                  style={{ width: "10px", height: "10px" }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Wavy divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] pointer-events-none">
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-[80px]">
          <path fill="#fff" d="M0,40 Q180,20 360,40 T720,40 T1080,40 T1440,40 L1440,80 L0,80 Z" />
        </svg>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white border-[#E8E4DC]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#1A2035] font-bold">Get Started with TutorFinder</DialogTitle>
            <DialogDescription className="text-[#1A2035]/60">Choose your account type to continue</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <button onClick={() => handleUserTypeSelect("student")} className="p-8 bg-[#F5F3EF] rounded-2xl hover:bg-[#7C8D8C] hover:text-white transition-all duration-300 group border border-[#E8E4DC]">
              <div className="text-4xl mb-2">🎓</div>
              <h4 className="text-lg mb-2 text-[#1A2035] group-hover:text-white font-semibold">I'm a Student</h4>
              <p className="text-sm text-[#1A2035]/60 group-hover:text-white/80">Find the perfect tutor for your learning needs</p>
            </button>
            <button onClick={() => handleUserTypeSelect("tutor")} className="p-8 bg-[#F5F3EF] rounded-2xl hover:bg-[#7C8D8C] hover:text-white transition-all duration-300 group border border-[#E8E4DC]">
              <div className="text-4xl mb-2">👨‍🏫</div>
              <h4 className="text-lg mb-2 text-[#1A2035] group-hover:text-white font-semibold">I'm a Tutor</h4>
              <p className="text-sm text-[#1A2035]/60 group-hover:text-white/80">Connect with students and share your expertise</p>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
