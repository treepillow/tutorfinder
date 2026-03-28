import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { ArrowRight, Plus, Trash2, GraduationCap } from "lucide-react";

const SUBJECTS = [
  "Mathematics", "English", "Science", "Physics", "Chemistry",
  "Biology", "History", "Geography", "Chinese", "Malay", "Tamil",
];

const EDUCATION_LEVELS = [
  "Primary 1-3", "Primary 4-6", "Secondary 1-2",
  "Secondary 3-4", "Junior College", "University",
];

interface SubjectEntry {
  id: string;
  subject: string;
  level: string;
  budget: string;
}

export function RegisterStudentDetails() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<SubjectEntry[]>([
    { id: "1", subject: "", level: "", budget: "" },
  ]);
  const [location, setLocation] = useState("");
  useEffect(() => {
    const userType = sessionStorage.getItem("userType");
    if (userType !== "student") navigate("/");
  }, [navigate]);

  const addSubject = () => {
    setSubjects([...subjects, { id: Date.now().toString(), subject: "", level: "", budget: "" }]);
  };

  const removeSubject = (id: string) => {
    if (subjects.length > 1) setSubjects(subjects.filter((s) => s.id !== id));
  };

  const updateSubject = (id: string, field: keyof SubjectEntry, value: string) => {
    setSubjects(subjects.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const basicDetails = sessionStorage.getItem("basicDetails");
    if (!basicDetails) { navigate("/register"); return; }
    const userData = {
      ...JSON.parse(basicDetails),
      userType: "student",
      subjects, location,
    };
    localStorage.setItem("currentUser", JSON.stringify(userData));
    sessionStorage.clear();
    navigate("/app/discover");
  };

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

      <div className="relative z-10 px-8 pb-16 pt-4">
        <div className="w-full max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-1.5 bg-[#EDE9DF] border border-[#D6CFBF] text-[#1A2035]/80 text-sm rounded-full font-medium mb-4">
              Step 2 of 2
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-[#1A2035] mb-2">Student Details</h1>
            <p className="text-[#1A2035]/60">Tell us what you want to learn</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-[#1A2035]/5 border border-[#E8E4DC]">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Subjects */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#1A2035]">Subjects & Budget</h3>
                  <button
                    type="button"
                    onClick={addSubject}
                    className="flex items-center gap-2 px-4 py-2 bg-[#7C8D8C] text-white text-sm rounded-full hover:bg-[#2F3B3D] transition-all duration-300 font-medium shadow-md shadow-[#7C8D8C]/20"
                  >
                    <Plus className="w-4 h-4" />
                    Add Subject
                  </button>
                </div>

                {subjects.map((subject, index) => (
                  <div key={subject.id} className="bg-[#F5F3EF] p-5 rounded-2xl space-y-4 border border-[#E8E4DC]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#1A2035]/50 font-medium">Subject {index + 1}</span>
                      {subjects.length > 1 && (
                        <button type="button" onClick={() => removeSubject(subject.id)} className="text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[#1A2035] font-medium">Subject</Label>
                        <Select value={subject.subject} onValueChange={(v) => updateSubject(subject.id, "subject", v)} required>
                          <SelectTrigger className="bg-white border-[#C8BFAE] text-[#1A2035]">
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[#1A2035] font-medium">Level</Label>
                        <Select value={subject.level} onValueChange={(v) => updateSubject(subject.id, "level", v)} required>
                          <SelectTrigger className="bg-white border-[#C8BFAE] text-[#1A2035]">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            {EDUCATION_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[#1A2035] font-medium">Budget (SGD/hr)</Label>
                        <Input
                          type="number"
                          value={subject.budget}
                          onChange={(e) => updateSubject(subject.id, "budget", e.target.value)}
                          className="bg-white border-[#C8BFAE] text-[#1A2035]"
                          placeholder="0" min="0" required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-[#1A2035] font-medium">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-[#F5F3EF] border-[#C8BFAE] focus:border-[#7C8D8C] text-[#1A2035]"
                  placeholder="e.g., Orchard, Singapore"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full px-8 py-4 bg-[#7C8D8C] text-white rounded-full hover:bg-[#2F3B3D] transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-[#7C8D8C]/25 font-medium"
              >
                Complete Registration
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
