import { Outlet, useNavigate, useLocation } from "react-router";
import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { getToken, getCurrentUser } from "../utils/api";
import { NavCountsProvider } from "../context/NavCountsContext";

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = getToken();
    const currentUser = getCurrentUser();
    if (!token || !currentUser) {
      navigate("/");
      return;
    }

    // Redirect root /app based on user type
    if (location.pathname === "/app") {
      if (currentUser.userType === "admin") {
        navigate("/app/admin/dashboard", { replace: true });
      } else {
        navigate("/app/discover", { replace: true });
      }
    }
  }, [navigate, location.pathname]);

  return (
    <NavCountsProvider>
      <div className="h-screen bg-gradient-to-br from-[#FAFAF8] via-[#F5F3EF] to-[#EDE9DF] flex overflow-hidden">
        <div className="sticky top-0 h-screen flex-shrink-0">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </NavCountsProvider>
  );
}
