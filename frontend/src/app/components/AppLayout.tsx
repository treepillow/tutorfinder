import { Outlet, useNavigate } from "react-router";
import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { getToken, getCurrentUser } from "../utils/api";
import { NavCountsProvider } from "../context/NavCountsContext";

export function AppLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    const currentUser = getCurrentUser();
    if (!token || !currentUser) {
      navigate("/");
    }
  }, [navigate]);

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
