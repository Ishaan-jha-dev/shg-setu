"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, HelpCircle, Menu } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  
  // Hide on login/join
  if (pathname === "/login" || pathname === "/join") return null;

  return (
    <header className="bg-white border-b border-[#e5e7eb] sticky top-0 z-40 lg:pl-[260px]">
      <div className="h-20 px-6 flex items-center justify-between">
        
        {/* Left: Mobile Menu & Logo (Visible mainly on small screens if sidebar is hidden) */}
        <div className="flex items-center gap-4 lg:hidden">
          <button className="text-[#6b7280] hover:text-[#111827]">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Setu" className="h-8 w-8" />
            <div className="font-extrabold text-[#1a4023]">Setu SHG</div>
          </div>
        </div>

        {/* Desktop Left Spacer */}
        <div className="hidden lg:block flex-1"></div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-5">
          <button className="relative text-[#6b7280] hover:text-[#111827] transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-[#f28c28] rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white">
              3
            </span>
          </button>
          
          <button className="text-[#6b7280] hover:text-[#111827] transition-colors">
            <HelpCircle className="h-5 w-5" />
          </button>

          <div className="h-6 w-[1px] bg-[#e5e7eb] mx-1"></div>

          <form action="/auth/signout" method="post" className="flex items-center gap-3 cursor-pointer">
            <button type="submit" className="flex items-center gap-3 text-left">
              <div className="h-10 w-10 rounded-full bg-[#f3f4f6] border border-[#e5e7eb] overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ishaan" alt="Avatar" className="h-full w-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-[#111827] leading-tight">Ishaan</div>
                <div className="text-xs text-[#6b7280] font-medium">Leader</div>
              </div>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
