import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ImageWithFallback } from "./shared/ImageWithFallback";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { emoji: "🙋", num: 1, title: "Create Your Profile",  desc: "Sign up as a tutor or student. Add your subjects, availability, and what you're looking for.", bg: "bg-[#EEF2FF]" },
  { emoji: "🔍", num: 2, title: "Discover & Swipe",     desc: "Browse through curated profiles. Swipe right if you're interested, left to pass.", bg: "bg-[#FFF7ED]" },
  { emoji: "💫", num: 3, title: "Match & Connect",      desc: "When both sides swipe right — it's a match! Start chatting and sort out the details.", bg: "bg-[#F0FDF4]" },
  { emoji: "🚀", num: 4, title: "Book & Learn",         desc: "Schedule sessions, pay securely, and kick off your learning journey.", bg: "bg-[#FEF2F2]" },
];
const numColors = ["bg-[#7C8D8C]", "bg-[#F59E0B]", "bg-[#10B981]", "bg-[#EF4444]"];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const stepsRef   = useRef<HTMLDivElement>(null);
  const lineRef    = useRef<HTMLDivElement>(null);
  const whyRef     = useRef<HTMLDivElement>(null);
  const imageRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const TA = "play none none reverse";

      // Badge fades up
      gsap.from(".hiw-badge", {
        y: 20, opacity: 0, duration: 0.6, ease: "power3.out",
        scrollTrigger: { trigger: headingRef.current, start: "top 88%", toggleActions: TA },
      });

      // Title — word by word
      gsap.from(".hiw-title-word", {
        y: 50, opacity: 0, duration: 0.6, stagger: 0.07, ease: "power3.out",
        scrollTrigger: { trigger: headingRef.current, start: "top 82%", toggleActions: TA },
      });

      gsap.from(".hiw-subtitle", {
        y: 24, opacity: 0, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: headingRef.current, start: "top 75%", toggleActions: TA },
      });

      // Connector line draws left → right, scrubbed to scroll
      gsap.fromTo(lineRef.current,
        { scaleX: 0 },
        {
          scaleX: 1, ease: "none",
          scrollTrigger: {
            trigger: stepsRef.current,
            start: "top 72%",
            end: "center 60%",
            scrub: 1,
          },
        }
      );

      // Steps emerge as you scroll — scrubbed stagger
      gsap.fromTo(".how-step",
        { y: 50, scale: 0.8, opacity: 0 },
        {
          y: 0, scale: 1, opacity: 1,
          ease: "back.out(1.6)",
          stagger: 0.18,
          scrollTrigger: {
            trigger: stepsRef.current,
            start: "top 72%",
            end: "center 58%",
            scrub: 0.8,
          },
        }
      );

      // Why-choose-us: left text slides in
      gsap.fromTo(".why-text",
        { x: -60, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: whyRef.current, start: "top 80%", toggleActions: TA },
        }
      );

      // Why checklist items cascade in
      gsap.fromTo(".why-item",
        { x: -30, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: "power3.out",
          scrollTrigger: { trigger: ".why-list", start: "top 82%", toggleActions: TA },
        }
      );

      // Image slides from right
      gsap.fromTo(".why-image",
        { x: 70, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: whyRef.current, start: "top 80%", toggleActions: TA },
        }
      );

      // Image subtle parallax as you scroll past it
      gsap.to(imageRef.current, {
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: whyRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="how-it-works" className="relative bg-[#F5F3EF] pt-12 pb-36">
      <div className="max-w-7xl mx-auto px-8">

        {/* Header */}
        <div ref={headingRef} className="text-center space-y-4 mb-20">
          <div className="hiw-badge inline-flex items-center px-4 py-1.5 bg-[#EDE9DF] border border-[#D6CFBF] text-[#1A2035]/80 text-sm rounded-full font-medium">
            How It Works
          </div>
          <h3 className="text-5xl font-bold tracking-tight text-[#1A2035]">
            {"Simple steps to success".split(" ").map((word, i) => (
              <span key={i} className="hiw-title-word inline-block mr-[0.3em]">{word}</span>
            ))}
          </h3>
          <p className="hiw-subtitle text-lg text-[#1A2035]/60 max-w-2xl mx-auto">
            Getting started with TutorFinder is easy. Follow these simple steps to connect with your ideal tutor.
          </p>
        </div>

        {/* Steps */}
        <div ref={stepsRef} className="relative grid grid-cols-4 gap-8">
          {/* Scrubbed connector line — transform-origin left so scaleX draws left→right */}
          <div
            ref={lineRef}
            className="absolute top-[52px] left-[12%] right-[12%] border-t-2 border-dashed border-[#C8BFAE] pointer-events-none"
            style={{ transformOrigin: "left center" }}
          />

          {steps.map((step, i) => (
            <div key={i} className="how-step flex flex-col items-center text-center gap-5">
              <div className="relative z-10">
                <div className={`w-[104px] h-[104px] ${step.bg} rounded-full flex items-center justify-center text-5xl border-4 border-white shadow-md`}>
                  {step.emoji}
                </div>
                <div className={`absolute -top-1 -right-1 w-7 h-7 ${numColors[i]} text-white text-xs font-black rounded-full flex items-center justify-center shadow-lg`}>
                  {step.num}
                </div>
              </div>
              <div className="space-y-2 px-2">
                <h5 className="font-bold text-[#1A2035] text-lg leading-tight">{step.title}</h5>
                <p className="text-[#1A2035]/60 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Why choose us */}
        <div ref={whyRef} className="mt-28 grid lg:grid-cols-2 gap-12 items-center">
          <div className="why-text space-y-7">
            <div className="inline-flex items-center px-4 py-1.5 bg-[#EDE9DF] border border-[#D6CFBF] text-[#1A2035]/80 text-sm rounded-full font-medium">
              Why Choose Us
            </div>
            <h4 className="text-4xl font-bold tracking-tight text-[#1A2035]">
              Personalized Learning Experience
            </h4>
            <p className="text-[#1A2035]/60 leading-relaxed">
              We believe every student deserves a tailored learning experience. Our platform uses smart matching to pair you with tutors who get your unique needs.
            </p>
            <div className="why-list space-y-5">
              {[
                { emoji: "✅", label: "Verified Tutors",  desc: "All tutors are background-checked and verified" },
                { emoji: "📖", label: "All Subjects",     desc: "From math to music, find tutors for any subject" },
                { emoji: "⭐", label: "Rated & Reviewed", desc: "Read honest reviews from real students" },
              ].map((item) => (
                <div key={item.label} className="why-item flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl flex-shrink-0">
                    {item.emoji}
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A2035] leading-tight">{item.label}</p>
                    <p className="text-sm text-[#1A2035]/60">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="why-image relative">
            <div ref={imageRef} className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl will-change-transform">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1701627091488-027ddbf45dfc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwc3R1ZHlpbmclMjBjb2ZmZWUlMjBzaG9wfGVufDF8fHx8MTc3NDM1NDA2OXww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Student studying"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-[#7C8D8C] rounded-full blur-3xl opacity-10 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Wavy divider → Testimonials (#ffffff) */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] pointer-events-none">
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-[80px]">
          <path fill="#ffffff" d="M0,50 C180,10 360,75 540,40 C720,5 900,65 1080,38 C1260,12 1380,58 1440,42 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </section>
  );
}
