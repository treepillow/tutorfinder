import { Outlet, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAF8] via-[#F5F3EF] to-[#EDE9DF] flex">
      <Sidebar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
