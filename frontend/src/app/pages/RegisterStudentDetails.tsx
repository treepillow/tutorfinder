import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { ArrowRight, Plus, Trash2 } from "lucide-react";

const SUBJECTS = [
  "Mathematics",
  "English",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Chinese",
  "Malay",
  "Tamil",
];

const EDUCATION_LEVELS = [
  "Primary 1-3",
  "Primary 4-6",
  "Secondary 1-2",
  "Secondary 3-4",
  "Junior College",
  "University",
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
    if (userType !== "student") {
      navigate("/");
    }
  }, [navigate]);

  const addSubject = () => {
    setSubjects([
      ...subjects,
      { id: Date.now().toString(), subject: "", level: "", budget: "" },
    ]);
  };

  const removeSubject = (id: string) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((s) => s.id !== id));
    }
  };

  const updateSubject = (id: string, field: keyof SubjectEntry, value: string) => {
    setSubjects(subjects.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const basicDetails = sessionStorage.getItem("basicDetails");
    if (!basicDetails) {
      navigate("/register");
      return;
    }

    // Store all registration data
    const userData = {
      ...JSON.parse(basicDetails),
      userType: "student",
      subjects,
      location,
    };

    // Store in localStorage (mock database)
    localStorage.setItem("currentUser", JSON.stringify(userData));
    sessionStorage.clear();
    
    navigate("/app/discover");
  };

  return (
    <div className="min-h-screen bg-[#FFF2D5] p-8">
      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl tracking-tight text-[#2F3B3D] mb-2">
            Student Details
          </h1>
          <p className="text-[#2F3B3D]/70">
            Tell us what you want to learn
          </p>
        </div>

        <div className="bg-[#E9D8BB] rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Subjects Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl text-[#2F3B3D]">Subjects & Budget</h3>
                <button
                  type="button"
                  onClick={addSubject}
                  className="flex items-center gap-2 px-4 py-2 bg-[#7C8D8C] text-white rounded-full hover:bg-[#2F3B3D] transition-all duration-300"
                >
                  <Plus className="w-4 h-4" />
                  Add Subject
                </button>
              </div>

              {subjects.map((subject, index) => (
                <div key={subject.id} className="bg-[#FFF2D5] p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#2F3B3D]/70">Subject {index + 1}</span>
                    {subjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubject(subject.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[#2F3B3D]">Subject</Label>
                      <Select
                        value={subject.subject}
                        onValueChange={(value) => updateSubject(subject.id, "subject", value)}
                        required
                      >
                        <SelectTrigger className="bg-white border-[#C9B08E]">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUBJECTS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#2F3B3D]">Level</Label>
                      <Select
                        value={subject.level}
                        onValueChange={(value) => updateSubject(subject.id, "level", value)}
                        required
                      >
                        <SelectTrigger className="bg-white border-[#C9B08E]">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {EDUCATION_LEVELS.map((l) => (
                            <SelectItem key={l} value={l}>
                              {l}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#2F3B3D]">Budget (SGD/hr)</Label>
                      <Input
                        type="number"
                        value={subject.budget}
                        onChange={(e) => updateSubject(subject.id, "budget", e.target.value)}
                        className="bg-white border-[#C9B08E]"
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-[#2F3B3D]">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-[#FFF2D5] border-[#C9B08E]"
                placeholder="e.g., Orchard, Singapore"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full px-8 py-4 bg-[#7C8D8C] text-white rounded-full hover:bg-[#2F3B3D] transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              Complete Registration
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
