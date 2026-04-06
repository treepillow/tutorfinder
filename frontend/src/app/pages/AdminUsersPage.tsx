import { useState, useEffect } from "react";
import { profileApi, enrichProfile } from "../utils/api";
import { CircleGuyAvatar } from "../components/CircleGuyAvatar";
import { Search } from "lucide-react";
import Lottie from "lottie-react";
import circleGuyLoadingData from "../assets/circleGuyLoading.json";

type RoleFilter = "All" | "Tutor" | "Student";

const ROLE_PILL: Record<string, string> = {
  Tutor:   "bg-[#2F3B3D] text-white",
  Student: "bg-[#EDE9DF] text-[#2F3B3D]",
};

export function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");
  const [search, setSearch] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await profileApi.getAllProfiles();
      setUsers(
        (res.profiles || [])
          .filter((p: any) => p.role !== "Admin")
          .map((p: any) => enrichProfile(p))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    if (roleFilter !== "All" && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    }
    return true;
  });

  const tutorCount   = users.filter((u) => u.role === "Tutor").length;
  const studentCount = users.filter((u) => u.role === "Student").length;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl tracking-tight text-[#2F3B3D] mb-1">Users</h1>
          <p className="text-[#2F3B3D]/50">
            {users.length} registered · {tutorCount} tutors · {studentCount} students
          </p>
        </div>

        {/* Search + filter */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2F3B3D]/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email…"
              className="w-full pl-10 pr-4 py-3 bg-[#EDE9DF] rounded-2xl text-sm text-[#2F3B3D] placeholder:text-[#2F3B3D]/30 outline-none"
            />
          </div>
          <div className="flex p-1.5 bg-[#EDE9DF] rounded-2xl gap-1">
            {(["All", "Tutor", "Student"] as RoleFilter[]).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  roleFilter === r ? "bg-[#2F3B3D] text-white" : "text-[#2F3B3D]/50 hover:text-[#2F3B3D]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="bg-[#EDE9DF] rounded-2xl p-12 text-center">
            <p className="text-[#2F3B3D]/40 text-sm">No users found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((u) => (
              <div
                key={u.user_id}
                className="bg-[#EDE9DF] hover:bg-[#E3DDD3] rounded-2xl px-5 py-4 flex items-center gap-4 transition-colors duration-150"
              >
                <CircleGuyAvatar id={u.user_id ?? u.name} size={44} />

                <div className="flex-1 min-w-0">
                  <p className="text-[#2F3B3D] font-medium leading-tight">{u.name}</p>
                  <p className="text-sm text-[#2F3B3D]/50 mt-0.5 truncate">{u.email}</p>
                </div>

                {u.subjects?.[0] && (
                  <p className="hidden sm:block text-sm text-[#2F3B3D]/40 truncate max-w-[160px]">
                    {u.subjects[0].subject}
                    {u.subjects[0].level ? ` · ${u.subjects[0].level}` : ""}
                  </p>
                )}

                <span className={`text-xs px-3 py-1 rounded-full font-medium shrink-0 ${ROLE_PILL[u.role] ?? "bg-[#EDE9DF] text-[#2F3B3D]"}`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm bg-white/30">
          <Lottie animationData={circleGuyLoadingData} loop autoplay style={{ width: 500, height: 500, transform: "translateY(-80px)" }} />
        </div>
      )}
    </div>
  );
}
