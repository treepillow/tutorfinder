import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Plus, Trash2, X } from "lucide-react";
import { AvailabilitySelector } from "../components/AvailabilitySelector";
import { toast } from "sonner";
import { getCurrentUser, setCurrentUser, profileApi, encodeProfileExtra, enrichProfile, syncAvailabilityToBackend } from "../utils/api";

const SUBJECTS = ["Mathematics", "English", "Science", "Physics", "Chemistry", "Biology", "History", "Geography", "Chinese", "Malay", "Tamil"];
const EDUCATION_LEVELS = ["Primary 1-3", "Primary 4-6", "Secondary 1-2", "Secondary 3-4", "Junior College", "University"];
const QUALIFICATIONS = ["O-Levels", "A-Levels", "Diploma", "Bachelor's Degree", "Master's Degree", "PhD"];

export function SettingsPage() {
  const navigate = useNavigate();
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const userData = getCurrentUser();
    if (userData) {
      setCurrentUserData(userData);
      setFormData(userData);
    }
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubjectChange = (index: number, field: string, value: string) => {
    const newSubjects = [...formData.subjects];
    newSubjects[index] = { ...newSubjects[index], [field]: value };
    handleChange("subjects", newSubjects);
  };

  const addSubject = () => {
    const isTutor = currentUserData.userType === "tutor";
    const newSubject = isTutor
      ? { id: Date.now().toString(), subject: "", level: "", hourlyRate: "" }
      : { id: Date.now().toString(), subject: "", level: "", budget: "" };
    handleChange("subjects", [...(formData.subjects || []), newSubject]);
  };

  const removeSubject = (index: number) => {
    if (formData.subjects.length > 1) {
      const newSubjects = formData.subjects.filter((_: any, i: number) => i !== index);
      handleChange("subjects", newSubjects);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const bio = encodeProfileExtra({
        subjects: formData.subjects,
        qualification: formData.qualification,
        location: formData.location,
        gender: formData.gender,
        birthday: formData.birthday,
        contactNumber: formData.contactNumber,
      });

      await profileApi.updateProfile(currentUserData.id, {
        name: formData.name,
        phone: formData.contactNumber || formData.phone,
        subject: (formData.subjects || []).map((s: any) => s.subject).filter(Boolean).join(", "),
        price_rate: parseFloat(formData.subjects?.[0]?.hourlyRate || formData.subjects?.[0]?.budget) || 0,
        bio,
      });

      // Sync availability to backend if tutor updated it
      if (isTutor && formData.availability && Object.keys(formData.availability).length > 0) {
        syncAvailabilityToBackend(currentUserData.id, formData.availability).catch(console.error);
      }

      // Refresh from backend
      const profile = await profileApi.getProfile(currentUserData.id);
      const enriched = enrichProfile(profile);
      enriched.availability = formData.availability || currentUserData.availability;
      setCurrentUser(enriched);

      toast.success("Settings saved successfully!");
      navigate("/app/profile");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (!currentUserData) {
    return null;
  }

  const isTutor = currentUserData.userType === "tutor";

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl tracking-tight text-[#2F3B3D] mb-2">
            Settings
          </h1>
          <p className="text-[#2F3B3D]/70">
            Update your account information
          </p>
        </div>

        <div className="bg-[#EDE9DF] rounded-3xl p-8 space-y-8">
          {/* Basic Details */}
          <div>
            <h3 className="text-xl text-[#2F3B3D] mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#2F3B3D]">Name</Label>
                  <Input
                    value={formData.name || ""}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="bg-[#F5F3EF] border-[#D6CFBF]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#2F3B3D]">Contact Number</Label>
                  <Input
                    value={formData.contactNumber || formData.phone || ""}
                    onChange={(e) => handleChange("contactNumber", e.target.value)}
                    className="bg-[#F5F3EF] border-[#D6CFBF]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[#2F3B3D]">Email</Label>
                <Input
                  type="email"
                  value={formData.email || ""}
                  disabled
                  className="bg-[#F5F3EF] border-[#D6CFBF] opacity-60"
                />
                <p className="text-xs text-[#2F3B3D]/50">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label className="text-[#2F3B3D]">Location</Label>
                <Input
                  value={formData.location || ""}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className="bg-[#F5F3EF] border-[#D6CFBF]"
                />
              </div>

              {isTutor && (
                <div className="space-y-2">
                  <Label className="text-[#2F3B3D]">Highest Qualification</Label>
                  <Select
                    value={formData.qualification || ""}
                    onValueChange={(value) => handleChange("qualification", value)}
                  >
                    <SelectTrigger className="bg-[#F5F3EF] border-[#D6CFBF]">
                      <SelectValue placeholder="Select qualification" />
                    </SelectTrigger>
                    <SelectContent>
                      {QUALIFICATIONS.map((q) => (
                        <SelectItem key={q} value={q}>
                          {q}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Subjects */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl text-[#2F3B3D]">
                {isTutor ? "Teaching Subjects" : "Learning Subjects"}
              </h3>
              <button
                onClick={addSubject}
                className="flex items-center gap-2 px-4 py-2 bg-[#7C8D8C] text-white rounded-full hover:bg-[#2F3B3D] transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                Add Subject
              </button>
            </div>

            <div className="space-y-4">
              {formData.subjects?.map((subject: any, index: number) => (
                <div key={index} className="bg-[#F5F3EF] p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#2F3B3D]/70">Subject {index + 1}</span>
                    {formData.subjects.length > 1 && (
                      <button
                        onClick={() => removeSubject(index)}
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
                        onValueChange={(value) => handleSubjectChange(index, "subject", value)}
                      >
                        <SelectTrigger className="bg-white border-[#D6CFBF]">
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
                        onValueChange={(value) => handleSubjectChange(index, "level", value)}
                      >
                        <SelectTrigger className="bg-white border-[#D6CFBF]">
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
                      <Label className="text-[#2F3B3D]">
                        {isTutor ? "Hourly Rate (SGD)" : "Budget (SGD/hr)"}
                      </Label>
                      <Input
                        type="number"
                        value={subject.hourlyRate || subject.budget || ""}
                        onChange={(e) =>
                          handleSubjectChange(
                            index,
                            isTutor ? "hourlyRate" : "budget",
                            e.target.value
                          )
                        }
                        className="bg-white border-[#D6CFBF]"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Availability (for tutors) */}
          {isTutor && (
            <div>
              <h3 className="text-xl text-[#2F3B3D] mb-4">Availability</h3>
              <AvailabilitySelector
                value={formData.availability || {}}
                onChange={(value) => handleChange("availability", value)}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/app/profile")}
              className="flex-1 flex items-center justify-center gap-2.5 px-5 py-2.5 bg-white text-red-400 rounded-full border border-red-200 hover:bg-red-50 hover:text-red-500 transition-all duration-300 text-sm"
            >
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0"><X className="w-3 h-3" /></span>
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-[#7C8D8C] text-white rounded-full hover:bg-[#2F3B3D] transition-all duration-300 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
