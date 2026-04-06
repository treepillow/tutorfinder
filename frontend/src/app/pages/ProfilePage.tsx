import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, GraduationCap, BookOpen, Calendar, Pencil, Plus, Trash2, X, Check } from "lucide-react";
import { CircleGuyAvatar } from "../components/CircleGuyAvatar";

import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { AvailabilitySelector } from "../components/AvailabilitySelector";
import { getCurrentUser, setCurrentUser, profileApi, availabilityApi, enrichProfile, encodeProfileExtra, syncAvailabilityToBackend } from "../utils/api";
import { toast } from "sonner";

function slotsToWeeklyAvailability(slots: any[]): Record<string, string[]> {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const result: Record<string, string[]> = {};
  for (const slot of slots) {
    const date = new Date(slot.date + "T00:00:00");
    const day = dayNames[date.getDay()];
    const start = slot.start_time.slice(0, 5);
    const end = slot.end_time.slice(0, 5);
    const timeSlot = `${start}-${end}`;
    if (!result[day]) result[day] = [];
    if (!result[day].includes(timeSlot)) result[day].push(timeSlot);
  }
  return result;
}

const SUBJECTS = ["Mathematics", "English", "Science", "Physics", "Chemistry", "Biology", "History", "Geography", "Chinese", "Malay", "Tamil"];
const EDUCATION_LEVELS = ["Primary 1-3", "Primary 4-6", "Secondary 1-2", "Secondary 3-4", "Junior College", "University"];
const QUALIFICATIONS = ["O-Levels", "A-Levels", "Diploma", "Bachelor's Degree", "Master's Degree", "PhD"];

