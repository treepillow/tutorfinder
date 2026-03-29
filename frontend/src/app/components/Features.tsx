import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    emoji: "🤝",
    title: "Intuitive Matching",
    description: "Swipe through profiles just like modern dating apps. Left to skip, right to match. It's that simple.",
    circleBg: "bg-[#EEF2FF]",
    glow: "bg-[#818CF8]",
    tag: "Most loved",
  },
  {
    emoji: "📅",
    title: "Smart Scheduling",
    description: "Seamlessly coordinate availability with integrated scheduling. Book lessons at times that work for everyone.",
    circleBg: "bg-[#FFF7ED]",
    glow: "bg-[#FB923C]",
    tag: null,
  },
  {
    emoji: "✅",
    title: "Verified Profiles",
    description: "All tutors are verified with their educational credentials. Learn with confidence and peace of mind.",
    circleBg: "bg-[#F0FDF4]",
    glow: "bg-[#4ADE80]",
    tag: null,
  },
  {
    emoji: "⚡",
    title: "Instant Connections",
    description: "Get matched instantly when both parties swipe right. Start your learning journey without delays.",
    circleBg: "bg-[#FEFCE8]",
    glow: "bg-[#FDE047]",
    tag: "New",
  },
];

export function Features() {
  const sectionRef  = useRef<HTMLElement>(null);
  const headingRef  = useRef<HTMLDivElement>(null);
  const gridRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const TA = "play none none reverse";

      // Badge fades up
      gsap.from(".feat-badge", {
        y: 20, opacity: 0, duration: 0.6, ease: "power3.out",
        scrollTrigger: { trigger: headingRef.current, start: "top 88%", toggleActions: TA },
      });

      // Title — word by word
      gsap.from(".feat-title-word", {
        y: 50, opacity: 0, duration: 0.6, stagger: 0.07, ease: "power3.out",
        scrollTrigger: { trigger: headingRef.current, start: "top 82%", toggleActions: TA },
      });

      // Subtitle slides up
      gsap.from(".feat-subtitle", {
        y: 24, opacity: 0, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: headingRef.current, start: "top 75%", toggleActions: TA },
      });

      // Left-column items slide in from the left, staggered
      gsap.fromTo(".feat-left",
        { x: -70, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.85, stagger: 0.2, ease: "power3.out",
          scrollTrigger: { trigger: gridRef.current, start: "top 82%", toggleActions: TA },
        }
      );

      // Right-column items slide in from the right, staggered
      gsap.fromTo(".feat-right",
        { x: 70, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.85, stagger: 0.2, ease: "power3.out",
          scrollTrigger: { trigger: gridRef.current, start: "top 82%", toggleActions: TA },
        }
      );

      // Emoji circles scale + spin bounce, slightly delayed
      gsap.fromTo(".feat-emoji",
        { scale: 0, rotate: -25, opacity: 0 },
        {
          scale: 1, rotate: 0, opacity: 1,
          duration: 0.65, stagger: 0.18, ease: "back.out(2.5)",
          scrollTrigger: { trigger: gridRef.current, start: "top 78%", toggleActions: TA },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="features" className="relative bg-white pt-12 pb-36">
      <div className="max-w-7xl mx-auto px-8">

        <div ref={headingRef} className="text-center space-y-4 mb-20">
          <div className="feat-badge inline-flex items-center px-4 py-1.5 bg-[#EDE9DF] border border-[#D6CFBF] text-[#1A2035]/80 text-sm rounded-full font-medium">
            Key Features
          </div>
          <h3 className="text-5xl font-bold tracking-tight text-[#1A2035]">
            {"Everything you need to succeed".split(" ").map((word, i) => (
              <span key={i} className="feat-title-word inline-block mr-[0.3em]">{word}</span>
            ))}
          </h3>
          <p className="feat-subtitle text-lg text-[#1A2035]/60 max-w-2xl mx-auto">
            Powerful features designed to make finding and booking tutors effortless
          </p>
        </div>

        <div ref={gridRef} className="grid md:grid-cols-2 gap-x-20 gap-y-14 max-w-4xl mx-auto">
          {features.map((feature, i) => (
            <div key={i} className={`flex gap-6 items-start ${i % 2 === 0 ? "feat-left" : "feat-right"}`}>
              <div className="relative flex-shrink-0">
                <div className={`absolute inset-0 ${feature.glow} rounded-full blur-2xl opacity-25 scale-[2] pointer-events-none`} />
                <div className={`feat-emoji relative w-[68px] h-[68px] ${feature.circleBg} rounded-full flex items-center justify-center text-[2rem] shadow-sm`}>
                  {feature.emoji}
                </div>
              </div>
              <div className="pt-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-xl font-bold text-[#1A2035]">{feature.title}</h4>
                  {feature.tag && (
                    <span className="px-2.5 py-0.5 bg-[#7C8D8C] text-white text-[10px] font-bold rounded-full uppercase tracking-wide">
                      {feature.tag}
                    </span>
                  )}
                </div>
                <p className="text-[#1A2035]/60 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wavy divider → HowItWorks (#F5F3EF) */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] pointer-events-none">
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-[80px]">
          <path fill="#F5F3EF" d="M0,50 C180,10 360,75 540,40 C720,5 900,65 1080,38 C1260,12 1380,58 1440,42 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </section>
  );
}
