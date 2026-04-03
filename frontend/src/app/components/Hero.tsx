import { ArrowRight, Star } from "lucide-react";
import circleGrad from "../assets/circleGrad.png";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { gsap } from "gsap";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

const cardData = [
  { initials: "JL", gradient: "from-[#6B48FF] to-[#9B6BFF]", name: "James L.",  role: "Tutor",   subject: "Physics",            desc: "10 years of teaching experience",          stars: 4, price: "$45/hr" },
  { initials: "SM", gradient: "from-[#FF6B9D] to-[#FF9BB0]", name: "Sarah M.",  role: "Student", subject: "Needs English Help",  desc: "Preparing for university entrance",         stars: 3, price: "" },
  { initials: "AK", gradient: "from-[#4ECDC4] to-[#2BAE9E]", name: "Alex K.",   role: "Tutor",   subject: "Chemistry",          desc: "PhD candidate, organic chemistry",          stars: 5, price: "$55/hr" },
  { initials: "ER", gradient: "from-[#FF9A56] to-[#FFB347]", name: "Emily R.",  role: "Student", subject: "Needs Math Help",    desc: "College freshman struggling with calculus", stars: 4, price: "" },
  { initials: "MT", gradient: "from-[#45B7D1] to-[#2E86AB]", name: "Mike T.",   role: "Tutor",   subject: "Biology",            desc: "High school teacher, 8+ years exp.",       stars: 4, price: "$50/hr" },
  { initials: "LK", gradient: "from-[#FF6B9D] to-[#C44DFF]", name: "Lisa K.",   role: "Student", subject: "Biology Help",       desc: "Pre-med student needing study support",     stars: 5, price: "" },
  { initials: "AR", gradient: "from-[#56E0A0] to-[#3BC47A]", name: "Alex R.",   role: "Tutor",   subject: "Mathematics",        desc: "University math professor, all levels",     stars: 5, price: "$60/hr" },
];

const N = cardData.length;
const HALF = Math.floor(N / 2);

function wrap(offset: number) {
  return ((offset + HALF) % N + N) % N - HALF;
}

function ProfileCard({ card }: { card: typeof cardData[0] }) {
  const isTutor = card.role === "Tutor";
  return (
    <div className="w-[200px] bg-white rounded-2xl p-5 flex flex-col items-center gap-3 select-none">
      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
        {card.initials}
      </div>
      <p className="font-bold text-[#1A2035] text-base leading-tight">{card.name}</p>
      <span className={`px-3 py-0.5 rounded-full text-xs font-semibold ${isTutor ? "bg-[#7C8D8C]/15 text-[#7C8D8C]" : "bg-green-100 text-green-700"}`}>
        {card.role}
      </span>
      <p className="text-sm text-[#1A2035]/70 font-medium text-center leading-tight">{card.subject}</p>
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`w-3.5 h-3.5 ${i < card.stars ? "fill-[#F59E0B] text-[#F59E0B]" : "fill-gray-200 text-gray-200"}`} />
        ))}
      </div>
      <p className="text-xs text-[#1A2035]/50 text-center leading-snug">{card.desc}</p>
      {card.price && <p className="text-sm font-bold text-[#7C8D8C]">{card.price}</p>}
    </div>
  );
}

