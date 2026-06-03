import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { 
  Building2, Users, MapPin, Search, ChevronRight, CheckCircle2, 
  AlertCircle, Building, FileText, ArrowRight, ShieldCheck, Activity
} from "lucide-react";

export default async function GrantDiscoveryEngine() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch Member and SHG Profile to act as the "Matching Profile"
  const { data: member } = await supabase
    .from("members")
    .select("*, shgs(*)")
    .eq("profile_id", user.id)
    .single();

  const shg = member?.shgs as any;
  const isLeader = member?.is_leader;

  // Mock Profile if not fully populated in DB (for demo purposes)
  const shgProfile = {
    name: shg?.name || "Ishaan SHG",
    membersCount: shg?.total_members || 20,
    state: "Uttar Pradesh",
    primaryActivity: "Dairy",
    grade: "A",
    ageInMonths: 24
  };

  // Fetch Schemes from DB, fallback to empty array if migration hasn't run
  const { data: schemes, error } = await supabase
    .from("grant_schemes")
    .select("*")
    .order("created_at", { ascending: false });

  // Fallback data in case Docker/Supabase is down and migration didn't run
  const activeSchemes = (schemes && schemes.length > 0) ? schemes : [
    {
      id: "1",
      name: "NABARD Dairy Entrepreneurship Scheme",
      provider: "NABARD",
      max_amount: 700000,
      category: "AGRICULTURE",
      state: "All India",
      target_beneficiary: "Dairy Farmers, SHGs",
      required_documents: ["Detailed Project Report (DPR)", "Land Records", "Aadhaar Card", "Bank Passbook"],
      application_process: "Apply via Bank -> NABARD for subsidy",
      last_updated: "2023-10-01"
    },
    {
      id: "2",
      name: "UP ODOP Margin Money Subsidy",
      provider: "Govt of Uttar Pradesh",
      max_amount: 2000000,
      category: "BUSINESS",
      state: "Uttar Pradesh",
      target_beneficiary: "Micro Entrepreneurs, SHGs in UP",
      required_documents: ["Detailed Project Report", "UP Domicile Certificate", "Aadhaar Card"],
      application_process: "Apply online on ODOP portal -> Bank loan",
      last_updated: "2024-01-15"
    },
    {
      id: "3",
      name: "DAY-NRLM Community Investment Fund",
      provider: "Ministry of Rural Development",
      max_amount: 300000,
      category: "BUSINESS",
      state: "All India",
      target_beneficiary: "Women SHGs graded A/B",
      required_documents: ["SHG Resolution Copy", "Grading Report", "Micro-Credit Plan (MCP)"],
      application_process: "Submit MCP to Village Organization (VO)",
      last_updated: "2023-08-20"
    },
    {
      id: "4",
      name: "ATMA Skill & Training Grant",
      provider: "Agricultural Tech Management Agency",
      max_amount: 25000,
      category: "AGRICULTURE",
      state: "All India",
      target_beneficiary: "Farmer Groups, Rural Women",
      required_documents: ["Group Registration", "List of Members", "Proposed Training Plan"],
      application_process: "Submit to Block Technology Manager (BTM)",
      last_updated: "2024-02-10"
    }
  ];

  // Deterministic Matching Engine Logic
  const getMatchScore = (scheme: any) => {
    let score = 50; // Base score

    // State matching
    if (scheme.state === "All India") score += 20;
    if (scheme.state === shgProfile.state) score += 30;

    // Category / Activity matching
    if (scheme.category === "AGRICULTURE" && shgProfile.primaryActivity === "Dairy") score += 20;
    if (scheme.category === "BUSINESS") score += 10;

    // Beneficiary matching
    if (scheme.target_beneficiary?.includes("Women")) score += 10;
    
    return Math.min(score, 98); // Cap at 98%
  };

  const matchedSchemes = activeSchemes.map(s => ({
    ...s,
    matchScore: getMatchScore(s)
  })).sort((a, b) => b.matchScore - a.matchScore);

  return (
    <div className="min-h-screen bg-[#fafaf9] lg:pl-[260px] pb-24">
      <Header />

      <main className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight mb-2">Grant Discovery Engine</h1>
          <p className="text-[#6b7280]">Intelligent matching based on your SHG's profile and eligibility.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Matching Engine & Profile */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* SHG Profile Card */}
            <div className="bg-white rounded-3xl border border-[#e5e7eb] p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#f28c28]"></div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-[#fff7ed] text-[#f28c28] rounded-xl flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-[#111827] leading-tight">Eligibility Profile</h2>
                  <div className="text-[10px] uppercase tracking-wider text-[#6b7280] font-bold">Auto-extracted from records</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#4b5563]">
                    <Building2 className="h-4 w-4" /> <span className="text-sm">Group</span>
                  </div>
                  <div className="text-sm font-bold text-[#111827]">{shgProfile.name}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#4b5563]">
                    <Users className="h-4 w-4" /> <span className="text-sm">Demography</span>
                  </div>
                  <div className="text-sm font-bold text-[#111827]">{shgProfile.membersCount} Women</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#4b5563]">
                    <MapPin className="h-4 w-4" /> <span className="text-sm">State</span>
                  </div>
                  <div className="text-sm font-bold text-[#111827]">{shgProfile.state}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#4b5563]">
                    <Activity className="h-4 w-4" /> <span className="text-sm">Activity</span>
                  </div>
                  <div className="text-sm font-bold text-[#111827]">{shgProfile.primaryActivity}</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[#f3f4f6]">
                <button className="w-full py-2.5 rounded-xl border border-[#d1d5db] text-sm font-semibold text-[#374151] hover:bg-[#f9fafb] transition-colors">
                  Update Profile Data
                </button>
              </div>
            </div>

            {/* Submission Tracking Summary */}
            <div className="bg-white rounded-3xl border border-[#e5e7eb] p-6 shadow-sm">
              <h2 className="font-bold text-[#111827] mb-5">Application Pipeline</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#f9fafb] border border-[#f3f4f6]">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FileText className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-[#374151]">Drafting</span>
                  </div>
                  <span className="text-sm font-bold text-[#111827]">1</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#f9fafb] border border-[#f3f4f6]">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-[#374151]">Under Review</span>
                  </div>
                  <span className="text-sm font-bold text-[#111827]">0</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#f9fafb] border border-[#f3f4f6]">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-[#374151]">Approved</span>
                  </div>
                  <span className="text-sm font-bold text-[#111827]">0</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: Matched Grants Feed */}
          <div className="lg:col-span-8">
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Matched Grants ({matchedSchemes.length})
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
                <input 
                  type="text" 
                  placeholder="Search schemes..." 
                  className="pl-9 pr-4 py-2 rounded-full border border-[#d1d5db] text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5635] focus:border-transparent w-64"
                />
              </div>
            </div>

            <div className="space-y-4">
              {matchedSchemes.map((scheme) => (
                <div key={scheme.id} className="bg-white rounded-3xl border border-[#e5e7eb] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  
                  {/* Match Score Badge */}
                  <div className="absolute top-6 right-6">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                      scheme.matchScore >= 80 ? 'bg-[#ecfdf5] text-emerald-700 border border-emerald-200' :
                      scheme.matchScore >= 60 ? 'bg-[#fff7ed] text-orange-700 border border-orange-200' :
                      'bg-[#f3f4f6] text-gray-700 border border-gray-200'
                    }`}>
                      <Activity className="h-3.5 w-3.5" />
                      {scheme.matchScore}% Match
                    </div>
                  </div>

                  <div className="pr-24">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#6b7280] uppercase tracking-wider mb-2">
                      <Building className="h-3.5 w-3.5" /> {scheme.provider}
                    </div>
                    <h3 className="text-xl font-bold text-[#111827] mb-2 group-hover:text-[#2d5635] transition-colors">
                      {scheme.name}
                    </h3>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#f3f4f6] text-xs font-semibold text-[#4b5563] mb-4">
                      {scheme.state} • {scheme.target_beneficiary}
                    </div>
                    
                    {scheme.max_amount ? (
                      <div className="text-sm mb-4">
                        <span className="text-[#6b7280]">Up to</span> <span className="font-extrabold text-[#2d5635] text-lg">₹{(Number(scheme.max_amount)/100000).toFixed(1)} Lakhs</span>
                      </div>
                    ) : (
                      <div className="text-sm mb-4 font-bold text-[#2d5635]">Non-Financial Support / Subsidized</div>
                    )}

                    <div className="bg-[#fafaf9] rounded-xl p-4 border border-[#e5e7eb] mb-5">
                      <div className="text-xs font-bold text-[#111827] mb-2 uppercase tracking-wide">Required Documents Checklist</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {scheme.required_documents?.map((doc: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#d1d5db] shrink-0 mt-0.5" />
                            <span className="text-sm text-[#4b5563] leading-tight">{doc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#f3f4f6]">
                      <div className="text-xs text-[#9ca3af]">
                        Process: {scheme.application_process?.substring(0, 50)}...
                      </div>
                      <button className="bg-[#2d5635] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#1a4023] transition-colors flex items-center gap-2">
                        Start Application <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
