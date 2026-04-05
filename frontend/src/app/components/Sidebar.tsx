import { NavLink, useNavigate } from "react-router";
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { clearAuth, getCurrentUser } from "../utils/api";
import { useNavCounts } from "../context/NavCountsContext";
import circleGrad from "../assets/circleGrad.png";

// Cute filled SVG icons
function IconDiscover({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      {/* Compass circle */}
      <circle cx="12" cy="12" r="10" fill={active ? "#F5C842" : "none"} stroke={active ? "#E6A800" : "white"} strokeWidth="2" strokeLinejoin="round"/>
      {/* North/South arrow — pointing NE */}
      <polygon points="12,4 14.5,12 12,10.5 9.5,12" fill={active ? "#E53935" : "white"} />
      <polygon points="12,20 9.5,12 12,13.5 14.5,12" fill={active ? "#E0E0E0" : "white"} opacity={active ? 1 : 0.5} />
      <circle cx="12" cy="12" r="1.5" fill={active ? "#E6A800" : "white"} />
    </svg>
  );
}

function IconMatched({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21C12 21 3 14.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 13 5.08C14.09 3.81 15.76 3 17.5 3C20.58 3 23 5.42 23 8.5C23 14.5 12 21 12 21Z"
        fill={active ? "#F44336" : "none"}
        stroke={active ? "#C62828" : "white"}
        strokeWidth="2"
        strokeLinejoin="round"
        transform="translate(-1,0)"
      />
      {/* Shine spot */}
      {active && <ellipse cx="8.5" cy="8" rx="2" ry="1.2" fill="white" opacity="0.35" transform="translate(-1,0)"/>}
    </svg>
  );
}

function IconRequests({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      {/* Tray body */}
      <rect x="2" y="13" width="20" height="8" rx="3" fill={active ? "#7C8D8C" : "none"} stroke={active ? "#4A6163" : "white"} strokeWidth="2"/>
      {/* Tray opening arc */}
      <path d="M6 13 Q6 8 12 8 Q18 8 18 13" fill={active ? "#A8BFBE" : "none"} stroke={active ? "#4A6163" : "white"} strokeWidth="2" strokeLinecap="round"/>
      {/* Arrow down into tray */}
      <path d="M12 3 L12 9 M9.5 6.5 L12 9 L14.5 6.5" stroke={active ? "#E6A800" : "white"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconSchedule({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      {/* Calendar body */}
      <rect x="3" y="5" width="18" height="17" rx="3" fill={active ? "#7EC8E3" : "none"} stroke={active ? "#0077A8" : "white"} strokeWidth="2"/>
      {/* Header band */}
      <rect x="3" y="5" width="18" height="6" rx="3" fill={active ? "#0099CC" : "none"} stroke="none"/>
      {active && <rect x="3" y="8" width="18" height="3" fill="#0099CC"/>}
      {/* Binding pegs */}
      <line x1="8" y1="3" x2="8" y2="8" stroke={active ? "#0077A8" : "white"} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="16" y1="3" x2="16" y2="8" stroke={active ? "#0077A8" : "white"} strokeWidth="2.5" strokeLinecap="round"/>
      {/* Date dots */}
      {active && <>
        <circle cx="8" cy="15" r="1.5" fill="white"/>
        <circle cx="12" cy="15" r="1.5" fill="white"/>
        <circle cx="16" cy="15" r="1.5" fill="white"/>
        <circle cx="8" cy="19" r="1.5" fill="white"/>
        <circle cx="12" cy="19" r="1.5" fill="white"/>
      </>}
      {!active && <>
        <circle cx="8" cy="15" r="1.5" fill="white"/>
        <circle cx="12" cy="15" r="1.5" fill="white"/>
        <circle cx="16" cy="15" r="1.5" fill="white"/>
        <circle cx="8" cy="19" r="1.5" fill="white"/>
        <circle cx="12" cy="19" r="1.5" fill="white"/>
      </>}
    </svg>
  );
}

function IconProfile({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      {/* Head */}
      <circle cx="12" cy="8" r="4.5" fill={active ? "#FFCC80" : "none"} stroke={active ? "#E65100" : "white"} strokeWidth="2"/>
      {/* Eyes */}
      {active && <>
        <circle cx="10.5" cy="7.5" r="0.8" fill="#5D4037"/>
        <circle cx="13.5" cy="7.5" r="0.8" fill="#5D4037"/>
        <path d="M10.5 9.5 Q12 10.8 13.5 9.5" stroke="#5D4037" strokeWidth="0.8" strokeLinecap="round" fill="none"/>
      </>}
      {/* Body / shoulders */}
      <path d="M4 21 C4 17 7.58 14 12 14 C16.42 14 20 17 20 21" fill={active ? "#FFCC80" : "none"} stroke={active ? "#E65100" : "white"} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function IconDisputes({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L2 7l10 5 10-5-10-5z"
        fill={active ? "#F5C842" : "none"}
        stroke={active ? "#E6A800" : "white"}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 22V12"
        stroke={active ? "#E6A800" : "white"}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9 15l3 3 3-3"
        stroke={active ? "#E53935" : "white"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="rotate(180 12 16.5)"
      />
    </svg>
  );
}

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
      Icon: IconDiscover,
      label: "Discover",
      badge: 0,
      subBadges: null,
    },
    {
      path: "/app/matched",
      Icon: IconMatched,
      label: "Matched",
      badge: counts.matched,
      subBadges: null,
    },
    {
      path: "/app/requests",
      Icon: IconRequests,
      label: "Requests",
      badge: requestsTotal,
      subBadges: null,
    },
    {
      path: "/app/schedule",
      Icon: IconSchedule,
      label: "Schedule",
      badge: counts.scheduled,
      subBadges: null,
    },
  ];

  // Admin-only nav items
  if (currentUser?.role?.toLowerCase() === "admin" || currentUser?.userType === "admin") {
    navItems.push({
      path: "/app/admin/disputes",
      Icon: IconDisputes,
      label: "Disputes",
      badge: 0,
      subBadges: null,
    });
  }

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
          <img src={circleGrad} alt="TutorFinder" className="w-8 h-8 flex-shrink-0" />
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
                    <item.Icon active={isActive} />
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
              <IconProfile active={true} />
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
          <IconProfile active={false} />
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
