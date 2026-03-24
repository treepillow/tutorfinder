import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#2F3B3D] text-white py-16">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <h4 className="text-2xl mb-4">TutorMatch</h4>
            <p className="text-white/60 text-sm leading-relaxed">
              Connecting students and tutors through innovative matching technology.
            </p>
          </div>
          <div>
            <h5 className="mb-4">Product</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="text-white/60 hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="text-white/60 hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#reviews" className="text-white/60 hover:text-white transition-colors">Reviews</a></li>
            </ul>
          </div>
          <div>
            <h5 className="mb-4">Company</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>
          <div>
            <h5 className="mb-4">Legal</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Safety Guidelines</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/60">
            © 2026 TutorMatch. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#7C8D8C] transition-all duration-300">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#7C8D8C] transition-all duration-300">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#7C8D8C] transition-all duration-300">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#7C8D8C] transition-all duration-300">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
