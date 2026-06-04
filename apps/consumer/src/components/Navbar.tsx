"use client";

import Link from "next/link";
import { BookOpen, HandCoins, Globe, FileText, Menu, X, ArrowRight, Leaf } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

const navLinks: any[] = [];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#fcf9f2] border-b border-gray-200">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3">
          <div className="h-12 w-12 relative rounded-full overflow-hidden border border-[#306e46]/20 shadow-sm flex-shrink-0">
            {/* The generated earthy logo image */}
            <img 
              src="/logo.png" 
              alt="Setu Logo" 
              className="absolute inset-0 w-full h-full object-cover" 
            />
          </div>
          
          <div className="flex flex-col justify-center">
             <div className="flex items-baseline gap-1">
               <span className="text-[28px] font-extrabold text-[#306e46] tracking-tight leading-none">
                 Setu
               </span>
               <span className="text-[22px] font-bold text-[#f28c28] leading-none">
                 SHG
               </span>
             </div>
             <span className="text-[10px] tracking-[0.15em] font-semibold text-gray-500 uppercase mt-0.5">
               Saath • Vikas • Samriddhi
             </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-semibold text-gray-700 hover:text-[#306e46] transition-colors flex items-center gap-2 group"
            >
              <link.icon className="h-4 w-4 text-[#306e46]" />
              {link.name}
            </Link>
          ))}
          <a
            href="https://github.com/Ishaan-jha-dev/shg-setu/raw/main/apps/consumer/public/setu-shg.apk"
            download="setu-shg.apk"
            className="text-sm font-bold text-[#f28c28] hover:text-[#d97c23] transition-colors flex items-center gap-1.5 px-2"
          >
            Download Mobile App
          </a>
          {!user ? (
            <Link href="/login" className="rounded-full bg-[#306e46] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#255737] transition-colors flex items-center gap-2 shadow-sm">
              Login / Register <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link href="/dashboard" className="rounded-full bg-[#f28c28] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#d97c23] transition-colors flex items-center gap-2 shadow-sm">
              Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-700"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-[#fcf9f2] shadow-xl absolute w-full">
          <div className="space-y-1 px-4 pb-4 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-100"
              >
                <link.icon className="h-5 w-5 text-[#306e46]" />
                {link.name}
              </Link>
            ))}
            <div className="px-3 pt-2">
              <a
                href="https://github.com/Ishaan-jha-dev/shg-setu/raw/main/apps/consumer/public/setu-shg.apk"
                download="setu-shg.apk"
                className="w-full flex items-center justify-center gap-2 rounded-md bg-[#fef4ea] px-3 py-3 text-base font-bold text-[#f28c28] hover:bg-[#fde9d5]"
              >
                Download Mobile App
              </a>
            </div>
            <div className="mt-4 px-3">
              {!user ? (
                <Link href="/login" onClick={() => setIsOpen(false)} className="w-full rounded-full bg-[#306e46] px-5 py-3 text-sm font-semibold text-white hover:bg-[#255737] transition-colors flex items-center justify-center gap-2 shadow-sm">
                  Login / Register <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="w-full rounded-full bg-[#f28c28] px-5 py-3 text-sm font-semibold text-white hover:bg-[#d97c23] transition-colors flex items-center justify-center gap-2 shadow-sm">
                  Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
