import { NavLink, useNavigate } from "react-router";
import { useState } from "react";
import { Home, Heart, Inbox, Calendar, User, ChevronLeft, ChevronRight, HelpCircle, Shield, LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { clearAuth } from "../utils/api";

const navItems = [
  { path: "/app/discover", icon: Home, label: "Discover" },
  { path: "/app/matched", icon: Heart, label: "Matched" },
  { path: "/app/requests", icon: Inbox, label: "Requests" },
  { path: "/app/schedule", icon: Calendar, label: "Schedule" },
  { path: "/app/profile", icon: User, label: "Profile" },
];

const profileMenuItems = [
  { path: "/app/profile", icon: User, label: "Profile" },
  { icon: HelpCircle, label: "FAQ" },
  { icon: Shield, label: "Safety Guidelines" },
];

export function Sidebar() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showSafety, setShowSafety] = useState(false);

  const handleProfileMenuClick = (item: typeof profileMenuItems[0]) => {
    if (item.path) {
      navigate(item.path);
      setShowProfileMenu(false);
    } else if (item.label === "FAQ") {
      setShowFAQ(true);
      setShowProfileMenu(false);
    } else if (item.label === "Safety Guidelines") {
      setShowSafety(true);
      setShowProfileMenu(false);
    }
  };

  const handleSignOut = () => {
    clearAuth();
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <>
      <aside
        className={`bg-[#2F3B3D] text-white transition-all duration-300 relative ${
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

        <nav className="px-3 space-y-2">
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

        <div className="absolute bottom-6 left-0 right-0 px-3">
          <button
            onClick={() => setShowProfileMenu(true)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-white/70 hover:bg-white/10 hover:text-white w-full ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <User className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Menu</span>}
          </button>
        </div>
      </aside>

      {/* Profile Menu Dialog */}
      <Dialog open={showProfileMenu} onOpenChange={setShowProfileMenu}>
        <DialogContent className="bg-[#F5F3EF] border-[#D6CFBF]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#2F3B3D]">Menu</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {profileMenuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleProfileMenuClick(item)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#EDE9DF] transition-all w-full text-[#2F3B3D]"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-100 transition-all w-full text-red-600"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* FAQ Dialog */}
      <Dialog open={showFAQ} onOpenChange={setShowFAQ}>
        <DialogContent className="bg-[#F5F3EF] border-[#D6CFBF] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#2F3B3D]">Frequently Asked Questions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <h4 className="font-semibold text-[#2F3B3D] mb-2">How does matching work?</h4>
              <p className="text-[#2F3B3D]/70 text-sm">
                Swipe right on profiles you're interested in. When both parties swipe right, it's a match!
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[#2F3B3D] mb-2">How do I book a lesson?</h4>
              <p className="text-[#2F3B3D]/70 text-sm">
                After matching, students can select available time slots and send a booking request to tutors.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[#2F3B3D] mb-2">How do payments work?</h4>
              <p className="text-[#2F3B3D]/70 text-sm">
                Once a tutor accepts your request, you'll be prompted to make a secure payment through Stripe.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[#2F3B3D] mb-2">Can I cancel a lesson?</h4>
              <p className="text-[#2F3B3D]/70 text-sm">
                Yes, you can cancel requests before they're accepted. Check our cancellation policy for accepted bookings.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Safety Guidelines Dialog */}
      <Dialog open={showSafety} onOpenChange={setShowSafety}>
        <DialogContent className="bg-[#F5F3EF] border-[#D6CFBF] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#2F3B3D]">Safety Guidelines</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <h4 className="font-semibold text-[#2F3B3D] mb-2">Meet in Public Places</h4>
              <p className="text-[#2F3B3D]/70 text-sm">
                For first meetings, always choose public locations like libraries, cafes, or community centers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[#2F3B3D] mb-2">Verify Credentials</h4>
              <p className="text-[#2F3B3D]/70 text-sm">
                All tutors are verified, but always review their qualifications and experience before booking.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[#2F3B3D] mb-2">Use Platform Communication</h4>
              <p className="text-[#2F3B3D]/70 text-sm">
                Keep all communication within the platform until you're comfortable sharing contact information.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[#2F3B3D] mb-2">Trust Your Instincts</h4>
              <p className="text-[#2F3B3D]/70 text-sm">
                If something feels off, don't hesitate to cancel or report. Your safety is our priority.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[#2F3B3D] mb-2">Report Issues</h4>
              <p className="text-[#2F3B3D]/70 text-sm">
                If you encounter any problems or inappropriate behavior, report it immediately to our team.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
