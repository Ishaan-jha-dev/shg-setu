"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, Crown, Shield, Code2 } from "lucide-react";

export default function DemoSwitcher() {
  const [role, setRole] = useState<string>("member");
  const [isOpen, setIsOpen] = useState(false);
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
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl p-2 mb-3 w-48 flex flex-col gap-1 animate-in slide-in-from-bottom-5">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-700/50 mb-1">
            Demo Mode Switcher
          </div>
          <button
            onClick={() => handleSetRole("member")}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${role === "member" ? "bg-emerald-500/20 text-emerald-400" : "text-slate-300 hover:bg-slate-800"}`}
          >
            <User className="h-4 w-4" /> SHG Member
          </button>
          <button
            onClick={() => handleSetRole("leader")}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${role === "leader" ? "bg-[#f28c28]/20 text-[#f28c28]" : "text-slate-300 hover:bg-slate-800"}`}
          >
            <Crown className="h-4 w-4" /> SHG Leader
          </button>
          <button
            onClick={() => handleSetRole("authority")}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${role === "authority" ? "bg-indigo-500/20 text-indigo-400" : "text-slate-300 hover:bg-slate-800"}`}
          >
            <Shield className="h-4 w-4" /> Authority
          </button>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/20 border border-slate-700 h-12 w-12 rounded-full flex items-center justify-center transition-transform hover:scale-105"
      >
        <Code2 className="h-5 w-5 text-indigo-400" />
      </button>
    </div>
  );
}
