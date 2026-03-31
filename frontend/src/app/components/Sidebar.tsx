import { NavLink, useNavigate } from "react-router";
import { useState, useRef, useEffect } from "react";
import { Home, Heart, Inbox, Calendar, User, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { clearAuth, getCurrentUser } from "../utils/api";

const navItems = [
  { path: "/app/discover", icon: Home, label: "Discover" },
  { path: "/app/matched", icon: Heart, label: "Matched" },
  { path: "/app/requests", icon: Inbox, label: "Requests" },
  { path: "/app/schedule", icon: Calendar, label: "Schedule" },
];

export function Sidebar() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const currentUser = getCurrentUser();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    clearAuth();
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <aside
      className={`bg-[#2F3B3D] text-white transition-all duration-300 relative flex flex-col h-full ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="p-6">
        <h1 className={`text-2xl tracking-tight transition-opacity duration-300 ${
          isCollapsed ? "opacity-0" : "opacity-100"
        }`}>
          {!isCollapsed && "TutorFinder"}
        </h1>
        {isCollapsed && <div className="text-2xl text-center">T</div>}
      </div>

      <nav className="px-3 space-y-2 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-[#7C8D8C] text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              } ${isCollapsed ? "justify-center" : ""}`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-[#7C8D8C] rounded-full flex items-center justify-center hover:bg-[#D6CFBF] transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* User profile section at bottom */}
      <div className="px-3 pb-6 relative" ref={userMenuRef}>
        {/* Dropdown menu (appears above) */}
        {showUserMenu && (
          <div className="absolute bottom-full mb-2 left-3 right-3 bg-white rounded-xl shadow-lg overflow-hidden z-50">
            <button
              onClick={() => { navigate("/app/profile"); setShowUserMenu(false); }}
              className="flex items-center gap-3 px-4 py-3 w-full text-[#2F3B3D] hover:bg-[#EDE9DF] transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="text-sm">View Profile</span>
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Log Out</span>
            </button>
          </div>
        )}

        <button
          onClick={() => setShowUserMenu((v) => !v)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-white/70 hover:bg-white/10 hover:text-white w-full ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <User className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="truncate text-sm">
              {currentUser?.name || "Account"}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
