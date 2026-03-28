import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ArrowRight, GraduationCap } from "lucide-react";

export function RegisterBasicDetails() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<"student" | "tutor" | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    contactNumber: "",
    birthday: "",
    gender: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const type = sessionStorage.getItem("userType") as "student" | "tutor" | null;
    if (!type) {
      navigate("/");
      return;
    }
    setUserType(type);
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    sessionStorage.setItem("basicDetails", JSON.stringify(formData));
    if (userType === "tutor") {
      navigate("/register/tutor");
    } else {
      navigate("/register/student");
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!userType) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF8] via-[#F5F3EF] to-[#EDE9DF] relative overflow-hidden">
      {/* Bg blobs */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#7C8D8C] rounded-full blur-[140px] opacity-[0.05] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-[#F59E0B] rounded-full blur-[120px] opacity-[0.05] pointer-events-none" />

      {/* Logo header */}
      <nav className="relative z-10 px-8 py-6">
        <a href="/" className="inline-flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#7C8D8C] rounded-xl flex items-center justify-center shadow-md">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-semibold tracking-tight text-[#1A2035]">
            Tutor<span className="text-[#7C8D8C]">Finder</span>
          </span>
        </a>
      </nav>

      <div className="relative z-10 flex items-center justify-center px-8 pb-16 pt-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-1.5 bg-[#EDE9DF] border border-[#D6CFBF] text-[#1A2035]/80 text-sm rounded-full font-medium mb-4">
              Step 1 of 2
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-[#1A2035] mb-2">
              Welcome to TutorFinder
            </h1>
            <p className="text-[#1A2035]/60">
              {userType === "tutor" ? "Let's set up your tutor profile" : "Let's set up your student profile"}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-[#1A2035]/5 border border-[#E8E4DC]">
            <h2 className="text-xl font-bold text-[#1A2035] mb-6">Basic Details</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[#1A2035] font-medium">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="bg-[#F5F3EF] border-[#C8BFAE] focus:border-[#7C8D8C] text-[#1A2035]"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="contactNumber" className="text-[#1A2035] font-medium">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => handleChange("contactNumber", e.target.value)}
                    className="bg-[#F5F3EF] border-[#C8BFAE] focus:border-[#7C8D8C] text-[#1A2035]"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="birthday" className="text-[#1A2035] font-medium">Birthday</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => handleChange("birthday", e.target.value)}
                    className="bg-[#F5F3EF] border-[#C8BFAE] focus:border-[#7C8D8C] text-[#1A2035]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[#1A2035] font-medium">Gender</Label>
                <div className="flex gap-6">
                  {["Male", "Female", "Other"].map((gender) => (
                    <label key={gender} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value={gender}
                        checked={formData.gender === gender}
                        onChange={(e) => handleChange("gender", e.target.value)}
                        className="accent-[#7C8D8C]"
                        required
                      />
                      <span className="text-[#1A2035]/80 text-sm">{gender}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[#1A2035] font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="bg-[#F5F3EF] border-[#C8BFAE] focus:border-[#7C8D8C] text-[#1A2035]"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-[#1A2035] font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="bg-[#F5F3EF] border-[#C8BFAE] focus:border-[#7C8D8C] text-[#1A2035]"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-[#1A2035] font-medium">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    className="bg-[#F5F3EF] border-[#C8BFAE] focus:border-[#7C8D8C] text-[#1A2035]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-8 py-4 bg-[#7C8D8C] text-white rounded-full hover:bg-[#2F3B3D] transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-[#7C8D8C]/25 font-medium mt-2"
              >
                Continue
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
