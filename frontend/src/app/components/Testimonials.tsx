import { Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lottie from "lottie-react";
import circleGuyData from "../assets/circleGuy.json";
import circleGuyIdleData from "../assets/circleGuyIdle.json";
import { ImageWithFallback } from "./shared/ImageWithFallback";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    name: "Sarah Chen",
    role: "High School Student",
    image: "https://images.unsplash.com/photo-1758600587839-56ba05596c69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMGhlYWRzaG90JTIwYXNpYW4lMjB3b21hbnxlbnwxfHx8fDE3NzQzNTQwNjl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    content: "TutorFinder helped me find an amazing math tutor who understood exactly what I needed. My grades improved from a C to an A in just one semester!",
    rating: 5,
  },
  {
    name: "Michael R.",
    role: "Physics Tutor",
    image: "https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMGhlYWRzaG90JTIwYXNpYW4lMjBtYW58ZW58MXx8fHwxNzc0MzU0MDcwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    content: "As a tutor, this platform has connected me with wonderful students. The scheduling system is seamless and the payment process is hassle-free.",
    rating: 5,
  },
  {
    name: "Emily J.",
    role: "University Student",
    image: "https://images.unsplash.com/photo-1725473823290-8a261fe706a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHN0dWRlbnQlMjBwb3J0cmFpdCUyMGFzaWFufGVufDF8fHx8MTc3NDM1NDA3MHww&ixlib=rb-4.1.0&q=80&w=1080",
    content: "The flexibility to choose between online and in-person sessions made all the difference. I could fit tutoring around my busy schedule.",
    rating: 5,
  },
];

const stats = [
  { to: 10,  suffix: "K+", label: "Active Users" },
  { to: 50,  suffix: "K+", label: "Successful Matches" },
  { to: 4.9, suffix: "/5", label: "Average Rating", decimal: true },
];

