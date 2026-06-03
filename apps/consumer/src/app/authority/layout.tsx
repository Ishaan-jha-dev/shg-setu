"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Users, CalendarCheck, PiggyBank,
  Landmark, BarChart3, LogOut, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_SECTIONS = [
  {
    title: "Home",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    title: "Governance",
    items: [
      { name: "Members", href: "/dashboard/members", icon: Users },
      { name: "Meetings & Attendance", href: "/dashboard/meetings", icon: CalendarCheck },
    ]
  },
  {
    title: "Finance",
    items: [
      { name: "Savings Ledger", href: "/dashboard/savings", icon: PiggyBank },
      { name: "Internal Loans", href: "/dashboard/loans", icon: Landmark },
    ]
  },
  {
    title: "Analytics",
    items: [
      { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    ]
  }
];

function NavItem({ item, isActive }: { item: { name: string; href: string; icon: any }; isActive: boolean }) {
  return (
    <Link href={item.href} className="relative block">
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-[10px]"
          style={{ background: "rgba(10,132,255,0.15)" }}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}
      <motion.div
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`relative flex items-center gap-2.5 px-3 py-2 rounded-[10px] ${
          isActive
            ? "text-[#0A84FF]"
            : "text-[#98989F] hover:text-[#F5F5F7]"
        }`}
      >
        <item.icon className="w-[16px] h-[16px] shrink-0" strokeWidth={isActive ? 2.5 : 2} />
        <span className="text-[13.5px] font-medium">{item.name}</span>
        {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
      </motion.div>
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-[#161618] overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -16, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        className="w-[220px] shrink-0 flex flex-col py-4 border-r border-[rgba(255,255,255,0.08)]"
        style={{ background: "rgba(22,22,24,0.95)" }}
      >
        {/* App Title */}
        <div className="px-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[8px] bg-[#0A84FF] flex items-center justify-center">
              <span className="text-white font-bold text-[11px]">S</span>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#F5F5F7] leading-tight">Setu SHG OS</p>
              <p className="text-[10px] text-[#636366] leading-tight">Self Help Group Portal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-4 overflow-y-auto scrollbar">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="px-3 mb-1 text-[10.5px] font-semibold tracking-wider uppercase text-[#636366]">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavItem key={item.href} item={item} isActive={isActive(item.href)} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-2 pt-2 border-t border-[rgba(255,255,255,0.06)]">
          <motion.button
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-[#636366] hover:text-[#FF453A] hover:bg-[rgba(255,69,58,0.1)] transition-colors"
          >
            <LogOut className="w-[16px] h-[16px]" />
            <span className="text-[13.5px] font-medium">Logout</span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: "spring", stiffness: 400, damping: 40, duration: 0.2 }}
            className="min-h-full p-8 max-w-[1100px]"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