export function Hero() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // GSAP entrance refs
  const tagRef      = useRef<HTMLDivElement>(null);
  const titleRef    = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef  = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Carousel physics refs — never trigger React re-renders
  const posRef    = useRef(3.0);   // continuous float carousel position
  const velRef    = useRef(0.0);   // current velocity
  const speedRef  = useRef(0.0);   // mouse-driven speed: -1..1
  const cardRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs   = useRef<(HTMLButtonElement | null)[]>([]);
  const prevActiveRef = useRef(-1);

  // GSAP entrance
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(tagRef.current,      { y: 24, opacity: 0, duration: 0.6 })
      .from(titleRef.current,    { y: 40, opacity: 0, duration: 0.8 }, "-=0.35")
      .from(subtitleRef.current, { y: 28, opacity: 0, duration: 0.7 }, "-=0.5")
      .from(buttonsRef.current,  { y: 20, opacity: 0, duration: 0.6 }, "-=0.45")
      .from(carouselRef.current, { x: 40, opacity: 0, duration: 0.9, ease: "power2.out" }, "-=0.7");
  }, []);

  // Physics ticker — runs every GSAP frame (~60fps), never touches React state
  useEffect(() => {
    const AUTO_SPEED = 0.001;  // slow rightward auto-scroll when idle
    const FRICTION   = 0.78;   // velocity decay per frame (higher = settles faster)
    const MOUSE_MAX  = 0.045;  // max velocity from mouse zone

    const tick = () => {
      const mouseVel = speedRef.current * MOUSE_MAX;
      const targetVel = speedRef.current !== 0 ? mouseVel : AUTO_SPEED;

      // Lerp velocity toward target, then apply friction
      velRef.current += (targetVel - velRef.current) * 0.07;
      if (speedRef.current === 0) velRef.current *= FRICTION;

      posRef.current = ((posRef.current + velRef.current) % N + N) % N;

      const pos = posRef.current;

      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const w   = wrap(index - pos);
        const abs = Math.abs(w);

        if (abs > 2.6) {
          card.style.visibility = "hidden";
          return;
        }
        card.style.visibility = "visible";

        const scale   = 1 - abs * 0.13;
        const blurPx  = abs * 2.8;
        const opacity = Math.max(0, 1 - abs * 0.3);
        const rotateY = w * -6;                    // subtle 3-D fan
        const translateY = abs * abs * 7;          // side cards sink slightly

        card.style.transform  = `translateX(calc(-50% + ${w * 190}px)) translateY(${translateY}px) scale(${scale}) perspective(800px) rotateY(${rotateY}deg)`;
        card.style.filter     = blurPx > 0.15 ? `blur(${blurPx}px)` : "none";
        card.style.opacity    = String(opacity);
        card.style.zIndex     = String(Math.round(10 - abs * 2));
        card.style.boxShadow  = abs < 0.25
          ? "0 24px 56px rgba(26,32,53,0.18)"
          : "0 8px 20px rgba(26,32,53,0.07)";
      });

      // Update dot indicators only when active index changes
      const activeI = Math.round(pos) % N;
      if (activeI !== prevActiveRef.current) {
        prevActiveRef.current = activeI;
        dotRefs.current.forEach((dot, i) => {
          if (!dot) return;
          if (i === activeI) {
            dot.style.width           = "24px";
            dot.style.height          = "10px";
            dot.style.backgroundColor = "#7C8D8C";
          } else {
            dot.style.width           = "10px";
            dot.style.height          = "10px";
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
    if (pct < 0.28) {
      // stronger speed closer to left edge
      speedRef.current = -(1 - pct / 0.28);
    } else if (pct > 0.72) {
      speedRef.current = (pct - 0.72) / 0.28;
    } else {
      speedRef.current = 0;
    }
  };

  const handleMouseLeave = () => { speedRef.current = 0; };

  // Dot click: smoothly tween posRef to target index
  const handleDotClick = (i: number) => {
    const current = posRef.current;
    // find shortest circular path
    let diff = i - current;
    if (diff > HALF)  diff -= N;
    if (diff < -HALF) diff += N;
    const target = current + diff;
    gsap.to(posRef, { current: target, duration: 0.65, ease: "power2.inOut" });
  };

  const handleGetStarted = () => navigate("/register");
  const handleUserTypeSelect = (type: "student" | "tutor") => {
    setIsDialogOpen(false);
    sessionStorage.setItem("userType", type);
    navigate("/register?mode=signup");
  };

  // Cursor hint derived from speedRef (updated in mousemove without state)
  const getCursor = (e: React.MouseEvent<HTMLDivElement>) => {
    const pct = (e.clientX - e.currentTarget.getBoundingClientRect().left) / e.currentTarget.getBoundingClientRect().width;
    if (pct < 0.28) return "w-resize";
    if (pct > 0.72) return "e-resize";
    return "default";
  };
  const [cursorStyle, setCursorStyle] = useState<string>("default");

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#FAFAF8] via-[#F5F3EF] to-[#EDE9DF] pb-28">
      {/* Bg blobs */}
      <div className="absolute -top-40 -right-40 w-[700px] h-[700px] bg-[#7C8D8C] rounded-full blur-[140px] opacity-[0.05] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-[#F59E0B] rounded-full blur-[120px] opacity-[0.05] pointer-events-none" />

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
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2 bg-transparent text-[#1A2035] text-sm rounded-full border border-[#C8BFAE] hover:bg-[#EDE9DF] transition-all duration-300 font-medium"
            >
              Log In
            </button>
            <button
              onClick={handleGetStarted}
              className="px-5 py-2 bg-[#7C8D8C] text-white text-sm rounded-full hover:bg-[#2F3B3D] transition-all duration-300 shadow-md shadow-[#7C8D8C]/20 font-medium"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero body */}
      <div className="max-w-7xl mx-auto px-8 pt-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left copy */}
          <div className="space-y-8">
            <div ref={tagRef} className="inline-flex items-center px-4 py-1.5 bg-[#EDE9DF] border border-[#D6CFBF] text-[#1A2035]/80 text-sm rounded-full font-medium">
              Swipe. Match. Learn. ✨
            </div>
            <h2 ref={titleRef} className="text-6xl font-bold tracking-tight text-[#1A2035] leading-[1.1]">
              Find your perfect tutor with a swipe
            </h2>
            <p ref={subtitleRef} className="text-lg text-[#1A2035]/60 leading-relaxed max-w-lg">
              Discover qualified tutors and eager students through an intuitive matching experience. Built for modern learners and educators.
            </p>
            <div ref={buttonsRef} className="flex gap-4">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-[#7C8D8C] text-white rounded-full hover:bg-[#7C8D8C] transition-all duration-300 flex items-center gap-2 group shadow-lg shadow-[#7C8D8C]/25 font-medium"
              >
                Start Matching
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                className="px-8 py-4 bg-transparent text-[#1A2035] rounded-full border border-[#C8BFAE] hover:bg-[#EDE9DF] transition-all duration-300 font-medium"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Right: physics-driven card fan */}
          <div ref={carouselRef} className="flex flex-col items-center gap-6">
            <div
              className="relative w-full h-[360px]"
              style={{ cursor: cursorStyle }}
              onMouseMove={(e) => { handleMouseMove(e); setCursorStyle(getCursor(e)); }}
              onMouseLeave={handleMouseLeave}
            >
              {cardData.map((card, index) => (
                <div
                  key={card.initials + index}
                  ref={(el) => { cardRefs.current[index] = el; }}
                  className="absolute left-1/2 top-0 rounded-2xl will-change-transform"
                  style={{ visibility: "hidden" }}
                >
                  <ProfileCard card={card} />
                </div>
              ))}
            </div>

            {/* Dot indicators */}
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
          <path fill="#ffffff" d="M0,40 C200,10 400,70 600,40 C800,10 1000,70 1200,40 C1320,20 1400,55 1440,45 L1440,80 L0,80 Z" />
        </svg>
      </div>

      {/* Dialog */}
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
