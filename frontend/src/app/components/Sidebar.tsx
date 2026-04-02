import { NavLink, useNavigate } from "react-router";
import { useState, useRef, useEffect } from "react";
import { Home, Heart, Inbox, Calendar, User, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { clearAuth, getCurrentUser } from "../utils/api";
import { useNavCounts } from "../hooks/useNavCounts";

function Badge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-[#EDE9DF] text-[#2F3B3D] text-[10px] font-bold flex items-center justify-center leading-none flex-shrink-0">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function CollapsedBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-[#EDE9DF] text-[#2F3B3D] text-[9px] font-bold flex items-center justify-center leading-none">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function Sidebar() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const currentUser = getCurrentUser();
  const counts = useNavCounts();

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

  // Sub-badges shown under Requests and matched items
  const requestsTotal = counts.awaitingResponse + counts.awaitingPayment;

  const navItems = [
    {
      path: "/app/discover",
      icon: Home,
      label: "Discover",
      badge: 0,
      subBadges: null,
    },
    {
      path: "/app/matched",
      icon: Heart,
      label: "Matched",
      badge: counts.matched,
      subBadges: null,
    },
    {
      path: "/app/requests",
      icon: Inbox,
      label: "Requests",
      badge: requestsTotal,
      subBadges: null,
    },
    {
      path: "/app/schedule",
      icon: Calendar,
      label: "Schedule",
      badge: counts.scheduled,
      subBadges: null,
    },
  ];

  return (
    <aside
      className={`bg-[#2F3B3D] text-white transition-all duration-300 relative flex flex-col h-full ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="p-6">
        <div className={`flex items-center gap-3 transition-opacity duration-300 ${
          isCollapsed ? "justify-center" : ""
        }`}>
          <img src="/favicon.svg" alt="TutorFinder" className="w-8 h-8 flex-shrink-0" />
          <h1 className={`text-2xl tracking-tight transition-opacity duration-300 ${
            isCollapsed ? "hidden" : "opacity-100"
          }`}>
            TutorFinder
          </h1>
        </div>
      </div>

      <nav className="px-3 space-y-1 flex-1">
        {navItems.map((item) => (
          <div key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-[#7C8D8C] text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                } ${isCollapsed ? "justify-center" : ""}`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative flex-shrink-0">
                    <item.icon className="w-5 h-5" />
                    {isCollapsed && <CollapsedBadge count={item.badge} />}
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className={isActive ? "text-white" : ""}>{item.label}</span>
                      <Badge count={item.badge} />
                    </>
                  )}
                </>
              )}
            </NavLink>

            {/* Sub-badges row (only when expanded and has sub-badges) */}
            {!isCollapsed && item.subBadges && (
              <div className="flex gap-2 px-4 pb-1 flex-wrap">
                {item.subBadges.map((sub) => (
                  sub.count > 0 && (
                    <span
                      key={sub.label}
                      className="flex items-center gap-1 text-[10px] text-white/50 bg-white/10 rounded-full px-2 py-0.5"
                    >
                      <span className="text-[#C9A96E] font-semibold">{sub.count}</span>
                      {sub.label}
                    </span>
                  )
                ))}
              </div>
            )}
          </div>
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
