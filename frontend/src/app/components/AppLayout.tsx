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
    <div className="min-h-screen bg-[#FFF2D5] flex">
      <Sidebar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
