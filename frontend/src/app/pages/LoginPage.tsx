import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import gsap from "gsap";
import Lottie from "lottie-react";
import circleGuyData from "../assets/circleGuy.json";
import circleGuyIdleData from "../assets/circleGuyIdle.json";
import { profileApi, setToken, setCurrentUser, enrichProfile } from "../utils/api";
import { toast } from "sonner";

type Mode = "login" | "signup";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialMode: Mode = location.pathname === "/register" ? "signup" : "login";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [loading, setLoading] = useState(false);

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});
  const [loginTouched, setLoginTouched] = useState<{ email?: boolean; password?: boolean }>({});

  // Signup state
  const [userType, setUserType] = useState<"student" | "tutor">("student");
  const [signupData, setSignupData] = useState({
    name: "", contactNumber: "", birthday: "", gender: "",
    email: "", password: "", confirmPassword: "",
  });
  const [signupErrors, setSignupErrors] = useState<Partial<typeof signupData & { gender: string }>>({});
  const [signupSubmitted, setSignupSubmitted] = useState(false);
  const [signupTouched, setSignupTouched] = useState<Partial<Record<keyof typeof signupData, boolean>>>({});
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const validateLogin = (e: string, p: string) => {
    const errs: { email?: string; password?: string } = {};
    if (!e) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) errs.email = "Invalid email address";
    if (!p) errs.password = "Password is required";
    return errs;
  };

  const handleLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const errs = validateLogin(email, password);
    setLoginErrors(errs);
    setLoginTouched({ email: true, password: true });
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    try {
      const res = await profileApi.login(email, password);
      setToken(res.token);

      // Fetch full profile
      const profile = await profileApi.getProfile(res.user_id);
      const enriched = enrichProfile(profile);
      setCurrentUser(enriched);

      toast.success("Welcome back!");
      navigate("/app/discover");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const validateSignup = (data: typeof signupData) => {
    const errs: Partial<typeof signupData> = {};
    if (!data.name.trim()) errs.name = "Full name is required";

    const phone = data.contactNumber.replace(/\s+/g, "");
    if (!phone) errs.contactNumber = "Contact number is required";
    else if (!/^\d{8}$/.test(phone)) errs.contactNumber = "Contact number must be 8 digits";

    if (!data.birthday) {
      errs.birthday = "Birthday is required";
    } else {
      const today = new Date();
      const dob = new Date(data.birthday);
      const age = today.getFullYear() - dob.getFullYear() -
        (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);
      if (dob >= today) errs.birthday = "Birthday must be in the past";
      else if (age < 13) errs.birthday = "Must be at least 13 years old";
    }

    if (!data.gender) errs.gender = "Please select a gender";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email) errs.email = "Email is required";
    else if (!emailRegex.test(data.email)) errs.email = "Invalid email address";

    if (!data.password) errs.password = "Password is required";
    else if (data.password.length < 8) errs.password = "At least 8 characters";
    else if (!/[A-Z]/.test(data.password)) errs.password = "Needs an uppercase letter";
    else if (!/[0-9]/.test(data.password)) errs.password = "Needs a number";

    if (!data.confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (data.password !== data.confirmPassword) errs.confirmPassword = "Passwords do not match";

    return errs;
  };

  const handleSignup = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setSignupSubmitted(true);
    const errs = validateSignup(signupData);
    setSignupErrors(errs);
    if (Object.keys(errs).length > 0) return;

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
  const characterRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<any>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const idleTween = useRef<gsap.core.Timeline | null>(null);
  const animating = useRef(false);
  const [isWalking, setIsWalking] = useState(false);

  useEffect(() => {
    if (initialMode === "signup") {
      gsap.set(illustrationRef.current, { xPercent: 100 });
      gsap.set(formRef.current, { xPercent: -100 });
      gsap.set(characterRef.current, { x: window.innerWidth * 0.5 });
    }
  }, []);

  // Idle bounce — body squashes down, shadow expands
  useEffect(() => {
    if (!isWalking && bodyRef.current) {
      idleTween.current?.kill();
      idleTween.current = gsap.timeline({ repeat: -1, yoyo: true })
        .to(bodyRef.current, { y: 9, duration: 0.5, ease: "sine.inOut" }, 0);
    } else {
      idleTween.current?.kill();
      if (bodyRef.current) gsap.set(bodyRef.current, { y: 0 });
    }
    return () => { idleTween.current?.kill(); };
  }, [isWalking]);

  const switchMode = (newMode: Mode) => {
    if (newMode === mode || animating.current) return;
    animating.current = true;
    const toLogin = newMode === "login";

    setIsWalking(true);
    if (lottieRef.current) {
      lottieRef.current.goToAndStop(0, true);
      lottieRef.current.play();
    }

    if (!toLogin) {
      // login → signup: face right, walk to center of right panel
      gsap.fromTo(
        characterRef.current,
        { x: 0 },
        {
          x: window.innerWidth * 0.5,
          duration: 0.75,
          ease: "none",
          onComplete: () => {
            if (lottieRef.current) lottieRef.current.stop();
            setIsWalking(false);
          },
        }
      );
    } else {
      // signup → login: face left (scaleX -1), walk to center of left panel
      gsap.fromTo(
        characterRef.current,
        { x: window.innerWidth * 0.5, scaleX: -1 },
        {
          x: 0,
          duration: 0.75,
          ease: "none",
          onComplete: () => {
            if (lottieRef.current) lottieRef.current.stop();
            gsap.set(characterRef.current, { scaleX: 1 });
            setIsWalking(false);
          },
        }
      );
    }

    const tl = gsap.timeline({
      defaults: { ease: "expo.inOut", duration: 0.7 },
      onComplete: () => { animating.current = false; },
    });

    tl.to(formRef.current, { opacity: 0, duration: 0.18, ease: "power2.in" })
      .to(illustrationRef.current, { xPercent: toLogin ? 0 : 100 }, "<")
      .to(formRef.current,         { xPercent: toLogin ? 0 : -100 }, "<")
      .call(() => {
        setMode(newMode);
        navigate(toLogin ? "/login" : "/register", { replace: true });
      }, [], 0.3)
      .to(formRef.current, { opacity: 1, duration: 0.3, ease: "power2.out" }, 0.3);
  };

  const signupChange = (field: string, value: string) => {
    const updated = { ...signupData, [field]: value };
    setSignupData(updated);
    setSignupErrors(validateSignup(updated));
    // Mark gender touched immediately on change (no blur for radio)
    if (field === "gender") setSignupTouched(prev => ({ ...prev, gender: true }));
  };

  const signupBlur = (field: keyof typeof signupData) => {
    setSignupTouched(prev => ({ ...prev, [field]: true }));
    setSignupErrors(validateSignup(signupData));
  };

  const showError = (field: keyof typeof signupData) =>
    (signupTouched[field] || signupSubmitted) && signupErrors[field];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Back link */}
      <a href="/" className="absolute top-6 left-6 z-30 flex items-center gap-1.5 text-sm text-[#1A2035]/50 hover:text-[#1A2035] transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back
      </a>

      {/* Illustration panel */}
      <div
        ref={illustrationRef}
        className="absolute top-0 left-0 h-full w-1/2 bg-[#EDE9DF] hidden lg:flex flex-col items-center justify-center p-16"
      >
        <div className="mt-64 text-center">
          <h2 className="text-2xl font-bold text-[#1A2035] mb-2">Find your perfect tutor</h2>
          <p className="text-[#1A2035]/50 text-sm">Connect with top tutors across Singapore</p>
        </div>
      </div>

      {/* Character — outside both panels so it walks independently */}
      <div
        ref={characterRef}
        className="absolute hidden lg:block z-20 pointer-events-none"
        style={{ top: "calc(50% - 110px)", left: "calc(25% - 110px)", width: 220, height: 220 }}
      >
        {/* Walking lottie — always mounted so lottieRef stays valid */}
        <div style={{ position: "absolute", inset: 0, display: isWalking ? "block" : "none" }}>
          <Lottie
            lottieRef={lottieRef}
            animationData={circleGuyData}
            autoplay={false}
            loop={true}
            style={{ width: 220, height: 220 }}
          />
        </div>

        {/* Standing idle — full character, bobs up and down */}
        <div ref={bodyRef} style={{ position: "absolute", inset: 0, display: isWalking ? "none" : "block" }}>
          <Lottie animationData={circleGuyIdleData} autoplay={false} loop={false} style={{ width: 220, height: 220 }} />
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

            <h1 className="text-3xl font-bold text-[#1A2035] text-center mb-1">Welcome back!</h1>
            <p className="text-[#1A2035]/50 text-sm text-center mb-8">Please enter your details</p>

            <form onSubmit={handleLogin} noValidate className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs text-[#1A2035]/50 font-medium">Email</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (loginTouched.email) setLoginErrors(prev => ({ ...prev, ...validateLogin(e.target.value, password) }));
                  }}
                  onBlur={() => {
                    setLoginTouched(prev => ({ ...prev, email: true }));
                    setLoginErrors(validateLogin(email, password));
                  }}
                  onInvalid={(e) => e.preventDefault()}
                  placeholder="you@example.com"
                  className={`w-full bg-transparent border-0 border-b pb-2 text-[#1A2035] text-sm placeholder:text-[#1A2035]/30 focus:outline-none transition-colors ${loginTouched.email && loginErrors.email ? "border-red-400 focus:border-red-400" : "border-[#D6CFBF] focus:border-[#7C8D8C]"}`}
                />
                {loginTouched.email && loginErrors.email && <p className="text-red-500 text-xs mt-1">{loginErrors.email}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#1A2035]/50 font-medium">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (loginTouched.password) setLoginErrors(prev => ({ ...prev, ...validateLogin(email, e.target.value) }));
                    }}
                    onBlur={() => {
                      setLoginTouched(prev => ({ ...prev, password: true }));
                      setLoginErrors(validateLogin(email, password));
                    }}
                    onInvalid={(e) => e.preventDefault()}
                    placeholder="••••••••"
                    className={`w-full bg-transparent border-0 border-b pb-2 pr-8 text-[#1A2035] text-sm placeholder:text-[#1A2035]/30 focus:outline-none transition-colors ${loginTouched.password && loginErrors.password ? "border-red-400 focus:border-red-400" : "border-[#D6CFBF] focus:border-[#7C8D8C]"}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 bottom-2 text-[#1A2035]/40 hover:text-[#1A2035]/70 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {loginTouched.password && loginErrors.password && <p className="text-red-500 text-xs mt-1">{loginErrors.password}</p>}
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

              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-[#2F3B3D] text-white rounded-full text-sm font-semibold hover:bg-[#7C8D8C] transition-all duration-300 shadow-lg shadow-[#2F3B3D]/20 disabled:opacity-50">
                {loading ? "Logging in..." : "Log In"}
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
                  {type === "student" ? "Student" : "Tutor"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSignup} noValidate className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-[#1A2035]/50 font-medium">Full Name</label>
                <input type="text" value={signupData.name}
                  onChange={(e) => signupChange("name", e.target.value)}
                  onBlur={() => signupBlur("name")}
                  onInvalid={(e) => e.preventDefault()} placeholder="John Doe"
                  className={`w-full bg-transparent border-0 border-b pb-2 text-[#1A2035] text-sm placeholder:text-[#1A2035]/30 focus:outline-none transition-colors ${showError("name") ? "border-red-400 focus:border-red-400" : "border-[#D6CFBF] focus:border-[#7C8D8C]"}`} />
                {showError("name") && <p className="text-red-500 text-xs mt-1">{signupErrors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-[#1A2035]/50 font-medium">Contact No.</label>
                  <input type="tel" value={signupData.contactNumber}
                    onChange={(e) => signupChange("contactNumber", e.target.value)}
                    onBlur={() => signupBlur("contactNumber")}
                    onInvalid={(e) => e.preventDefault()} placeholder="91234567"
                    className={`w-full bg-transparent border-0 border-b pb-2 text-[#1A2035] text-sm placeholder:text-[#1A2035]/30 focus:outline-none transition-colors ${showError("contactNumber") ? "border-red-400 focus:border-red-400" : "border-[#D6CFBF] focus:border-[#7C8D8C]"}`} />
                  {showError("contactNumber") && <p className="text-red-500 text-xs mt-1">{signupErrors.contactNumber}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[#1A2035]/50 font-medium">Birthday</label>
                  <input type="date" value={signupData.birthday}
                    onChange={(e) => signupChange("birthday", e.target.value)}
                    onBlur={() => signupBlur("birthday")}
                    onInvalid={(e) => e.preventDefault()}
                    max="9999-12-31"
                    className={`w-full bg-transparent border-0 border-b pb-2 text-[#1A2035] text-sm focus:outline-none transition-colors ${showError("birthday") ? "border-red-400 focus:border-red-400" : "border-[#D6CFBF] focus:border-[#7C8D8C]"}`} />
                  {showError("birthday") && <p className="text-red-500 text-xs mt-1">{signupErrors.birthday}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#1A2035]/50 font-medium">Gender</label>
                <div className="flex gap-4 pt-1">
                  {["Male", "Female", "Other"].map((g) => (
                    <label key={g} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="gender" value={g} checked={signupData.gender === g}
                        onChange={(e) => signupChange("gender", e.target.value)}
                        className="accent-[#7C8D8C]" />
                      <span className="text-xs text-[#1A2035]/70">{g}</span>
                    </label>
                  ))}
                </div>
                {showError("gender") && <p className="text-red-500 text-xs mt-1">{signupErrors.gender}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#1A2035]/50 font-medium">Email</label>
                <input type="text" value={signupData.email}
                  onChange={(e) => signupChange("email", e.target.value)}
                  onBlur={() => signupBlur("email")}
                  onInvalid={(e) => e.preventDefault()} placeholder="you@example.com"
                  className={`w-full bg-transparent border-0 border-b pb-2 text-[#1A2035] text-sm placeholder:text-[#1A2035]/30 focus:outline-none transition-colors ${showError("email") ? "border-red-400 focus:border-red-400" : "border-[#D6CFBF] focus:border-[#7C8D8C]"}`} />
                {showError("email") && <p className="text-red-500 text-xs mt-1">{signupErrors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-[#1A2035]/50 font-medium">Password</label>
                  <div className="relative">
                    <input type={showSignupPassword ? "text" : "password"} value={signupData.password}
                      onChange={(e) => signupChange("password", e.target.value)}
                      onBlur={() => signupBlur("password")}
                      onInvalid={(e) => e.preventDefault()} placeholder="••••••••"
                      className={`w-full bg-transparent border-0 border-b pb-2 pr-6 text-[#1A2035] text-sm placeholder:text-[#1A2035]/30 focus:outline-none transition-colors ${showError("password") ? "border-red-400 focus:border-red-400" : "border-[#D6CFBF] focus:border-[#7C8D8C]"}`} />
                    <button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-0 bottom-2 text-[#1A2035]/40">
                      {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {showError("password") && <p className="text-red-500 text-xs mt-1">{signupErrors.password}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[#1A2035]/50 font-medium">Confirm</label>
                  <div className="relative">
                    <input type={showConfirmPassword ? "text" : "password"} value={signupData.confirmPassword}
                      onChange={(e) => signupChange("confirmPassword", e.target.value)}
                      onBlur={() => signupBlur("confirmPassword")}
                      onInvalid={(e) => e.preventDefault()} placeholder="••••••••"
                      className={`w-full bg-transparent border-0 border-b pb-2 pr-6 text-[#1A2035] text-sm placeholder:text-[#1A2035]/30 focus:outline-none transition-colors ${showError("confirmPassword") ? "border-red-400 focus:border-red-400" : "border-[#D6CFBF] focus:border-[#7C8D8C]"}`} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-0 bottom-2 text-[#1A2035]/40">
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {showError("confirmPassword") && <p className="text-red-500 text-xs mt-1">{signupErrors.confirmPassword}</p>}
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
