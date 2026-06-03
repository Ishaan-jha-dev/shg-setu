"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, Users, Landmark, PiggyBank, CreditCard, 
  CalendarCheck, FileText, BarChart3, GraduationCap, 
  Award, ShoppingBag, BookOpen 
} from "lucide-react";

const SIDEBAR_ITEMS = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "My SHG", href: "/dashboard/shg", icon: Users },
  { name: "Members", href: "/dashboard/members", icon: Users }, // Using Users again for now
  { name: "Savings", href: "/dashboard/savings", icon: PiggyBank },
  { name: "Loans", href: "/dashboard/loans", icon: CreditCard },
  { name: "Attendance", href: "/dashboard/attendance", icon: CalendarCheck },
  { name: "Passbook", href: "/dashboard/passbook", icon: FileText },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Training & Skills", href: "/dashboard/skills", icon: GraduationCap },
  { name: "Grant Opportunities", href: "/dashboard/grants", icon: Award },
  { name: "Marketplace", href: "/dashboard/marketplace", icon: ShoppingBag },
  { name: "Resources", href: "/dashboard/resources", icon: BookOpen },
];

export default function Sidebar() {
  const pathname = usePathname();

  // Hide on login/join
  if (pathname === "/login" || pathname === "/join") return null;

  return (
    <aside className="w-[260px] flex-shrink-0 border-r border-[#e5e7eb] bg-[#fafaf9] flex flex-col h-screen fixed left-0 top-0 overflow-y-auto hidden lg:flex">
      
      {/* Brand */}
      <div className="pt-6 pb-4 px-6 sticky top-0 bg-[#fafaf9] z-10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center">
             <img src="/logo.png" alt="Setu" className="h-full w-full object-contain" />
          </div>
          <div>
            <div className="font-extrabold text-xl leading-tight text-[#1a4023]">Setu SHG</div>
            <div className="text-[10px] text-[#5e6e63] uppercase tracking-wider font-semibold">Saath • Vikas • Samriddhi</div>
          </div>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                  ? "bg-[#edf4e8] text-[#2d5635]" 
                  : "text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#374151]"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-[#2d5635]" : "text-[#9ca3af]"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Promo */}
      <div className="p-4 mt-8">
        <div className="bg-[#fdfbf7] border border-[#f0ebe1] rounded-2xl p-5 text-center">
          <div className="flex justify-center mb-3">
             <div className="h-12 w-24 bg-[url('/shg_group.png')] bg-cover bg-center rounded-lg shadow-sm"></div>
          </div>
          <h4 className="text-[#1a4023] font-bold text-sm mb-1">Stronger Together,<br/>Better Tomorrow</h4>
          <p className="text-[#6b7280] text-xs">Building self-reliant communities</p>
        </div>
      </div>

    </aside>
  );
}
