"use client";

import Link from "next/link";
import { ArrowRight, Leaf, Users, Globe, BookOpen, HandCoins, FileText, Landmark } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

const stats = [
  { label: "SHGs Empowered", value: "10,000+", icon: Users },
  { label: "Lives Impacted", value: "2M+", icon: Users },
  { label: "Partner Organizations", value: "50+", icon: Landmark },
  { label: "Countries Reached", value: "15+", icon: Globe },
];

const features = [
  {
    name: "Skill Development",
    description: "Training and capacity building",
    icon: BookOpen,
  },
  {
    name: "Grant Acquisition",
    description: "Find and manage grants",
    icon: HandCoins,
  },
  {
    name: "Global Expansion",
    description: "Scale your impact globally",
    icon: Globe,
  },
  {
    name: "Documentation",
    description: "Simplify compliance & reports",
    icon: FileText,
  }
];

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  return (
    <div className="flex flex-col w-full bg-[#fcf9f2] overflow-hidden">
      {/* Hero Section */}
      <section className="relative w-full min-h-[600px] flex items-center pt-8 pb-32">
        {/* The large curved image on the right */}
        <div 
          className="absolute right-0 top-0 h-[650px] w-[60%] lg:w-[55%] bg-[#f28c28]/20 z-0 overflow-hidden shadow-2xl"
          style={{
            borderBottomLeftRadius: '100% 80%',
          }}
        >
          {/* Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: 'url(/hero.png)',
            }}
          />
          {/* A slight gradient overlay to match the warmth of the mockup */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#fcf9f2]/40" />
        </div>

        {/* Floating wavy accent layer behind the image */}
        <div 
          className="absolute right-0 top-12 h-[650px] w-[62%] lg:w-[57%] bg-[#e9f2eb] -z-10"
          style={{
            borderBottomLeftRadius: '100% 70%',
          }}
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 space-y-6 pt-16 pb-24">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e9f2eb] text-[#306e46] text-sm font-medium border border-[#306e46]/10 shadow-sm">
              <Leaf className="h-4 w-4" />
              Empowering 10,000+ SHGs Globally
            </div>
            
            <h1 className="text-5xl md:text-[64px] font-extrabold tracking-tight text-[#1a1a1a] leading-[1.1]">
              Together, We <span className="text-[#306e46]">Grow.</span><br />
              Together, We <span className="text-[#f28c28]">Rise.</span>
            </h1>
            
            <p className="text-lg text-gray-600 max-w-[480px] leading-relaxed font-medium">
              The all-in-one platform for skill development, grant acquisition, and global expansion. We provide the tools you need to scale your impact and build stronger communities.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
              {!user ? (
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#306e46] text-white font-semibold text-base hover:bg-[#255737] shadow-lg shadow-[#306e46]/30 transition-all flex items-center justify-center gap-2"
                >
                  Login to Get Started <ArrowRight className="h-5 w-5" />
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#f28c28] text-white font-semibold text-base hover:bg-[#d97c23] shadow-lg shadow-[#f28c28]/30 transition-all flex items-center justify-center gap-2"
                >
                  Go to Dashboard <ArrowRight className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="relative z-20 -mt-16 container mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="bg-[#eff5ef] rounded-[40px] px-8 py-10 shadow-sm border border-[#e1ece2]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-300/50">
            {features.map((feature, i) => (
              <div key={i} className={`flex items-center gap-4 ${i !== 0 ? 'md:pl-8 pt-6 md:pt-0' : ''}`}>
                <div className="h-12 w-12 rounded-full bg-[#306e46] flex items-center justify-center flex-shrink-0 text-white">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xl font-bold text-[#1a1a1a]">{feature.name}</div>
                  <div className="text-sm font-medium text-gray-600">{feature.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
