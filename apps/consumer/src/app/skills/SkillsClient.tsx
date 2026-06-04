"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { 
  GraduationCap, Users, Award, BookOpen, Clock, BarChart2,
  CheckCircle2, Search, Filter, ArrowRight, X, Loader2, Sparkles, ChevronLeft
} from "lucide-react";

interface SkillsClientProps {
  member: any;
  dbPrograms: any[];
  dbEnrollments: any[];
}

export default function SkillsClient({ member, dbPrograms, dbEnrollments }: SkillsClientProps) {
  const router = useRouter();
  const supabase = createClient();

  // Local state to keep UI fast
  const [enrollments, setEnrollments] = useState<any[]>(dbEnrollments);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // Interactive search & filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [showMyEnrollmentsOnly, setShowMyEnrollmentsOnly] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);

  // 6 specific programs from mockup with mapping keywords
  const mockPrograms = useMemo(() => [
    {
      mockId: "1",
      name: "Basic Computer Training",
      category: "Digital Skills",
      description: "Learn computer basics, MS Office, and internet usage.",
      image: "/skill_digital.png",
      level: "Beginner",
      duration_weeks: 4,
      enrolled_count: 15,
      provider: "National Skill Development Corporation (NSDC)",
      dbKeywords: ["digital literacy basics", "digital literacy", "computer", "internet"],
      badgeClass: "bg-[#eff6ff] text-[#1e40af] border-[#dbeafe]"
    },
    {
      mockId: "2",
      name: "Handicraft & Artisan Skills",
      category: "Entrepreneurship",
      description: "Learn handicrafts and turn your creativity into income.",
      image: "/skill_tailoring.png",
      level: "Beginner",
      duration_weeks: 6,
      enrolled_count: 22,
      provider: "Khadi and Village Industries Commission (KVIC)",
      dbKeywords: ["basic tailoring & stitching", "tailoring", "stitching", "handicraft", "artisan"],
      badgeClass: "bg-[#fff7ed] text-[#c2410c] border-[#ffedd5]"
    },
    {
      mockId: "3",
      name: "Sustainable Farming Practices",
      category: "Agriculture",
      description: "Learn modern and organic farming techniques.",
      image: "/skill_agriculture.png",
      level: "Beginner",
      duration_weeks: 5,
      enrolled_count: 18,
      provider: "NABARD / Krishi Vigyan Kendra (KVK)",
      dbKeywords: ["organic farming & composting", "organic", "farming", "composting", "agriculture", "goat & poultry rearing"],
      badgeClass: "bg-[#f0fdf4] text-[#166534] border-[#dcfce7]"
    },
    {
      mockId: "4",
      name: "Small Business Management",
      category: "Business Skills",
      description: "Basics of managing finances, customers and growth.",
      image: "/skill_business.png",
      level: "Beginner",
      duration_weeks: 4,
      enrolled_count: 12,
      provider: "State Rural Livelihood Mission (SRLM)",
      dbKeywords: ["basic accounts & bookkeeping", "accounts", "bookkeeping", "business", "management"],
      badgeClass: "bg-[#ecfeff] text-[#155e75] border-[#cffafe]"
    },
    {
      mockId: "5",
      name: "Digital Payments & UPI",
      category: "Digital Literacy",
      description: "Learn digital payments, UPI, and online safety.",
      image: "/skill_digital.png",
      level: "Beginner",
      duration_weeks: 2,
      enrolled_count: 35,
      provider: "National Payments Corporation of India (NPCI)",
      dbKeywords: ["basic mobile banking & upi", "upi", "payments", "mobile banking"],
      badgeClass: "bg-[#faf5ff] text-[#6b21a8] border-[#e9d5ff]"
    },
    {
      mockId: "6",
      name: "Food Processing & Preservation",
      category: "Livelihood",
      description: "Learn safe food processing and preservation methods.",
      image: "/skill_food.png",
      level: "Beginner",
      duration_weeks: 5,
      enrolled_count: 20,
      provider: "Ministry of Food Processing Industries (MoFPI)",
      dbKeywords: ["pickle & papad making", "pickle", "papad", "food processing", "preservation"],
      badgeClass: "bg-[#fffbeb] text-[#92400e] border-[#fef3c7]"
    }
  ], []);

  // Enrich mock programs with DB IDs and enrollment state
  const programsWithEnrollment = useMemo(() => {
    return mockPrograms.map(mock => {
      // Find matching program in DB based on keywords or exact name match
      const dbMatch = dbPrograms.find(db => {
        const nameLower = db.name.toLowerCase();
        return mock.dbKeywords.some(keyword => nameLower.includes(keyword)) || nameLower.includes(mock.name.toLowerCase());
      });

      const realProgramId = dbMatch?.id || null;

      // Find if user is enrolled
      const enrollment = realProgramId 
        ? enrollments.find(e => e.program_id === realProgramId) 
        : null;

      return {
        ...mock,
        realProgramId,
        enrollmentId: enrollment?.id || null,
        enrollmentStatus: enrollment?.status || null,
        enrolledAt: enrollment?.enrolled_at || null,
        completionDate: enrollment?.completion_date || null,
      };
    });
  }, [mockPrograms, dbPrograms, enrollments]);

  // Statistics calculations
  const totalPrograms = programsWithEnrollment.length;
  const enrolledCount = programsWithEnrollment.filter(p => p.enrollmentStatus).length;
  const completedCount = programsWithEnrollment.filter(p => p.enrollmentStatus === "COMPLETED").length;

  // Filtered programs to show in feed
  const filteredPrograms = useMemo(() => {
    return programsWithEnrollment.filter(program => {
      // Filter by My Enrollments toggle
      if (showMyEnrollmentsOnly && !program.enrollmentStatus) {
        return false;
      }
      
      // Filter by Category
      if (selectedCategory !== "All Categories" && program.category !== selectedCategory) {
        return false;
      }

      // Filter by Search Query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        return (
          program.name.toLowerCase().includes(query) ||
          program.description.toLowerCase().includes(query) ||
          program.category.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [programsWithEnrollment, showMyEnrollmentsOnly, selectedCategory, searchQuery]);

  // Unique categories list
  const categories = useMemo(() => {
    return ["All Categories", ...Array.from(new Set(mockPrograms.map(p => p.category)))];
  }, [mockPrograms]);

  // Enroll handler
  const handleEnroll = async (program: any) => {
    if (!member) {
      alert("No member profile found. Cannot enroll.");
      return;
    }
    
    // Use the matched DB program ID or fall back to mock enrollment
    const programId = program.realProgramId;
    if (!programId) {
      // Mock client side enrollment for demo
      const mockEnrollment = {
        id: "mock-enroll-" + program.mockId,
        program_id: "mock-prog-" + program.mockId,
        member_id: member.id,
        status: "ENROLLED",
        enrolled_at: new Date().toISOString()
      };
      setEnrollments(prev => [...prev, mockEnrollment]);
      // Update selected program modal state
      setSelectedProgram(prev => prev ? { ...prev, enrollmentStatus: "ENROLLED" } : null);
      return;
    }

    setLoadingId(program.mockId);
    try {
      const { data, error } = await supabase
        .from("skill_enrollments")
        .insert({
          member_id: member.id,
          program_id: programId,
          status: "ENROLLED"
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setEnrollments(prev => [...prev, data]);
      setSelectedProgram(prev => prev ? { ...prev, enrollmentStatus: "ENROLLED", enrollmentId: data.id } : null);
      router.refresh();
    } catch (err: any) {
      console.error("Error enrolling:", err.message);
      alert("Could not complete enrollment: " + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  // Mark Completed handler
  const handleMarkComplete = async (program: any) => {
    const enrollmentId = program.enrollmentId;
    if (!enrollmentId) return;

    if (enrollmentId.startsWith("mock-")) {
      // Mock completion
      setEnrollments(prev => 
        prev.map(e => e.id === enrollmentId ? { ...e, status: "COMPLETED", completion_date: new Date().toISOString() } : e)
      );
      setSelectedProgram(prev => prev ? { ...prev, enrollmentStatus: "COMPLETED" } : null);
      return;
    }

    setLoadingId(program.mockId);
    try {
      const { error } = await supabase
        .from("skill_enrollments")
        .update({
          status: "COMPLETED",
          completion_date: new Date().toISOString()
        })
        .eq("id", enrollmentId);

      if (error) throw error;

      // Update local state
      setEnrollments(prev => 
        prev.map(e => e.id === enrollmentId ? { ...e, status: "COMPLETED" } : e)
      );
      setSelectedProgram(prev => prev ? { ...prev, enrollmentStatus: "COMPLETED" } : null);
      router.refresh();
    } catch (err: any) {
      console.error("Error completing:", err.message);
      alert("Error marking completion: " + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* HERO BANNER */}
      <div className="relative overflow-hidden rounded-[32px] bg-[#edf4e8] lg:bg-gradient-to-r lg:from-[#edf4e8] lg:to-[#e2ece0] border border-[#d2e3cc] flex flex-col md:flex-row items-stretch justify-between shadow-[0_4px_20px_rgba(0,0,0,0.02)] min-h-[260px]">
        {/* Left Side: Details & Stats */}
        <div className="flex-1 p-6 sm:p-8 lg:p-10 flex flex-col justify-between z-10 space-y-6 md:max-w-[55%]">
          <div>
            <button 
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2d5635] hover:text-[#1a4023] transition-colors mb-4 group"
            >
              <ChevronLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Dashboard
            </button>
            
            <p className="text-[10px] sm:text-xs font-extrabold text-[#72a170] tracking-[0.2em] uppercase mb-2">
              Learn • Grow • Earn
            </p>
            
            <h1 className="text-2xl sm:text-3xl lg:text-[38px] font-black text-[#1a4023] tracking-tight leading-none mb-3">
              Skill Development Hub
            </h1>
            
            <p className="text-[#5e6e63] text-sm font-medium max-w-md leading-relaxed">
              Free vocational, digital, and agricultural training from government and NGO partners.
            </p>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Programs Available", value: totalPrograms, icon: GraduationCap, bg: "bg-[#e2ece0] text-[#2d5635]" },
              { label: "Members Enrolled", value: 126, icon: Users, bg: "bg-[#e2ece0] text-[#2d5635]" },
              { label: "Completed Programs", value: 42, icon: Award, bg: "bg-[#e2ece0] text-[#2d5635]" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 border border-white/50 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${stat.bg}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-lg lg:text-xl font-black text-[#1a4023] leading-none mb-0.5">{stat.value}</div>
                  <div className="text-[9px] lg:text-[10px] font-bold text-gray-500 leading-tight">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Generated Image with Gradient Mask */}
        <div className="hidden md:block absolute top-0 right-0 h-full w-[45%] pointer-events-none">
          <div className="w-full h-full relative">
            <img 
              src="/skills_hero_banner.png" 
              alt="Rural Indian Women Learning" 
              className="w-full h-full object-cover object-center rounded-r-[32px]"
            />
            {/* Blending Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#edf4e8] via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      {/* FILTER BAR SECTION */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-white border border-[#e5e7eb] rounded-full flex items-center justify-center shadow-sm">
            <GraduationCap className="h-5 w-5 text-[#2d5635]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#111827]">
              {showMyEnrollmentsOnly ? "My Enrolled Programs" : "Available Programs"}
            </h2>
            <p className="text-xs text-[#6b7280]">
              {showMyEnrollmentsOnly 
                ? "Track your enrollment progress and download earned certificates"
                : "Choose a program and start your learning journey"
              }
            </p>
          </div>
        </div>

        {/* Search, Filter, and View Mode Selector */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search programs..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#e5e7eb] text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5635] focus:border-transparent bg-white shadow-sm"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 rounded-full border border-[#e5e7eb] bg-white text-sm font-bold text-[#374151] hover:bg-[#f9fafb] focus:outline-none shadow-sm cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6b7280] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3x2 PROGRAM CARDS GRID */}
      {filteredPrograms.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#e5e7eb] shadow-sm p-12 text-center max-w-xl mx-auto">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-800 text-lg mb-1">No Programs Found</h3>
          <p className="text-gray-500 text-sm">
            We couldn't find any courses matching your filters. Try clearing your search or switching categories.
          </p>
          {showMyEnrollmentsOnly && (
            <button 
              onClick={() => setShowMyEnrollmentsOnly(false)}
              className="mt-4 px-5 py-2 rounded-xl bg-[#2d5635] text-white text-xs font-bold hover:bg-[#1a4023] transition-colors"
            >
              Browse Available Programs
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map(program => (
            <div 
              key={program.mockId}
              onClick={() => setSelectedProgram(program)}
              className="bg-white rounded-[24px] border border-[#e5e7eb] overflow-hidden flex flex-row h-[190px] hover:border-[#dce4d8] hover:shadow-md transition-all duration-300 cursor-pointer group"
            >
              {/* Card Image (Left - 35%) */}
              <div className="w-[35%] h-full relative overflow-hidden bg-gray-50 border-r border-[#f3f4f6] shrink-0">
                <img 
                  src={program.image} 
                  alt={program.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Status Overlay Badge */}
                {program.enrollmentStatus && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm ${
                      program.enrollmentStatus === "COMPLETED" 
                        ? "bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]" 
                        : "bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]"
                    }`}>
                      {program.enrollmentStatus === "COMPLETED" ? "Done" : "Enrolled"}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Content (Right - 65%) */}
              <div className="w-[65%] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${program.badgeClass}`}>
                      {program.category}
                    </span>
                  </div>
                  
                  <h3 className="font-extrabold text-[#111827] text-base leading-snug group-hover:text-[#2d5635] transition-colors line-clamp-1 mb-1">
                    {program.name}
                  </h3>
                  
                  <p className="text-gray-500 text-xs font-medium line-clamp-2 leading-relaxed">
                    {program.description}
                  </p>
                </div>

                {/* Footer Metrics */}
                <div className="border-t border-[#f3f4f6] pt-3 flex items-center justify-between text-[11px] text-gray-500 font-semibold">
                  <span className="flex items-center gap-1">
                    <BarChart2 className="h-3.5 w-3.5 text-gray-400" />
                    {program.level}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    {program.duration_weeks} Wks
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-gray-400" />
                    {program.enrolled_count} Active
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BOTTOM KEEP LEARNING BANNER */}
      <div className="bg-[#eef3eb] rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between border border-[#dce4d8]">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="h-12 w-12 bg-[#2d5635] rounded-full flex items-center justify-center text-white shrink-0 shadow-sm">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-[#111827] text-[17px]">
              {showMyEnrollmentsOnly ? "Ready for new skills?" : "Keep learning, keep growing!"}
            </h3>
            <p className="text-[14px] text-[#4b5563]">
              {showMyEnrollmentsOnly
                ? "Browse available programs and register for vocational or digital training."
                : "Complete programs and earn certificates to build new business opportunities."
              }
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowMyEnrollmentsOnly(prev => !prev)}
          className="bg-white border border-[#dce4d8] text-[#2d5635] px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#f9faf7] transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm hover:shadow active:scale-95 duration-100"
        >
          {showMyEnrollmentsOnly ? (
            <>Browse Available Programs <ArrowRight className="h-4 w-4" /></>
          ) : (
            <>View My Enrollments <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </div>

      {/* PROGRAM DETAILS MODAL */}
      {selectedProgram && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] border border-gray-100 max-w-2xl w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
            {/* Header Image */}
            <div className="h-64 relative bg-gray-50">
              <img 
                src={selectedProgram.image} 
                alt={selectedProgram.name} 
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setSelectedProgram(null)}
                className="absolute top-4 right-4 h-10 w-10 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-black rounded-full flex items-center justify-center shadow-lg transition-all"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="absolute bottom-4 left-4">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${selectedProgram.badgeClass}`}>
                  {selectedProgram.category}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6">
              <div>
                <span className="text-[10px] font-bold text-[#2d5635] tracking-wider uppercase block mb-1">
                  {selectedProgram.provider}
                </span>
                <h2 className="text-2xl font-black text-gray-900 leading-snug">
                  {selectedProgram.name}
                </h2>
              </div>

              <p className="text-gray-600 text-sm font-medium leading-relaxed">
                {selectedProgram.description}
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-[#fafaf9] rounded-2xl border border-[#f3f4f6]">
                <div className="text-center md:border-r border-gray-200 py-1">
                  <div className="text-xs text-gray-400 font-bold uppercase mb-1">Level</div>
                  <div className="font-extrabold text-sm text-gray-800 flex items-center justify-center gap-1">
                    <BarChart2 className="h-4 w-4 text-gray-400" />
                    {selectedProgram.level}
                  </div>
                </div>
                <div className="text-center md:border-r border-gray-200 py-1">
                  <div className="text-xs text-gray-400 font-bold uppercase mb-1">Duration</div>
                  <div className="font-extrabold text-sm text-gray-800 flex items-center justify-center gap-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    {selectedProgram.duration_weeks} Weeks
                  </div>
                </div>
                <div className="text-center py-1">
                  <div className="text-xs text-gray-400 font-bold uppercase mb-1">Status</div>
                  <div className="font-extrabold text-sm flex items-center justify-center gap-1 text-gray-800">
                    <CheckCircle2 className={`h-4 w-4 ${selectedProgram.enrollmentStatus ? "text-[#10b981]" : "text-gray-300"}`} />
                    {selectedProgram.enrollmentStatus === "COMPLETED" 
                      ? "Completed" 
                      : selectedProgram.enrollmentStatus === "ENROLLED" 
                        ? "In Progress" 
                        : "Not Enrolled"
                    }
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button 
                  onClick={() => setSelectedProgram(null)}
                  className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>

                {/* Case 1: Not enrolled */}
                {!selectedProgram.enrollmentStatus && (
                  <button
                    onClick={() => handleEnroll(selectedProgram)}
                    disabled={loadingId === selectedProgram.mockId}
                    className="px-8 py-3 rounded-xl bg-[#2d5635] text-white text-sm font-bold hover:bg-[#1a4023] transition-colors flex items-center gap-2 disabled:opacity-60 shadow-lg shadow-[#2d5635]/15"
                  >
                    {loadingId === selectedProgram.mockId ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Enrolling...</>
                    ) : (
                      <>Enroll in Course <ArrowRight className="h-4 w-4" /></>
                    )}
                  </button>
                )}

                {/* Case 2: Enrolled (In Progress) and user is a leader */}
                {selectedProgram.enrollmentStatus === "ENROLLED" && (
                  <>
                    {member?.is_leader ? (
                      <button
                        onClick={() => handleMarkComplete(selectedProgram)}
                        disabled={loadingId === selectedProgram.mockId}
                        className="px-8 py-3 rounded-xl bg-[#10b981] text-white text-sm font-bold hover:bg-[#059669] transition-colors flex items-center gap-2 disabled:opacity-60 shadow-lg shadow-emerald-500/15"
                      >
                        {loadingId === selectedProgram.mockId ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Updating...</>
                        ) : (
                          <>Mark as Complete <CheckCircle2 className="h-4 w-4" /></>
                        )}
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-[#2563eb] bg-[#eff6ff] px-4 py-2 rounded-xl border border-[#bfdbfe]">
                        In Progress (Mark complete via SHG Leader)
                      </span>
                    )}
                  </>
                )}

                {/* Case 3: Completed */}
                {selectedProgram.enrollmentStatus === "COMPLETED" && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#059669] bg-[#ecfdf5] px-4 py-2 rounded-xl border border-[#a7f3d0] flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Course Completed!
                    </span>
                    <button
                      onClick={() => alert("Downloading certificate.pdf ...")}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-bold hover:from-amber-600 hover:to-amber-700 transition-colors shadow-lg shadow-amber-500/15"
                    >
                      Download Certificate
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
