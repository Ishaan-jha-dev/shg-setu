import Link from "next/link";
import { Bell, LogOut } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-[#1a2332] text-white shrink-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="Setu" 
              className="h-9 w-9 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-colors" 
            />
            <div>
              <div className="font-bold text-lg leading-tight group-hover:text-white transition-colors">
                Setu <span className="text-[#f28c28]">SHG</span>
              </div>
              <div className="text-[10px] text-white/40 tracking-widest uppercase group-hover:text-white/60 transition-colors">
                Financial Inclusion Platform
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <button className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors relative">
              <Bell className="h-4 w-4 text-white" />
            </button>
            <form action="/auth/signout" method="post">
              <button className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors px-3 py-1.5 rounded-full hover:bg-white/10">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
