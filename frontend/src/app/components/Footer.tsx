import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Columns cascade up
      const TA = "play none none reverse";

      gsap.fromTo(".footer-col",
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 0.65, stagger: 0.12, ease: "power3.out",
          scrollTrigger: { trigger: footerRef.current, start: "top 92%", toggleActions: TA },
        }
      );

      // Bottom bar fades in after columns
      gsap.fromTo(".footer-bottom",
        { opacity: 0 },
        {
          opacity: 1, duration: 0.8, ease: "power2.out",
          scrollTrigger: { trigger: ".footer-bottom", start: "top 98%", toggleActions: TA },
        }
      );

      // Social icons pop in with bounce stagger
      gsap.fromTo(".footer-social",
        { scale: 0, opacity: 0 },
        {
          scale: 1, opacity: 1,
          duration: 0.5, stagger: 0.08, ease: "back.out(2.5)",
          scrollTrigger: { trigger: ".footer-bottom", start: "top 98%", toggleActions: TA },
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="bg-[#2F3B3D] text-white py-16">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="footer-col">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/favicon.svg" alt="TutorFinder" className="w-8 h-8" />
              <h4 className="text-xl font-semibold">
                Tutor<span className="text-[#7C8D8C]">Finder</span>
              </h4>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              Connecting students and tutors through innovative matching technology.
            </p>
          </div>
          <div className="footer-col">
            <h5 className="mb-4 font-semibold text-white/90">Product</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="#features"     className="text-white/50 hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="text-white/50 hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#"             className="text-white/50 hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#reviews"      className="text-white/50 hover:text-white transition-colors">Reviews</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5 className="mb-4 font-semibold text-white/90">Company</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-white/50 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-white/50 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-white/50 hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="text-white/50 hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5 className="mb-4 font-semibold text-white/90">Legal</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-white/50 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-white/50 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-white/50 hover:text-white transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="text-white/50 hover:text-white transition-colors">Safety Guidelines</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/40">
            © 2026 TutorFinder. All rights reserved.
          </p>
          <div className="flex gap-3">
            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="footer-social w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#7C8D8C] transition-all duration-300">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
