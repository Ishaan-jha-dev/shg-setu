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
    <div className="bg-[#1e293b] border-b border-slate-700 py-3 px-4 w-full flex justify-center z-50">
      <div className="bg-slate-900 rounded-full p-1 flex items-center relative max-w-md w-full shadow-inner border border-slate-800">
        
        {/* Animated Background Slider */}
        <div 
          className="absolute top-1 bottom-1 w-[32.5%] bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300 ease-out shadow-md"
          style={{ 
            left: role === "member" ? "1%" : role === "leader" ? "33.7%" : "66.5%",
          }}
        />

        <button
          onClick={() => handleSetRole("member")}
          className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold transition-colors rounded-full ${role === "member" ? "text-white" : "text-slate-400 hover:text-slate-200"}`}
        >
          <User className="h-4 w-4" /> Member
        </button>

        <button
          onClick={() => handleSetRole("leader")}
          className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold transition-colors rounded-full ${role === "leader" ? "text-white" : "text-slate-400 hover:text-slate-200"}`}
        >
          <Crown className="h-4 w-4" /> Leader
        </button>

        <button
          onClick={() => handleSetRole("authority")}
          className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold transition-colors rounded-full ${role === "authority" ? "text-white" : "text-slate-400 hover:text-slate-200"}`}
        >
          <Shield className="h-4 w-4" /> Authority
        </button>
      </div>
    </div>
  );
}