export function Testimonials() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const sectionRef   = useRef<HTMLElement>(null);
  const headingRef   = useRef<HTMLDivElement>(null);
  const statsRef     = useRef<HTMLDivElement>(null);
  const ctaRef       = useRef<HTMLElement>(null);
  const statValRefs  = useRef<(HTMLSpanElement | null)[]>([]);
  const cardEls      = useRef<(HTMLDivElement | null)[]>([]);
  const ctaMascotRef = useRef<HTMLDivElement>(null);
  const ctaLottieRef = useRef<any>(null);
  const [ctaWalking, setCtaWalking] = useState(false);

  // 3D tilt on testimonial cards
  useEffect(() => {
    const cleanups: (() => void)[] = [];
    cardEls.current.forEach((card) => {
      if (!card) return;
      const onMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const rx = ((e.clientY - rect.top)  / rect.height - 0.5) * 10;
        const ry = ((e.clientX - rect.left) / rect.width  - 0.5) * -10;
        gsap.to(card, { rotateX: rx, rotateY: ry, duration: 0.35, ease: "power2.out", transformPerspective: 900 });
      };
      const onLeave = () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "power3.out" });
      card.addEventListener("mousemove",  onMove  as EventListener);
      card.addEventListener("mouseleave", onLeave as EventListener);
      cleanups.push(() => {
        card.removeEventListener("mousemove",  onMove  as EventListener);
        card.removeEventListener("mouseleave", onLeave as EventListener);
      });
    });
    return () => cleanups.forEach(fn => fn());
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const TA = "play none none reverse";

      gsap.from(".test-badge", {
        y: 20, opacity: 0, duration: 0.6, ease: "power3.out",
        scrollTrigger: { trigger: headingRef.current, start: "top 88%", toggleActions: TA },
      });

      gsap.from(".test-title-word", {
        y: 50, opacity: 0, duration: 0.6, stagger: 0.07, ease: "power3.out",
        scrollTrigger: { trigger: headingRef.current, start: "top 82%", toggleActions: TA },
      });

      gsap.from(".test-subtitle", {
        y: 24, opacity: 0, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: headingRef.current, start: "top 75%", toggleActions: TA },
      });

      gsap.fromTo(".testimonial-card",
        (i) => ({
          y: 90 + i * 20,
          rotate: i === 0 ? -3 : i === 1 ? 0 : 3,
          opacity: 0,
          scale: 0.92,
        }),
        {
          y: 0, rotate: 0, opacity: 1, scale: 1,
          duration: 0.85, stagger: 0.15, ease: "power3.out",
          scrollTrigger: { trigger: ".test-cards", start: "top 82%", toggleActions: TA },
        }
      );

      // Stat counters
      statValRefs.current.forEach((el, i) => {
        if (!el) return;
        const stat = stats[i];
        const proxy = { val: 0 };
        gsap.to(proxy, {
          val: stat.to, duration: 2, ease: "power2.out",
          scrollTrigger: { trigger: statsRef.current, start: "top 88%", toggleActions: TA },
          onUpdate() {
            el.textContent = stat.decimal
              ? proxy.val.toFixed(1) + stat.suffix
              : Math.round(proxy.val) + stat.suffix;
          },
        });
      });

      gsap.fromTo(".stat-item",
        { y: 40, opacity: 0, scale: 0.92 },
        {
          y: 0, opacity: 1, scale: 1,
          duration: 0.65, stagger: 0.14, ease: "back.out(1.4)",
          scrollTrigger: { trigger: statsRef.current, start: "top 88%", toggleActions: TA },
        }
      );

      // CTA
      gsap.to(".cta-blob-tr", {
        y: -60, x: 30, ease: "none",
        scrollTrigger: { trigger: ctaRef.current, start: "top bottom", end: "bottom top", scrub: true },
      });
      gsap.to(".cta-blob-bl", {
        y: 50, x: -20, ease: "none",
        scrollTrigger: { trigger: ctaRef.current, start: "top bottom", end: "bottom top", scrub: true },
      });

      gsap.fromTo(".cta-word",
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.65, stagger: 0.06, ease: "power3.out",
          scrollTrigger: { trigger: ctaRef.current, start: "top 80%", toggleActions: TA },
        }
      );

      gsap.fromTo(".cta-sub",
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: ctaRef.current, start: "top 75%", toggleActions: TA },
        }
      );

      gsap.fromTo(".cta-btn",
        { scale: 0.7, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 0.7, ease: "back.out(2)",
          scrollTrigger: { trigger: ctaRef.current, start: "top 72%", toggleActions: TA },
        }
      );

      // Mascot: walk across then idle-blink beside button
      gsap.fromTo(ctaMascotRef.current,
        { x: -120, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 1.1, ease: "power2.out",
          scrollTrigger: {
            trigger: ctaRef.current, start: "top 72%", toggleActions: TA,
            onEnter: () => {
              setCtaWalking(true);
              if (ctaLottieRef.current) { ctaLottieRef.current.goToAndStop(0, true); ctaLottieRef.current.play(); }
              gsap.delayedCall(1.1, () => {
                setCtaWalking(false);
                if (ctaLottieRef.current) ctaLottieRef.current.stop();
              });
            },
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  // Idle bob when not walking
  useEffect(() => {
    if (ctaWalking || !ctaMascotRef.current) return;
    const tween = gsap.to(ctaMascotRef.current, {
      y: -6, duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: -1,
    });
    return () => { tween.kill(); gsap.set(ctaMascotRef.current, { y: 0 }); };
  }, [ctaWalking]);

  const handleUserTypeSelect = (type: "student" | "tutor") => {
    setIsDialogOpen(false);
    sessionStorage.setItem("userType", type);
    navigate("/register?mode=signup");
  };

  return (
    <>
      <section ref={sectionRef} id="reviews" className="relative bg-white pt-12 pb-32">
        <div className="max-w-7xl mx-auto px-8">

          <div ref={headingRef} className="text-center space-y-4 mb-20">
            <div className="test-badge inline-flex items-center px-4 py-1.5 bg-[#EDE9DF] border border-[#D6CFBF] text-[#1A2035]/80 text-sm rounded-full font-medium">
              Testimonials
            </div>
            <h3 className="text-5xl font-bold tracking-tight text-[#1A2035]">
              {"What Our Students Say".split(" ").map((word, i) => (
                <span key={i} className="test-title-word inline-block mr-[0.3em]">{word}</span>
              ))}
            </h3>
            <p className="test-subtitle text-lg text-[#1A2035]/60 max-w-2xl mx-auto">
              Join thousands of satisfied students who found their perfect tutor match.
            </p>
          </div>

          <div className="test-cards grid md:grid-cols-3 gap-6 mb-20">
            {testimonials.map((t, i) => (
              <div
                key={i}
                ref={(el) => { cardEls.current[i] = el; }}
                className="testimonial-card bg-[#F8F7F4] p-8 rounded-3xl border border-[#EDE9DF] will-change-transform cursor-default"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B]" />
                  ))}
                </div>
                <p className="text-[#1A2035]/70 leading-relaxed mb-8">"{t.content}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#EDE9DF] ring-2 ring-[#EDE9DF]">
                    <ImageWithFallback src={t.image} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A2035]">{t.name}</p>
                    <p className="text-sm text-[#1A2035]/50">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div ref={statsRef} className="grid md:grid-cols-3 gap-6">
            {stats.map((s, i) => (
              <div key={s.label} className="stat-item bg-[#F8F7F4] p-8 rounded-3xl text-center border border-[#EDE9DF]">
                <div className="text-5xl font-bold text-[#7C8D8C] mb-2">
                  <span ref={(el) => { statValRefs.current[i] = el; }}>
                    {s.decimal ? "0.0" + s.suffix : "0" + s.suffix}
                  </span>
                </div>
                <div className="text-[#1A2035]/60 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] pointer-events-none">
          <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-[80px]">
            <path fill="#7C8D8C" d="M0,40 Q180,20 360,40 T720,40 T1080,40 T1440,40 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaRef} className="py-24 bg-[#7C8D8C] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="cta-blob-tr absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-[120px] opacity-[0.07]" />
          <div className="cta-blob-bl absolute bottom-0 left-0 w-[400px] h-[400px] bg-white rounded-full blur-[100px] opacity-[0.05]" />
        </div>
        <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
          <h3 className="text-5xl font-bold text-white mb-4 overflow-hidden">
            {"Ready to Start Learning?".split(" ").map((word, i) => (
              <span key={i} className="cta-word inline-block mr-[0.3em]">{word}</span>
            ))}
          </h3>
          <p className="cta-sub text-xl text-white/70 mb-10">
            Join thousands of students and tutors on TutorFinder today.
          </p>
          <div className="cta-btn inline-flex items-end justify-center gap-3">
            <button
              onClick={() => setIsDialogOpen(true)}
              className="px-10 py-4 bg-[#FAFAF8] text-[#7C8D8C] rounded-full font-semibold hover:bg-[#F5F3EF] transition-all duration-300 shadow-xl shadow-black/20 text-lg border border-[#E5E4E1]"
            >
              Create Free Account →
            </button>
            {/* Walking / idle mascot beside the button */}
            <div ref={ctaMascotRef} style={{ width: 64, height: 64, opacity: 0, flexShrink: 0 }}>
              <div style={{ display: ctaWalking ? "block" : "none", width: "100%", height: "100%" }}>
                <Lottie lottieRef={ctaLottieRef} animationData={circleGuyData} autoplay={false} loop={true} style={{ width: "100%", height: "100%" }} />
              </div>
              <div style={{ display: ctaWalking ? "none" : "block", width: "100%", height: "100%" }}>
                <Lottie animationData={circleGuyIdleData} autoplay={true} loop={true} style={{ width: "100%", height: "100%" }} />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] pointer-events-none">
          <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-[80px]">
            <path fill="#2F3B3D" d="M0,40 Q180,20 360,40 T720,40 T1080,40 T1440,40 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </section>

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
    </>
  );
}
