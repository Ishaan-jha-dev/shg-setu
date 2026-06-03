import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Users, PiggyBank, CreditCard, BookOpen, Award,
  ClipboardList, TrendingUp, Target, Globe, FileText, BarChart2,
  Home, Leaf, Zap, Heart
} from "lucide-react";

export default async function ImpactPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("members")
    .select("shg_id, is_leader, shgs(name, formation_date, registration_number)")
    .eq("profile_id", user.id)
    .single();

  if (!member) redirect("/join");

  const shg = member.shgs as any;
  const shgId = member.shg_id;

  // ─────────────────────────────────────────
  // Parallel fetch of all impact indicators
  // Inspired by DHIS2 data elements + Sahana Eden beneficiary metrics
  // ─────────────────────────────────────────
  const [
    membersRes,
    savingsRes,
    loansRes,
    meetingsRes,
    skillsRes,
    grantsRes,
    surveyRes,
    marketplaceRes,
  ] = await Promise.all([
    supabase.from("members").select("id, joined_date, is_leader, status").eq("shg_id", shgId),
    supabase.from("savings_accounts").select("balance").eq("shg_id", shgId).is("member_id", null).single(),
    supabase.from("loans").select("id, principal_amount, outstanding_principal, status, disbursement_date"),
    supabase.from("meetings").select("id, meeting_date, status").eq("shg_id", shgId),
    supabase.from("skill_enrollments").select("id, status, enrolled_at").eq("member_id", member.shg_id),
    supabase.from("grant_applications").select("id, status, applied_at").eq("shg_id", shgId),
    supabase.from("survey_submissions").select("id, submitted_at"),
    supabase.from("marketplace_products").select("id, price_per_unit, quantity_available, is_listed").eq("shg_id", shgId),
  ]);

  const members = membersRes.data || [];
  const savingsBalance = Number(savingsRes.data?.balance ?? 0);
  const loans = loansRes.data || [];
  const meetings = meetingsRes.data || [];
  const skills = skillsRes.data || [];
  const grants = grantsRes.data || [];
  const surveys = surveyRes.data || [];
  const products = marketplaceRes.data || [];

  // ─── Computed indicators (DHIS2 style program indicators) ───
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === "ACTIVE").length;
  const leaders = members.filter(m => m.is_leader).length;

  const totalDisbursed = loans.filter(l => l.status === "ACTIVE" || l.status === "CLOSED")
    .reduce((s, l) => s + Number(l.principal_amount), 0);
  const activeLoans = loans.filter(l => l.status === "ACTIVE").length;
  const closedLoans = loans.filter(l => l.status === "CLOSED").length;
  const loanRepaymentRate = (activeLoans + closedLoans) > 0
    ? Math.round((closedLoans / (activeLoans + closedLoans)) * 100) : 0;

  const completedMeetings = meetings.filter(m => m.status === "COMPLETED").length;
  const meetingCompliance = meetings.length > 0
    ? Math.round((completedMeetings / meetings.length) * 100) : 0;

  const approvedGrants = grants.filter(g => g.status === "APPROVED").length;
  const completedSkills = skills.filter(s => s.status === "COMPLETED").length;

  const listedProducts = products.filter(p => p.is_listed);
  const marketplaceGMV = listedProducts.reduce((s, p) =>
    s + (Number(p.price_per_unit) * Number(p.quantity_available)), 0);

  // Formation duration
  const formationDate = shg?.formation_date ? new Date(shg.formation_date) : null;
  const ageInMonths = formationDate
    ? Math.floor((Date.now() - formationDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 0;

  // Vulnerability Index score (Sahana Eden: outcome scoring)
  const viScore = Math.min(100, Math.round(
    (activeMembers / Math.max(totalMembers, 1)) * 25 +
    (meetingCompliance / 100) * 25 +
    (savingsBalance > 0 ? 25 : 0) +
    (loanRepaymentRate / 100) * 25
  ));

  const viLabel = viScore >= 75 ? "Grade A — Excellent" : viScore >= 50 ? "Grade B — Good" : viScore >= 25 ? "Grade C — Average" : "Grade D — Needs Support";
  const viColor = viScore >= 75 ? "emerald" : viScore >= 50 ? "blue" : viScore >= 25 ? "amber" : "red";

  return (
    <div className="min-h-screen bg-[#fcf9f2] pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#306e46] to-[#1e4d32] text-white py-8 px-6 md:px-12 rounded-b-[2rem] shadow-lg">
        <div className="max-w-5xl mx-auto">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-emerald-100 hover:text-white mb-4 text-sm font-semibold transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1">DHIS2-Style Impact Dashboard</p>
              <h1 className="text-3xl font-extrabold tracking-tight">{shg?.name}</h1>
              <p className="text-emerald-100 text-sm mt-1">
                {shg?.registration_number && <span className="mr-3">Reg: {shg.registration_number}</span>}
                {formationDate && <span>Active for {ageInMonths} months</span>}
              </p>
            </div>

            {/* SHG Health Grade (Sahana Eden: Vulnerability Index) */}
            <div className={`bg-white/10 border border-white/20 rounded-3xl px-8 py-5 text-center backdrop-blur-sm`}>
              <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1">SHG Health Score</p>
              <p className={`text-5xl font-extrabold`}>{viScore}</p>
              <p className="text-sm font-bold text-white/80 mt-1">{viLabel}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 mt-8 space-y-8">

        {/* ── Tier 1: Core Beneficiary Indicators (DHIS2 Data Elements) ── */}
        <section>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Users className="h-4 w-4" /> Beneficiary Reach & Membership
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Members", value: totalMembers, icon: Users, color: "from-blue-500 to-indigo-600", sub: `${activeMembers} active` },
              { label: "Group Leaders", value: leaders, icon: Target, color: "from-emerald-500 to-teal-600", sub: "Trained leaders" },
              { label: "Active Since", value: `${ageInMonths}mo`, icon: Leaf, color: "from-green-500 to-emerald-600", sub: formationDate ? formationDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "–" },
              { label: "Meeting Rate", value: `${meetingCompliance}%`, icon: BarChart2, color: "from-violet-500 to-purple-600", sub: `${completedMeetings} of ${meetings.length}` },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                  <kpi.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900">{kpi.value}</p>
                  <p className="text-xs font-bold text-gray-500 mt-0.5">{kpi.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{kpi.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tier 2: Financial Inclusion Indicators ── */}
        <section>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <PiggyBank className="h-4 w-4" /> Financial Inclusion Metrics
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Group Savings Pool", value: `₹${(savingsBalance / 1000).toFixed(1)}K`, icon: PiggyBank, color: "from-emerald-500 to-teal-600", sub: "Cumulative deposits" },
              { label: "Loans Disbursed", value: `₹${(totalDisbursed / 1000).toFixed(1)}K`, icon: CreditCard, color: "from-blue-500 to-indigo-600", sub: `${activeLoans} active loans` },
              { label: "Loan Closure Rate", value: `${loanRepaymentRate}%`, icon: TrendingUp, color: "from-amber-500 to-orange-500", sub: `${closedLoans} fully repaid` },
              { label: "Marketplace GMV", value: `₹${(marketplaceGMV / 1000).toFixed(1)}K`, icon: Globe, color: "from-cyan-500 to-blue-600", sub: `${listedProducts.length} products listed` },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                  <kpi.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900">{kpi.value}</p>
                  <p className="text-xs font-bold text-gray-500 mt-0.5">{kpi.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{kpi.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tier 3: Capacity Building & Govt Linkage (Sahana Eden: Outcomes) ── */}
        <section>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Heart className="h-4 w-4" /> Capacity Building & Govt Linkage
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Skills Enrolled", value: skills.length, icon: BookOpen, color: "from-violet-500 to-purple-600", sub: `${completedSkills} completed` },
              { label: "Govt Schemes Applied", value: grants.length, icon: Award, color: "from-rose-500 to-pink-600", sub: `${approvedGrants} approved` },
              { label: "Field Surveys Done", value: surveys.length, icon: ClipboardList, color: "from-teal-500 to-emerald-600", sub: "Household data collected" },
              { label: "Group Meetings", value: meetings.length, icon: Zap, color: "from-amber-500 to-yellow-500", sub: `${completedMeetings} completed` },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                  <kpi.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900">{kpi.value}</p>
                  <p className="text-xs font-bold text-gray-500 mt-0.5">{kpi.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{kpi.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SHG Health Score Breakdown (DHIS2: Indicator formula breakdown) ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Health Score Breakdown</h2>
            <div className="space-y-4">
              {[
                { label: "Membership Activity Rate", value: Math.round((activeMembers / Math.max(totalMembers, 1)) * 100), max: 25 },
                { label: "Meeting Compliance Rate", value: meetingCompliance, max: 25 },
                { label: "Savings Mobilization", value: savingsBalance > 0 ? 100 : 0, max: 25 },
                { label: "Loan Repayment Rate", value: loanRepaymentRate, max: 25 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-gray-600 font-semibold">{item.label}</span>
                    <span className="text-gray-900 font-bold">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${item.value >= 75 ? "bg-emerald-500" : item.value >= 50 ? "bg-blue-500" : item.value >= 25 ? "bg-amber-500" : "bg-red-400"}`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Government Reporting Export (DHIS2: Reporting) ── */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">NRLM / Govt Reporting</h2>
            <p className="text-xs text-gray-400 mb-5">Ready-to-submit data as per NRLM/DAY-NRLM standards</p>

            <div className="space-y-3">
              {[
                {
                  label: "SHG Basic Information",
                  items: [`Name: ${shg?.name}`, `Members: ${totalMembers}`, `Age: ${ageInMonths} months`, `Registration: ${shg?.registration_number ?? "Pending"}`],
                  status: "Ready",
                },
                {
                  label: "Financial Performance",
                  items: [`Savings: ₹${savingsBalance.toLocaleString("en-IN")}`, `Loans Disbursed: ₹${totalDisbursed.toLocaleString("en-IN")}`, `Repayment Rate: ${loanRepaymentRate}%`],
                  status: "Ready",
                },
                {
                  label: "Meeting & Governance",
                  items: [`Total Meetings: ${meetings.length}`, `Compliance: ${meetingCompliance}%`, `Leaders: ${leaders}`],
                  status: meetings.length > 0 ? "Ready" : "Incomplete",
                },
                {
                  label: "Govt Scheme Linkage",
                  items: [`Schemes Applied: ${grants.length}`, `Approved: ${approvedGrants}`, `Skills Enrolled: ${skills.length}`],
                  status: grants.length > 0 ? "Ready" : "Incomplete",
                },
              ].map((section) => (
                <div key={section.label} className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-2xl">
                  <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 ${section.status === "Ready" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {section.status === "Ready" ? "✓" : "!"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 mb-1">{section.label}</p>
                    <p className="text-[10px] text-gray-500 leading-relaxed">{section.items.join(" · ")}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3.5 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-700 font-semibold text-center">
              📋 All data auto-syncs with Supabase. Share this dashboard URL with your Block/District NRLM officer.
            </div>
          </div>
        </section>

        {/* ── UN SDG Alignment (Sahana Eden: Impact Framework) ── */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">UN SDG Alignment</h2>
          <p className="text-xs text-gray-400 mb-5">How your SHG contributes to Sustainable Development Goals</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { sdg: "SDG 1", title: "No Poverty", desc: "Savings & loan access for BPL families", color: "bg-red-50 border-red-200 text-red-700", active: savingsBalance > 0 || totalDisbursed > 0 },
              { sdg: "SDG 5", title: "Gender Equality", desc: "Women-led SHG empowerment & leadership", color: "bg-orange-50 border-orange-200 text-orange-700", active: totalMembers > 0 },
              { sdg: "SDG 8", title: "Decent Work", desc: "Skills training & marketplace livelihood", color: "bg-purple-50 border-purple-200 text-purple-700", active: skills.length > 0 || products.length > 0 },
              { sdg: "SDG 10", title: "Reduced Inequality", desc: "Financial inclusion for rural households", color: "bg-pink-50 border-pink-200 text-pink-700", active: grants.length > 0 || totalDisbursed > 0 },
            ].map((goal) => (
              <div key={goal.sdg} className={`rounded-2xl p-4 border text-center relative ${goal.color} ${!goal.active ? "opacity-40" : ""}`}>
                {goal.active && (
                  <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
                    <span className="text-white text-[8px] font-black">✓</span>
                  </div>
                )}
                <p className="text-xs font-black mb-1">{goal.sdg}</p>
                <p className="text-sm font-bold mb-1">{goal.title}</p>
                <p className="text-[10px] leading-snug">{goal.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
