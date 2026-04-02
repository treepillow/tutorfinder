import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ImageWithFallback } from "./shared/ImageWithFallback";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { num: 1, title: "Create Your Profile",  desc: "Sign up as a tutor or student. Add your subjects, availability, and what you're looking for." },
  { num: 2, title: "Discover & Swipe",     desc: "Browse through curated profiles. Swipe right if you're interested, left to pass." },
  { num: 3, title: "Match & Connect",      desc: "When both sides swipe right — it's a match! Start chatting and sort out the details." },
  { num: 4, title: "Book & Learn",         desc: "Schedule sessions, pay securely, and kick off your learning journey." },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const stepsRef   = useRef<HTMLDivElement>(null);
  const lineRef    = useRef<HTMLDivElement>(null);
  const whyRef     = useRef<HTMLDivElement>(null);
  const imageRef   = useRef<HTMLDivElement>(null);
  const stepEls    = useRef<(HTMLDivElement | null)[]>([]);

  // Hover lift on step cards
  useEffect(() => {
    const cleanups: (() => void)[] = [];
    stepEls.current.forEach((el) => {
      if (!el) return;
      const onEnter = () => gsap.to(el, { y: -8, scale: 1.03, duration: 0.35, ease: "power2.out" });
      const onLeave = () => gsap.to(el, { y:  0, scale: 1,    duration: 0.5,  ease: "power3.out" });
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
      cleanups.push(() => { el.removeEventListener("mouseenter", onEnter); el.removeEventListener("mouseleave", onLeave); });
    });
    return () => cleanups.forEach(fn => fn());
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const TA = "play none none reverse";

      gsap.from(".hiw-badge", {
        y: 20, opacity: 0, duration: 0.6, ease: "power3.out",
        scrollTrigger: { trigger: headingRef.current, start: "top 88%", toggleActions: TA },
      });

      gsap.from(".hiw-title-word", {
        y: 50, opacity: 0, duration: 0.6, stagger: 0.07, ease: "power3.out",
        scrollTrigger: { trigger: headingRef.current, start: "top 82%", toggleActions: TA },
      });

      gsap.from(".hiw-subtitle", {
        y: 24, opacity: 0, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: headingRef.current, start: "top 75%", toggleActions: TA },
      });

      // Connector line draws left → right
      gsap.fromTo(lineRef.current,
        { scaleX: 0 },
        {
          scaleX: 1, ease: "none",
          scrollTrigger: { trigger: stepsRef.current, start: "top 72%", end: "center 60%", scrub: 1 },
        }
      );

      // Steps pop in with scrub
      gsap.fromTo(".how-step",
        { y: 50, scale: 0.8, opacity: 0 },
        {
          y: 0, scale: 1, opacity: 1,
          ease: "back.out(1.6)", stagger: 0.18,
          scrollTrigger: { trigger: stepsRef.current, start: "top 72%", end: "center 58%", scrub: 0.8 },
        }
      );

      // Number badges pulse once after appearing
      gsap.fromTo(".step-num",
        { scale: 0, opacity: 0 },
        {
          scale: 1, opacity: 1,
          ease: "back.out(3)", stagger: 0.18, duration: 0.5,
          scrollTrigger: { trigger: stepsRef.current, start: "top 65%", toggleActions: TA },
        }
      );

      gsap.fromTo(".why-text",
        { x: -60, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: whyRef.current, start: "top 80%", toggleActions: TA },
        }
      );

      gsap.fromTo(".why-item",
        { x: -30, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: "power3.out",
          scrollTrigger: { trigger: ".why-list", start: "top 82%", toggleActions: TA },
        }
      );

      gsap.fromTo(".why-image",
        { x: 70, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: whyRef.current, start: "top 80%", toggleActions: TA },
        }
      );

      gsap.to(imageRef.current, {
        y: -40, ease: "none",
        scrollTrigger: { trigger: whyRef.current, start: "top bottom", end: "bottom top", scrub: true },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="how-it-works" className="relative bg-[#F5F3EF] pt-12 pb-36">
      <div className="max-w-7xl mx-auto px-8">

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

        <div ref={stepsRef} className="relative grid grid-cols-4 gap-8">
          <div
            ref={lineRef}
            className="absolute top-[52px] left-[12%] right-[12%] border-t-2 border-dashed border-[#C8BFAE] pointer-events-none"
            style={{ transformOrigin: "left center" }}
          />

          {steps.map((step, i) => (
            <div
              key={i}
              ref={(el) => { stepEls.current[i] = el; }}
              className="how-step flex flex-col items-center text-center gap-5 cursor-default will-change-transform"
            >
              <div className="relative z-10">
                <div className="w-[104px] h-[104px] bg-[#EDE9DF] rounded-full flex items-center justify-center text-5xl font-black border-4 border-[#D6CFBF] shadow-md text-[#7C8D8C]">
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
            <div className="why-list space-y-4">
              {[
                { label: "Verified Tutors",  desc: "All tutors are background-checked and verified" },
                { label: "All Subjects",     desc: "From math to music, find tutors for any subject" },
                { label: "Rated & Reviewed", desc: "Read honest reviews from real students" },
              ].map((item) => (
                <div key={item.label} className="why-item flex items-start gap-4 p-4 rounded-2xl bg-[#FAFAF8] border border-[#E5E4E1] hover:border-[#7C8D8C]/30 transition-all duration-300">
                  <div className="w-6 h-6 rounded-full bg-[#7C8D8C] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A2035] leading-tight">{item.label}</p>
                    <p className="text-sm text-[#1A2035]/60 mt-1">{item.desc}</p>
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

      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] pointer-events-none">
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-[80px]">
          <path fill="#ffffff" d="M0,40 Q180,20 360,40 T720,40 T1080,40 T1440,40 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </section>
  );
}
