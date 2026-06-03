"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, Crown, Shield } from "lucide-react";

export default function DemoSwitcher() {
  const [role, setRole] = useState<string>("member");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Read the current cookie on mount
    const match = document.cookie.match(new RegExp('(^| )demo_role=([^;]+)'));
    if (match) {
      setRole(match[2]);
    }
  }, []);

  const handleSetRole = (newRole: string) => {
    document.cookie = `demo_role=${newRole}; path=/; max-age=86400`;
    setRole(newRole);

    if (newRole === "authority") {
      router.push("/authority");
    } else {
      // If we are currently on the authority page, go back to dashboard
      if (pathname?.startsWith("/authority")) {
        router.push("/dashboard");
      } else {
        router.refresh(); // Just refresh the current dashboard to apply new role
      }
    }
  };

  // Don't show on login page
  if (pathname === "/login" || pathname === "/join") return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-700/50 p-1.5 rounded-full shadow-2xl transition-all hover:shadow-indigo-500/20 group">
      
      {/* Tooltip Label (Shows on hover of the pill) */}
      <div className="absolute -top-8 right-2 bg-slate-800 text-xs text-slate-300 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-slate-700">
        Demo Persona Switcher
      </div>

      <button
        onClick={() => handleSetRole("member")}
        title="Switch to Member"
        className={`p-2.5 rounded-full transition-all ${
          role === "member" 
            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105" 
            : "text-slate-400 hover:text-slate-200 hover:bg-white/10"
        }`}
      >
        <User className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleSetRole("leader")}
        title="Switch to Leader"
        className={`p-2.5 rounded-full transition-all ${
          role === "leader" 
            ? "bg-[#f28c28] text-white shadow-lg shadow-[#f28c28]/30 scale-105" 
            : "text-slate-400 hover:text-slate-200 hover:bg-white/10"
        }`}
      >
        <Crown className="h-4 w-4" />
      </button>

      <button
        onClick={() => handleSetRole("authority")}
        title="Switch to Authority"
        className={`p-2.5 rounded-full transition-all ${
          role === "authority" 
            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-105" 
            : "text-slate-400 hover:text-slate-200 hover:bg-white/10"
        }`}
      >
        <Shield className="h-4 w-4" />
      </button>
      
    </div>
  );
}
