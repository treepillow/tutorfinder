import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: "↔",
    title: "Intuitive Matching",
    description: "Swipe through profiles just like modern dating apps. Left to skip, right to match. It's that simple.",
    circleBg: "bg-[#EDE9DF]",
    tag: "Most loved",
  },
  {
    icon: "📆",
    title: "Smart Scheduling",
    description: "Seamlessly coordinate availability with integrated scheduling. Book lessons at times that work for everyone.",
    circleBg: "bg-[#EDE9DF]",
    tag: null,
  },
  {
    icon: "✓",
    title: "Verified Profiles",
    description: "All tutors are verified with their educational credentials. Learn with confidence and peace of mind.",
    circleBg: "bg-[#EDE9DF]",
    tag: null,
  },
  {
    icon: "⚡",
    title: "Instant Connections",
    description: "Get matched instantly when both parties swipe right. Start your learning journey without delays.",
    circleBg: "bg-[#EDE9DF]",
    tag: "New",
  },
];

export function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef    = useRef<HTMLDivElement>(null);
  const cardEls    = useRef<(HTMLDivElement | null)[]>([]);



  // Scroll animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      const TA = "play none none reverse";

      gsap.from(".feat-badge", {
        y: 20, opacity: 0, duration: 0.6, ease: "power3.out",
        scrollTrigger: { trigger: headingRef.current, start: "top 88%", toggleActions: TA },
      });

      gsap.from(".feat-title-word", {
        y: 50, opacity: 0, duration: 0.6, stagger: 0.07, ease: "power3.out",
        scrollTrigger: { trigger: headingRef.current, start: "top 82%", toggleActions: TA },
      });

      gsap.from(".feat-subtitle", {
        y: 24, opacity: 0, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: headingRef.current, start: "top 75%", toggleActions: TA },
      });

      // Cards rise and fade in with stagger
      gsap.fromTo(".feat-card",
        { y: 60, opacity: 0, scale: 0.94 },
        {
          y: 0, opacity: 1, scale: 1,
          duration: 0.7, stagger: 0.12, ease: "power3.out",
          scrollTrigger: { trigger: gridRef.current, start: "top 82%", toggleActions: TA },
        }
      );

      gsap.fromTo(".feat-icon",
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

        <div ref={gridRef} className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feature, i) => (
            <div
              key={i}
              ref={(el) => { cardEls.current[i] = el; }}
              className="feat-card relative overflow-hidden rounded-2xl border border-[#E5E4E1] bg-[#FAFAF8] p-7 flex gap-5 items-start shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="relative flex-shrink-0">
                <div className={`feat-icon relative w-[60px] h-[60px] ${feature.circleBg} rounded-xl flex items-center justify-center text-2xl font-bold text-[#7C8D8C]`}>
                  {feature.icon}
                </div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1.5">
                  <h4 className="text-lg font-semibold text-[#1A2035]">{feature.title}</h4>
                  {feature.tag && (
                    <span className="px-2 py-0.5 bg-[#7C8D8C] text-white text-[9px] font-semibold rounded-md uppercase tracking-wide">
                      {feature.tag}
                    </span>
                  )}
                </div>
                <p className="text-[#1A2035]/70 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] pointer-events-none">
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-[80px]">
          <path fill="#F5F3EF" d="M0,40 Q180,20 360,40 T720,40 T1080,40 T1440,40 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </section>
  );
}
