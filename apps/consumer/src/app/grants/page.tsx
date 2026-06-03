import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { 
  Building2, Users, MapPin, Search, ChevronRight, CheckCircle2, 
  AlertCircle, Building, FileText, ArrowRight, ShieldCheck, Activity,
  Leaf, Filter, Bookmark, Send, Clock, PlayCircle
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

  // Mock Profile if not fully populated in DB (for demo purposes)
  const shgProfile = {
    name: shg?.name || "Ishaan SHG",
    membersCount: shg?.total_members || 20,
    state: "Uttar Pradesh",
    primaryActivity: "Dairy Farming",
    type: "Rural"
  };

  // Hardcoded highly detailed schemes to match the mockup exactly
  const matchedSchemes = [
    {
      id: "1",
      name: "ATMA Skill & Training Grant",
      provider: "AGRICULTURAL TECHNOLOGY MANAGEMENT AGENCY (ATMA)",
      max_amount: 30000,
      tags: ["All India", "Farmer Groups", "Rural Women"],
      matchScore: 98,
      eligibility_checks: [
        "Farmer group/SHG registered",
        "Rural women members",
        "Activity matches scheme focus"
      ],
      required_documents: [
        "Group Registration",
        "Proposed Training Plan",
        "List of Members",
        "Bank Passbook Copy"
      ],
      extra_docs: 2,
      application_process: "Submit to Block Technology Manager (BTM) → Review → Approval",
    },
    {
      id: "2",
      name: "NABARD Dairy Entrepreneurship Scheme",
      provider: "NABARD",
      max_amount: 700000,
      tags: ["All India", "Dairy Farmers", "SHGs"],
      matchScore: 90,
      eligibility_checks: [
        "SHG with dairy activity",
        "Minimum 10 women members",
        "Valid SHG for 1+ years"
      ],
      required_documents: [
        "Detailed Project Report (DPR)",
        "Land Records",
        "SHG Resolution",
        "Bank Statement"
      ],
      extra_docs: 3,
      application_process: "Online Application → Verification → Sanction",
    },
    {
      id: "3",
      name: "Livelihood Promotion Grant",
      provider: "DAY-NRLM",
      max_amount: 300000,
      tags: ["All India", "SHGs", "Women"],
      matchScore: 85,
      eligibility_checks: [
        "Graded SHG",
        "Regular savings record",
        "Active micro-credit plan"
      ],
      required_documents: [
        "Micro-Credit Plan",
        "Grading Report",
        "Resolution Copy"
      ],
      extra_docs: 1,
      application_process: "Submit to Village Org → CLF Review → Disbursement",
    }
  ];

  return (
    <div className="min-h-screen bg-[#faf9f5] lg:pl-[260px] pb-24 font-sans text-[#1c1c1c]">
      <Header />

      <main className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* HERO SECTION */}
        <div className="relative mb-8 pt-4 pb-12 flex justify-between items-start">
          <div className="z-10 mt-4">
            <h1 className="text-[40px] font-extrabold text-[#1a4023] tracking-tight mb-3 flex items-center gap-3">
              Grant Discovery Engine 
              <Leaf className="h-6 w-6 text-[#72a170] fill-current" />
            </h1>
            <p className="text-[#4b5563] text-[17px] font-medium">
              Find government grants and funding opportunities best suited for your SHG.
            </p>
          </div>
          <div className="hidden md:block absolute top-0 right-0 h-40 w-[600px] opacity-90 pointer-events-none">
             <img src="/grant_hero_bg.png" alt="Government Building" className="w-full h-full object-contain object-right" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Eligibility Profile */}
            <div className="bg-[#f9faf7] rounded-3xl border border-[#e6e8e3] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 bg-[#eef3eb] text-[#2d5635] rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <h2 className="font-bold text-[#1a4023] text-lg">Your Eligibility Profile</h2>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[#6b7280]">
                    <Building2 className="h-4 w-4" /> <span className="text-[15px]">SHG Name</span>
                  </div>
                  <div className="text-[15px] font-bold text-[#111827]">{shgProfile.name}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[#6b7280]">
                    <Users className="h-4 w-4" /> <span className="text-[15px]">Members</span>
                  </div>
                  <div className="text-[15px] font-bold text-[#111827]">{shgProfile.membersCount} Women</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[#6b7280]">
                    <MapPin className="h-4 w-4" /> <span className="text-[15px]">State</span>
                  </div>
                  <div className="text-[15px] font-bold text-[#111827]">{shgProfile.state}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[#6b7280]">
                    <Activity className="h-4 w-4" /> <span className="text-[15px]">Primary Activity</span>
                  </div>
                  <div className="text-[15px] font-bold text-[#111827]">{shgProfile.primaryActivity}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[#6b7280]">
                    <ShieldCheck className="h-4 w-4" /> <span className="text-[15px]">SHG Type</span>
                  </div>
                  <div className="text-[15px] font-bold text-[#111827]">{shgProfile.type}</div>
                </div>
              </div>

              <button className="w-full mt-8 py-3 rounded-xl border-2 border-[#dce4d8] text-[#2d5635] font-bold hover:bg-[#eef3eb] transition-colors text-[15px]">
                Update Profile
              </button>
            </div>

            {/* Application Pipeline */}
            <div className="bg-[#f9faf7] rounded-3xl border border-[#e6e8e3] p-6 shadow-sm">
              <h2 className="font-bold text-[#1a4023] text-lg mb-6">Application Pipeline</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#f3f4f6]">
                  <div className="flex items-center gap-4">
                    <FileText className="h-5 w-5 text-[#6b7280]" />
                    <span className="text-[15px] font-semibold text-[#374151]">Drafting</span>
                  </div>
                  <span className="h-7 w-7 rounded-full bg-[#f3f4f6] text-[#374151] flex items-center justify-center text-sm font-bold">1</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#f3f4f6]">
                  <div className="flex items-center gap-4">
                    <Clock className="h-5 w-5 text-[#f28c28]" />
                    <span className="text-[15px] font-semibold text-[#374151]">Under Review</span>
                  </div>
                  <span className="h-7 w-7 rounded-full bg-[#fff7ed] text-[#f28c28] flex items-center justify-center text-sm font-bold">0</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#f3f4f6]">
                  <div className="flex items-center gap-4">
                    <Send className="h-5 w-5 text-[#3b82f6]" />
                    <span className="text-[15px] font-semibold text-[#374151]">Submitted</span>
                  </div>
                  <span className="h-7 w-7 rounded-full bg-[#eff6ff] text-[#3b82f6] flex items-center justify-center text-sm font-bold">0</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#f3f4f6]">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="h-5 w-5 text-[#10b981]" />
                    <span className="text-[15px] font-semibold text-[#374151]">Approved</span>
                  </div>
                  <span className="h-7 w-7 rounded-full bg-[#ecfdf5] text-[#10b981] flex items-center justify-center text-sm font-bold">0</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button className="text-[#2d5635] text-sm font-bold hover:underline inline-flex items-center gap-1">
                  View All Applications <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-8">
            
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white border border-[#e5e7eb] rounded-full flex items-center justify-center">
                  <PlayCircle className="h-5 w-5 text-[#2d5635]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#111827]">
                    Matched Grants ({matchedSchemes.length})
                  </h2>
                  <p className="text-sm text-[#6b7280]">AI powered matching based on your profile</p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#9ca3af]" />
                  <input 
                    type="text" 
                    placeholder="Search schemes, keywords..." 
                    className="w-full pl-11 pr-4 py-3 rounded-full border border-[#e5e7eb] text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5635] focus:border-transparent bg-white"
                  />
                </div>
                <button className="px-5 py-3 rounded-full border border-[#e5e7eb] bg-white text-sm font-bold text-[#374151] hover:bg-[#f9fafb] flex items-center gap-2 shrink-0">
                  <Filter className="h-4 w-4" /> Filters
                </button>
              </div>
            </div>

            {/* Grant Cards */}
            <div className="space-y-6">
              {matchedSchemes.map((scheme) => (
                <div key={scheme.id} className="bg-white rounded-3xl border border-[#e5e7eb] p-8 shadow-[0_2px_8px_rgba(0,0,0,0.02)] relative group hover:border-[#dce4d8] transition-colors">
                  
                  {/* Top: Header, Tags, Match Score */}
                  <div className="flex items-start justify-between mb-8">
                    <div className="pr-20">
                      <div className="text-[11px] font-bold text-[#2d5635] uppercase tracking-wider mb-2">
                        {scheme.provider}
                      </div>
                      <h3 className="text-2xl font-bold text-[#111827] mb-4">
                        {scheme.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        {scheme.tags.map(tag => (
                          <span key={tag} className="px-3 py-1.5 rounded-lg bg-[#f3f4f6] text-[#4b5563] text-[13px] font-semibold">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Circular Match Gauge & Bookmark */}
                    <div className="flex flex-col items-center gap-4">
                      <button className="text-[#9ca3af] hover:text-[#111827]">
                        <Bookmark className="h-5 w-5" />
                      </button>
                      <div className="relative h-[72px] w-[72px] flex items-center justify-center">
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                          <circle cx="36" cy="36" r="32" className="stroke-[#f3f4f6]" strokeWidth="6" fill="none" />
                          <circle 
                            cx="36" cy="36" r="32" 
                            className="stroke-[#2d5635]" 
                            strokeWidth="6" 
                            fill="none" 
                            strokeDasharray="201" 
                            strokeDashoffset={201 - (201 * scheme.matchScore) / 100}
                            strokeLinecap="round" 
                          />
                        </svg>
                        <div className="text-center">
                          <div className="text-[19px] font-extrabold text-[#111827] leading-none">{scheme.matchScore}%</div>
                          <div className="text-[10px] font-bold text-[#6b7280]">Match</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle: 3 Columns Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-[#fafaf9] rounded-2xl border border-[#f3f4f6]">
                    
                    {/* Amount */}
                    <div className="md:border-r border-[#e5e7eb] pr-4">
                      <div className="text-[13px] font-bold text-[#6b7280] mb-2">Up to</div>
                      <div className="text-3xl font-extrabold text-[#2d5635] mb-1">
                        ₹{(scheme.max_amount/100000).toFixed(1)} Lakhs
                      </div>
                      <div className="text-[13px] text-[#6b7280]">Grant Amount</div>
                    </div>

                    {/* Eligibility */}
                    <div className="md:border-r border-[#e5e7eb] pr-4 md:pl-4">
                      <div className="text-[13px] font-bold text-[#111827] mb-4">Why you're eligible</div>
                      <div className="space-y-3">
                        {scheme.eligibility_checks.map((check, idx) => (
                          <div key={idx} className="flex items-start gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-[#10b981] shrink-0 mt-0.5" />
                            <span className="text-[13px] font-medium text-[#4b5563] leading-tight">{check}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Documents */}
                    <div className="md:pl-4">
                      <div className="text-[13px] font-bold text-[#111827] mb-4">Required Documents</div>
                      <div className="space-y-3">
                        {scheme.required_documents.map((doc, idx) => (
                          <div key={idx} className="flex items-start gap-2.5">
                            <FileText className="h-4 w-4 text-[#9ca3af] shrink-0 mt-0.5" />
                            <span className="text-[13px] font-medium text-[#4b5563] leading-tight">{doc}</span>
                          </div>
                        ))}
                        {scheme.extra_docs > 0 && (
                          <div className="text-[12px] font-semibold text-[#6b7280] pl-6 pt-1">
                            + {scheme.extra_docs} more
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Bottom Footer */}
                  <div className="flex flex-col md:flex-row items-center justify-between pt-2">
                    <div className="text-[13px] text-[#6b7280] font-medium mb-4 md:mb-0">
                      <span className="font-bold text-[#4b5563]">Application Process:</span> {scheme.application_process}
                    </div>
                    <button className="bg-[#2d5635] text-white px-7 py-2.5 rounded-xl text-sm font-bold hover:bg-[#1a4023] transition-colors whitespace-nowrap">
                      View Details
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {/* Bottom Banner */}
            <div className="mt-8 bg-[#eef3eb] rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between border border-[#dce4d8]">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className="h-12 w-12 bg-[#2d5635] rounded-full flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Leaf className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[#111827] text-[17px]">Don't see the right grant?</h3>
                  <p className="text-[15px] text-[#4b5563]">Update your profile or explore all schemes to find more opportunities.</p>
                </div>
              </div>
              <button className="bg-white border border-[#dce4d8] text-[#2d5635] px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#f9faf7] transition-colors flex items-center gap-2 whitespace-nowrap">
                Explore All Schemes <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