export function ProfilePage() {
  const [currentUser, setCurrentUserState] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const user = getCurrentUser();
    if (!user) return;
    try {
      const isTutorUser = user.role?.toLowerCase() === "tutor" || user.userType === "tutor";
      const [profile, availabilityRes] = await Promise.all([
        profileApi.getProfile(user.id),
        isTutorUser
          ? availabilityApi.getSlots(user.id).catch(() => ({ availability: [] }))
          : Promise.resolve({ availability: [] }),
      ]);
      const enriched = enrichProfile(profile);
      const slots = availabilityRes.availability || [];
      enriched.availability = slots.length > 0
        ? slotsToWeeklyAvailability(slots)
        : (user.availability || {});
      setCurrentUserState(enriched);
    } catch {
      setCurrentUserState(user);
    }
  };

  const startEditing = () => {
    setFormData({ ...currentUser });
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setFormData({});
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubjectChange = (index: number, field: string, value: string) => {
    const updated = [...formData.subjects];
    updated[index] = { ...updated[index], [field]: value };
    handleChange("subjects", updated);
  };

  const addSubject = () => {
    const isTutor = currentUser.userType === "tutor";
    const blank = isTutor
      ? { id: Date.now().toString(), subject: "", level: "", hourlyRate: "" }
      : { id: Date.now().toString(), subject: "", level: "", budget: "" };
    handleChange("subjects", [...(formData.subjects || []), blank]);
  };

  const removeSubject = (index: number) => {
    if (formData.subjects.length > 1) {
      handleChange("subjects", formData.subjects.filter((_: any, i: number) => i !== index));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Snapshot original profile for rollback
      const originalBio = encodeProfileExtra({
        subjects: currentUser.subjects,
        qualification: currentUser.qualification,
        location: currentUser.location,
        gender: currentUser.gender,
        birthday: currentUser.birthday,
        contactNumber: currentUser.contactNumber,
      });
      const rollbackProfile = {
        name: currentUser.name,
        phone: currentUser.contactNumber || currentUser.phone,
        subject: (currentUser.subjects || []).map((s: any) => s.subject).filter(Boolean).join(", "),
        price_rate: parseFloat(currentUser.subjects?.[0]?.hourlyRate || currentUser.subjects?.[0]?.budget) || 0,
        bio: originalBio,
      };

      const bio = encodeProfileExtra({
        subjects: formData.subjects,
        qualification: formData.qualification,
        location: formData.location,
        gender: formData.gender,
        birthday: formData.birthday,
        contactNumber: formData.contactNumber,
      });

      await profileApi.updateProfile(currentUser.id, {
        name: formData.name,
        phone: formData.contactNumber || formData.phone,
        subject: (formData.subjects || []).map((s: any) => s.subject).filter(Boolean).join(", "),
        price_rate: parseFloat(formData.subjects?.[0]?.hourlyRate || formData.subjects?.[0]?.budget) || 0,
        bio,
      });

      if (currentUser.userType === "tutor" && formData.availability && Object.keys(formData.availability).length > 0) {
        try {
          await syncAvailabilityToBackend(currentUser.id, formData.availability);
        } catch (availErr: any) {
          // Roll back the profile update so both services stay in sync
          await profileApi.updateProfile(currentUser.id, rollbackProfile).catch(console.error);
          throw new Error("Availability sync failed — profile changes have been rolled back.");
        }
      }

      const profile = await profileApi.getProfile(currentUser.id);
      const enriched = enrichProfile(profile);
      enriched.availability = formData.availability || currentUser.availability;
      setCurrentUser(enriched);
      setCurrentUserState(enriched);

      setEditing(false);
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) return null;

  const isTutor = currentUser.userType === "tutor";

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-4xl tracking-tight text-[#2F3B3D] mb-2">Profile</h1>
            <p className="text-[#2F3B3D]/70">Your account information</p>
          </div>

          {!editing ? (
            <button
              onClick={startEditing}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#2F3B3D] text-white rounded-full hover:bg-[#7C8D8C] transition-all duration-200 text-sm font-medium"
            >
              <Pencil className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={cancelEditing}
                className="flex items-center justify-center gap-2.5 px-5 py-2.5 bg-white text-red-400 rounded-full border border-red-200 hover:bg-red-50 hover:text-red-500 transition-all duration-300 text-sm"
              >
                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0"><X className="w-3 h-3" /></span>
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#7C8D8C] text-white rounded-full hover:bg-[#2F3B3D] transition-all duration-200 text-sm font-medium disabled:opacity-50"
              >
                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0"><Check className="w-3 h-3" /></span>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>

        <div className="bg-[#EDE9DF] rounded-3xl p-8 space-y-8">

          {/* Avatar + name */}
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 bg-[#EDE9DF] rounded-full flex items-center justify-center overflow-hidden">
              <CircleGuyAvatar id={currentUser.user_id ?? currentUser.id} size={128} />
            </div>
            <div>
              {editing ? (
                <Input
                  value={formData.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="text-2xl bg-[#F5F3EF] border-[#D6CFBF] mb-2 w-64"
                />
              ) : (
                <h2 className="text-3xl text-[#2F3B3D] mb-2">{currentUser.name}</h2>
              )}
              <div className="inline-block px-4 py-1 bg-[#7C8D8C] text-white text-sm rounded-full">
                {isTutor ? "Tutor" : "Student"}
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h3 className="text-xl text-[#2F3B3D] mb-4">Basic Information</h3>
            <div className="grid md:grid-cols-2 gap-4">

              {/* Email — never editable */}
              <div className="bg-[#F5F3EF] p-4 rounded-xl">
                <div className="text-sm text-[#2F3B3D]/70 mb-1">Email</div>
                <div className="flex items-center gap-2 text-[#2F3B3D]">
                  <Mail className="w-4 h-4" />
                  <span>{currentUser.email}</span>
                </div>
              </div>

              {/* Phone */}
              <div className="bg-[#F5F3EF] p-4 rounded-xl">
                <div className="text-sm text-[#2F3B3D]/70 mb-1">Phone</div>
                {editing ? (
                  <Input
                    type="tel"
                    value={formData.contactNumber || formData.phone || ""}
                    onChange={(e) => handleChange("contactNumber", e.target.value)}
                    className="bg-white border-[#D6CFBF]"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-[#2F3B3D]">
                    <Phone className="w-4 h-4" />
                    <span>{currentUser.contactNumber || currentUser.phone}</span>
                  </div>
                )}
              </div>

              {/* Birthday — never editable */}
              <div className="bg-[#F5F3EF] p-4 rounded-xl">
                <div className="text-sm text-[#2F3B3D]/70 mb-1">Birthday</div>
                <div className="flex items-center gap-2 text-[#2F3B3D]">
                  <Calendar className="w-4 h-4" />
                  <span>{currentUser.birthday || "Not set"}</span>
                </div>
              </div>

              {/* Gender — never editable */}
              <div className="bg-[#F5F3EF] p-4 rounded-xl">
                <div className="text-sm text-[#2F3B3D]/70 mb-1">Gender</div>
                <div className="text-[#2F3B3D]">{currentUser.gender || "Not set"}</div>
              </div>

              {/* Location */}
              <div className="bg-[#F5F3EF] p-4 rounded-xl">
                <div className="text-sm text-[#2F3B3D]/70 mb-1">Location</div>
                {editing ? (
                  <Input
                    value={formData.location || ""}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className="bg-white border-[#D6CFBF]"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-[#2F3B3D]">
                    <MapPin className="w-4 h-4" />
                    <span>{currentUser.location}</span>
                  </div>
                )}
              </div>

              {/* Qualification (tutors only) */}
              {isTutor && (
                <div className="bg-[#F5F3EF] p-4 rounded-xl">
                  <div className="text-sm text-[#2F3B3D]/70 mb-1">Qualification</div>
                  {editing ? (
                    <Select
                      value={formData.qualification || ""}
                      onValueChange={(v) => handleChange("qualification", v)}
                    >
                      <SelectTrigger className="bg-white border-[#D6CFBF]">
                        <SelectValue placeholder="Select qualification" />
                      </SelectTrigger>
                      <SelectContent>
                        {QUALIFICATIONS.map((q) => (
                          <SelectItem key={q} value={q}>{q}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2 text-[#2F3B3D]">
                      <GraduationCap className="w-4 h-4" />
                      <span>{currentUser.qualification || "Not set"}</span>
                    </div>
                  )}
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
              {editing && (
                <button
                  onClick={addSubject}
                  className="flex items-center gap-2 px-4 py-2 bg-[#7C8D8C] text-white rounded-full hover:bg-[#2F3B3D] transition-all duration-200 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Subject
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-4">
                {(formData.subjects || []).map((subject: any, index: number) => (
                  <div key={index} className="bg-[#F5F3EF] p-5 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#2F3B3D]/50">Subject {index + 1}</span>
                      {formData.subjects.length > 1 && (
                        <button onClick={() => removeSubject(index)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[#2F3B3D]">Subject</Label>
                        <Select value={subject.subject} onValueChange={(v) => handleSubjectChange(index, "subject", v)}>
                          <SelectTrigger className="bg-white border-[#D6CFBF]">
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[#2F3B3D]">Level</Label>
                        <Select value={subject.level} onValueChange={(v) => handleSubjectChange(index, "level", v)}>
                          <SelectTrigger className="bg-white border-[#D6CFBF]">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            {EDUCATION_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[#2F3B3D]">{isTutor ? "Hourly Rate (SGD)" : "Budget (SGD/hr)"}</Label>
                        <Input
                          type="number"
                          value={subject.hourlyRate || subject.budget || ""}
                          onChange={(e) => handleSubjectChange(index, isTutor ? "hourlyRate" : "budget", e.target.value)}
                          className="bg-white border-[#D6CFBF]"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {(currentUser.subjects || []).map((subject: any, index: number) => (
                  <div key={index} className="bg-[#F5F3EF] p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-[#7C8D8C]" />
                        <div>
                          <div className="text-[#2F3B3D]">{subject.subject}</div>
                          <div className="text-sm text-[#2F3B3D]/70">{subject.level}</div>
                        </div>
                      </div>
                      <div className="text-xl text-[#7C8D8C]">
                        ${subject.hourlyRate || subject.budget}/hr
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Availability (tutors only) */}
          {isTutor && (
            <div>
              <h3 className="text-xl text-[#2F3B3D] mb-4">Availability</h3>
              {editing ? (
                <AvailabilitySelector
                  value={formData.availability || {}}
                  onChange={(value) => handleChange("availability", value)}
                />
              ) : (
                currentUser.availability && Object.keys(currentUser.availability).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(currentUser.availability).sort(([a], [b]) => {
                        const order = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
                        return order.indexOf(a) - order.indexOf(b);
                      }).map(([day, slots]: [string, any]) => (
                      <div key={day} className="bg-[#F5F3EF] p-4 rounded-xl">
                        <div className="text-[#2F3B3D] mb-2">{day}</div>
                        <div className="flex flex-wrap gap-2">
                          {slots.map((slot: string) => (
                            <span key={slot} className="px-3 py-1 bg-[#7C8D8C] text-white text-sm rounded-full">
                              {slot}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#F5F3EF] p-4 rounded-xl text-[#2F3B3D]/50 text-sm">
                    No availability set
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
