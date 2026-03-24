import { ArrowRight } from "lucide-react";
import { ImageWithFallback } from "./shared/ImageWithFallback";
import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export function Hero() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleGetStarted = () => {
    setIsDialogOpen(true);
  };

  const handleUserTypeSelect = (type: "student" | "tutor") => {
    setIsDialogOpen(false);
    // Store user type in sessionStorage for registration flow
    sessionStorage.setItem("userType", type);
    navigate("/register");
  };

  return (
    <section className="relative overflow-hidden">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-10 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl tracking-tight text-[#2F3B3D]">TutorMatch</h1>
          <div className="flex items-center gap-8">
            <a href="#features" className="text-sm text-[#2F3B3D] hover:text-[#7C8D8C] transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-[#2F3B3D] hover:text-[#7C8D8C] transition-colors">How It Works</a>
            <a href="#reviews" className="text-sm text-[#2F3B3D] hover:text-[#7C8D8C] transition-colors">Reviews</a>
            <button 
              onClick={handleGetStarted}
              className="px-6 py-2 bg-[#7C8D8C] text-white text-sm rounded-full hover:bg-[#2F3B3D] transition-all duration-300"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-8 pt-32 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-block px-4 py-1 bg-[#E9D8BB] text-[#2F3B3D] text-sm rounded-full">
              Swipe. Match. Learn.
            </div>
            <h2 className="text-6xl tracking-tight text-[#2F3B3D] leading-[1.1]">
              Find your perfect tutor with a swipe
            </h2>
            <p className="text-lg text-[#2F3B3D]/70 leading-relaxed max-w-lg">
              Discover qualified tutors and eager students through an intuitive matching experience. Built for modern learners and educators.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-[#7C8D8C] text-white rounded-full hover:bg-[#2F3B3D] transition-all duration-300 flex items-center gap-2 group"
              >
                Start Matching
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => {
                  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-8 py-4 bg-transparent text-[#2F3B3D] rounded-full border border-[#C9B08E] hover:bg-[#E9D8BB] transition-all duration-300"
              >
                Learn More
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-[#E9D8BB]">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1630406144797-821be1f35d75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0dXRvciUyMHRlYWNoaW5nJTIwc3R1ZGVudHxlbnwxfHx8fDE3NzQyNjMwMzZ8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Tutor teaching student"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-[#C9B08E] rounded-full blur-3xl opacity-30"></div>
            <div className="absolute -top-8 -right-8 w-64 h-64 bg-[#7C8D8C] rounded-full blur-3xl opacity-20"></div>
          </div>
        </div>
      </div>

      {/* Sign Up Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#FFF2D5] border-[#C9B08E]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#2F3B3D]">Get Started with TutorMatch</DialogTitle>
            <DialogDescription className="text-[#2F3B3D]/70">
              Choose your account type to continue
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              onClick={() => handleUserTypeSelect("student")}
              className="p-8 bg-[#E9D8BB] rounded-2xl hover:bg-[#7C8D8C] hover:text-white transition-all duration-300 group"
            >
              <div className="text-4xl mb-2">🎓</div>
              <h4 className="text-lg mb-2 text-[#2F3B3D] group-hover:text-white">I'm a Student</h4>
              <p className="text-sm text-[#2F3B3D]/70 group-hover:text-white/80">
                Find the perfect tutor for your learning needs
              </p>
            </button>
            <button
              onClick={() => handleUserTypeSelect("tutor")}
              className="p-8 bg-[#E9D8BB] rounded-2xl hover:bg-[#7C8D8C] hover:text-white transition-all duration-300 group"
            >
              <div className="text-4xl mb-2">👨‍🏫</div>
              <h4 className="text-lg mb-2 text-[#2F3B3D] group-hover:text-white">I'm a Tutor</h4>
              <p className="text-sm text-[#2F3B3D]/70 group-hover:text-white/80">
                Connect with students and share your expertise
              </p>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}