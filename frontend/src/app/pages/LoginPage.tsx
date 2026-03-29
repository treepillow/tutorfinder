import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import gsap from "gsap";

type Mode = "login" | "signup";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<Mode>(initialMode);

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  // Signup state
  const [userType, setUserType] = useState<"student" | "tutor">("student");
  const [signupData, setSignupData] = useState({
    name: "", contactNumber: "", birthday: "", gender: "",
    email: "", password: "", confirmPassword: "",
  });
  const [showSignupPassword, setShowSignupPassword] = useState(false);


  const handleLogin = (e: React.SyntheticEvent) => {
    e.preventDefault();
    localStorage.setItem("currentUser", JSON.stringify({ email, userType: "student" }));
    navigate("/app/discover");
  };

  const handleSignup = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    sessionStorage.setItem("userType", userType);
    sessionStorage.setItem("basicDetails", JSON.stringify(signupData));

    const dest = userType === "tutor" ? "/register/tutor" : "/register/student";
    const overlay = document.createElement("div");
    overlay.style.cssText =
      "position:fixed;inset:0;background:#2F3B3D;z-index:9999;clip-path:circle(0% at 50% 50%)";
    document.body.appendChild(overlay);

    gsap.to(overlay, {
      clipPath: "circle(150% at 50% 50%)",
      duration: 0.55,
      ease: "power2.inOut",
      onComplete: () => {
        navigate(dest);
        gsap.to(overlay, {
          clipPath: "circle(0% at 50% 50%)",
          duration: 0.55,
          ease: "power2.inOut",
          delay: 0.05,
          onComplete: () => overlay.remove(),
        });
      },
    });
  };

  const illustrationRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const animating = useRef(false);

  useEffect(() => {
    if (initialMode === "signup") {
      gsap.set(illustrationRef.current, { xPercent: 100 });
      gsap.set(formRef.current, { xPercent: -100 });
    }
  }, []);

  const switchMode = (newMode: Mode) => {
    if (newMode === mode || animating.current) return;
    animating.current = true;
    const toLogin = newMode === "login";

    const tl = gsap.timeline({
      defaults: { ease: "expo.inOut", duration: 0.7 },
      onComplete: () => { animating.current = false; },
    });

    tl.to(formRef.current, { opacity: 0, duration: 0.18, ease: "power2.in" })
      .to(illustrationRef.current, { xPercent: toLogin ? 0 : 100 }, "<")
      .to(formRef.current,         { xPercent: toLogin ? 0 : -100 }, "<")
      .call(() => setMode(newMode), [], 0.3)
      .to(formRef.current, { opacity: 1, duration: 0.3, ease: "power2.out" }, 0.3);
  };

  const signupChange = (field: string, value: string) =>
    setSignupData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Illustration panel */}
      <div
        ref={illustrationRef}
        className="absolute top-0 left-0 h-full w-1/2 bg-[#EDE9DF] hidden lg:flex flex-col items-center justify-center p-16"
      >
        <div className="w-48 h-48 rounded-full bg-[#D6CFBF]/40" />
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-[#1A2035] mb-2">Find your perfect tutor</h2>
          <p className="text-[#1A2035]/50 text-sm">Connect with top tutors across Singapore</p>
        </div>
      </div>


      {/* Form panel */}
      <div
        ref={formRef}
        className="absolute top-0 left-1/2 h-full w-1/2 bg-white flex flex-col items-center justify-center overflow-y-auto"
      >
        {mode === "login" ? (
          /* ── LOGIN FORM ── */
          <div className="w-full max-w-sm px-8 py-12">
            <div className="flex justify-center mb-8">
              <a href="/">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <line x1="14" y1="1" x2="14" y2="27" stroke="#1A2035" strokeWidth="3" strokeLinecap="round" />
                  <line x1="1" y1="14" x2="27" y2="14" stroke="#1A2035" strokeWidth="3" strokeLinecap="round" />
                  <line x1="4.05" y1="4.05" x2="23.95" y2="23.95" stroke="#1A2035" strokeWidth="3" strokeLinecap="round" />
                  <line x1="23.95" y1="4.05" x2="4.05" y2="23.95" stroke="#1A2035" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </a>
            </div>

            <h1 className="text-3xl font-bold text-[#1A2035] text-center mb-1">Welcome back!</h1>
            <p className="text-[#1A2035]/50 text-sm text-center mb-8">Please enter your details</p>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs text-[#1A2035]/50 font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-transparent border-0 border-b border-[#D6CFBF] pb-2 text-[#1A2035] text-sm placeholder:text-[#1A2035]/30 focus:outline-none focus:border-[#7C8D8C] transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#1A2035]/50 font-medium">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-transparent border-0 border-b border-[#D6CFBF] pb-2 pr-8 text-[#1A2035] text-sm placeholder:text-[#1A2035]/30 focus:outline-none focus:border-[#7C8D8C] transition-colors"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 bottom-2 text-[#1A2035]/40 hover:text-[#1A2035]/70 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#7C8D8C] rounded" />
                  <span className="text-xs text-[#1A2035]/60">Remember for 30 days</span>
                </label>
                <button type="button" className="text-xs text-[#1A2035]/40 hover:text-[#7C8D8C] transition-colors">
                  Forgot password?
                </button>
              </div>

              <button type="submit"
                className="w-full py-3.5 bg-[#2F3B3D] text-white rounded-full text-sm font-semibold hover:bg-[#7C8D8C] transition-all duration-300 shadow-lg shadow-[#2F3B3D]/20">
                Log In
              </button>

              <button type="button"
                className="w-full py-3.5 bg-white border border-[#E8E4DC] rounded-full text-sm font-medium text-[#1A2035] hover:bg-[#FAFAF8] transition-all duration-300 flex items-center justify-center gap-2.5 shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Log in with Google
              </button>
            </form>

            <p className="text-center text-xs text-[#1A2035]/40 mt-8">
              Don't have an account?{" "}
              <button onClick={() => switchMode("signup")} className="text-[#7C8D8C] font-medium hover:underline">
                Sign Up
              </button>
            </p>
          </div>
        ) : (
          /* ── SIGNUP FORM ── */
          <div className="w-full max-w-sm px-8 py-12">
            <div className="flex justify-center mb-6">
              <a href="/">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <line x1="14" y1="1" x2="14" y2="27" stroke="#1A2035" strokeWidth="3" strokeLinecap="round" />
                  <line x1="1" y1="14" x2="27" y2="14" stroke="#1A2035" strokeWidth="3" strokeLinecap="round" />
                  <line x1="4.05" y1="4.05" x2="23.95" y2="23.95" stroke="#1A2035" strokeWidth="3" strokeLinecap="round" />
                  <line x1="23.95" y1="4.05" x2="4.05" y2="23.95" stroke="#1A2035" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </a>
            </div>

            <h1 className="text-3xl font-bold text-[#1A2035] text-center mb-1">Create account</h1>
            <p className="text-[#1A2035]/50 text-sm text-center mb-6">Please enter your details</p>

            {/* Role selector */}
            <div className="relative flex mb-6 p-1 bg-[#F5F3EF] rounded-full">
              {/* sliding pill */}
              <div
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#2F3B3D] rounded-full shadow transition-transform duration-300 ease-in-out"
                style={{ transform: userType === "student" ? "translateX(0%)" : "translateX(calc(100% + 8px))" }}
              />
              {(["student", "tutor"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setUserType(type)}
                  className={`relative z-10 flex-1 py-2 rounded-full text-sm font-medium transition-colors duration-300 capitalize ${
                    userType === type ? "text-white" : "text-[#1A2035]/60 hover:text-[#1A2035]"
                  }`}
                >
                  {type === "student" ? "🎓 Student" : "👨‍🏫 Tutor"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-[#1A2035]/50 font-medium">Full Name</label>
                <input type="text" value={signupData.name} onChange={(e) => signupChange("name", e.target.value)}
                  required placeholder="John Doe"
                  className="w-full bg-transparent border-0 border-b border-[#D6CFBF] pb-2 text-[#1A2035] text-sm placeholder:text-[#1A2035]/30 focus:outline-none focus:border-[#7C8D8C] transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-[#1A2035]/50 font-medium">Contact No.</label>
                  <input type="tel" value={signupData.contactNumber} onChange={(e) => signupChange("contactNumber", e.target.value)}
                    required placeholder="+65 9123 4567"
                    className="w-full bg-transparent border-0 border-b border-[#D6CFBF] pb-2 text-[#1A2035] text-sm placeholder:text-[#1A2035]/30 focus:outline-none focus:border-[#7C8D8C] transition-colors" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[#1A2035]/50 font-medium">Birthday</label>
                  <input type="date" value={signupData.birthday} onChange={(e) => signupChange("birthday", e.target.value)}
                    required
                    className="w-full bg-transparent border-0 border-b border-[#D6CFBF] pb-2 text-[#1A2035] text-sm focus:outline-none focus:border-[#7C8D8C] transition-colors" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#1A2035]/50 font-medium">Gender</label>
                <div className="flex gap-4 pt-1">
                  {["Male", "Female", "Other"].map((g) => (
                    <label key={g} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="gender" value={g} checked={signupData.gender === g}
                        onChange={(e) => signupChange("gender", e.target.value)}
                        className="accent-[#7C8D8C]" required />
                      <span className="text-xs text-[#1A2035]/70">{g}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#1A2035]/50 font-medium">Email</label>
                <input type="email" value={signupData.email} onChange={(e) => signupChange("email", e.target.value)}
                  required placeholder="you@example.com"
                  className="w-full bg-transparent border-0 border-b border-[#D6CFBF] pb-2 text-[#1A2035] text-sm placeholder:text-[#1A2035]/30 focus:outline-none focus:border-[#7C8D8C] transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-[#1A2035]/50 font-medium">Password</label>
                  <div className="relative">
                    <input type={showSignupPassword ? "text" : "password"} value={signupData.password}
                      onChange={(e) => signupChange("password", e.target.value)} required placeholder="••••••••"
                      className="w-full bg-transparent border-0 border-b border-[#D6CFBF] pb-2 pr-6 text-[#1A2035] text-sm placeholder:text-[#1A2035]/30 focus:outline-none focus:border-[#7C8D8C] transition-colors" />
                    <button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-0 bottom-2 text-[#1A2035]/40">
                      {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[#1A2035]/50 font-medium">Confirm</label>
                  <input type="password" value={signupData.confirmPassword}
                    onChange={(e) => signupChange("confirmPassword", e.target.value)} required placeholder="••••••••"
                    className="w-full bg-transparent border-0 border-b border-[#D6CFBF] pb-2 text-[#1A2035] text-sm placeholder:text-[#1A2035]/30 focus:outline-none focus:border-[#7C8D8C] transition-colors" />
                </div>
              </div>

              <button type="submit"
                className="w-full py-3.5 bg-[#2F3B3D] text-white rounded-full text-sm font-semibold hover:bg-[#7C8D8C] transition-all duration-300 shadow-lg shadow-[#2F3B3D]/20 flex items-center justify-center gap-2 group mt-2">
                Continue
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <p className="text-center text-xs text-[#1A2035]/40 mt-6">
              Already have an account?{" "}
              <button onClick={() => switchMode("login")} className="text-[#7C8D8C] font-medium hover:underline">
                Log In
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
