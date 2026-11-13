"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import LoginScreen from "./LoginScreen";
import Sidebar from "./Sidebar";
import TourModal from "./TourModal";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Before hydration completes or when user is not logged in, show Login/Register screen immediately
  // Never trap users on an indefinite loading screen over LAN
  if (!mounted || !user) {
    return <LoginScreen />;
  }

  // Once mounted and verified logged in, show full app with sidebar
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="page-content">
        {children}
      </main>
      <TourModal />
    </div>
  );
}
