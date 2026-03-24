import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ArrowRight } from "lucide-react";

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

    // Store basic details
    sessionStorage.setItem("basicDetails", JSON.stringify(formData));
    
    // Navigate to appropriate next step
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
    <div className="min-h-screen bg-[#FFF2D5] flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl tracking-tight text-[#2F3B3D] mb-2">
            Welcome to TutorMatch
          </h1>
          <p className="text-[#2F3B3D]/70">
            {userType === "tutor" ? "Let's set up your tutor profile" : "Let's set up your student profile"}
          </p>
        </div>

        <div className="bg-[#E9D8BB] rounded-3xl p-8">
          <h2 className="text-2xl text-[#2F3B3D] mb-6">Basic Details</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#2F3B3D]">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="bg-[#FFF2D5] border-[#C9B08E]"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contactNumber" className="text-[#2F3B3D]">Contact Number</Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => handleChange("contactNumber", e.target.value)}
                  className="bg-[#FFF2D5] border-[#C9B08E]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthday" className="text-[#2F3B3D]">Birthday</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => handleChange("birthday", e.target.value)}
                  className="bg-[#FFF2D5] border-[#C9B08E]"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#2F3B3D]">Gender</Label>
              <div className="flex gap-4">
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
                    <span className="text-[#2F3B3D]">{gender}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#2F3B3D]">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="bg-[#FFF2D5] border-[#C9B08E]"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#2F3B3D]">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="bg-[#FFF2D5] border-[#C9B08E]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[#2F3B3D]">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className="bg-[#FFF2D5] border-[#C9B08E]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-8 py-4 bg-[#7C8D8C] text-white rounded-full hover:bg-[#2F3B3D] transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              Continue
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
