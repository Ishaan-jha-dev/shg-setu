import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import {
  PiggyBank, CreditCard, TrendingUp, BookOpen, Globe, Users, Calendar,
  ArrowRight, LogOut, ChevronRight, Bell, Wallet, Award, Shield, ClipboardList, Scale, BarChart2
} from "lucide-react";
import Header from "@/components/Header";

const memberItems = [
  {
    href: "/savings",
    icon: PiggyBank,
    label: "My Savings",
    desc: "Personal deposits and passbook",
    color: "from-emerald-500 to-teal-600",
    badge: null,
  },
  {
    href: "/loans",
    icon: CreditCard,
    label: "My Loans",
    desc: "Apply and track personal loans",
    color: "from-blue-500 to-indigo-600",
    badge: null,
  },
  {
    href: "/skills",
    icon: BookOpen,
    label: "Skill Development",
    desc: "Free vocational training programs",
    color: "from-violet-500 to-purple-600",
    badge: "FREE",
  },
  {
    href: "/global",
    icon: Globe,
    label: "Global Marketplace",
    desc: "View and buy SHG products",
    color: "from-cyan-500 to-blue-600",
    badge: null,
  },
  {
    href: "/surveys",
    icon: ClipboardList,
    label: "Field Surveys",
    desc: "Offline data collection forms",
    color: "from-emerald-600 to-teal-700",
    badge: "ODK",
  },
];

const leaderItems = [
  {
    href: "/meetings",
    icon: Calendar,
    label: "Meetings & Collections",
    desc: "Schedule meetings & collect dues",
    color: "from-amber-500 to-orange-500",
    badge: "ADMIN",
  },
  {
    href: "/members",
    icon: Users,
    label: "Manage Members",
    desc: "Activate or promote members",
    color: "from-pink-500 to-rose-600",
    badge: "ADMIN",
  },
  {
    href: "/grants",
    icon: Award,
    label: "Grants & Schemes",
    desc: "Apply for Gov/NGO grants",
    color: "from-rose-500 to-pink-600",
    badge: "NEW",
  },
  {
    href: "/reports",
    icon: Scale,
    label: "Accounting Reports",
    desc: "Balance sheet & GL ledgers",
    color: "from-amber-600 to-orange-700",
    badge: "ERP",
  },
  {
    href: "/impact",
    icon: BarChart2,
    label: "Impact Dashboard",
    desc: "NRLM reports & SHG health",
    color: "from-[#306e46] to-emerald-700",
    badge: "DHIS2",
  },
];



export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .single();

  const { data: member } = await supabase
    .from("members")
    .select("*, shgs(*)")
    .eq("profile_id", user.id)
    .single();

  const shg = member?.shgs as any;
  const isJoined = !!member;
  const firstName = profile?.full_name?.split(" ")[0] ?? "Member";

  // Demo Mode Override
  const cookieStore = await cookies();
  const demoRole = cookieStore.get("demo_role")?.value;
  let isLeader = member?.is_leader;
  if (demoRole === "leader") isLeader = true;
  if (demoRole === "member") isLeader = false;

  let savingsBalance = 0;
  let activeLoansCount = 0;
  let totalOutstanding = 0;
  let enrolledSkills = 0;
  let pendingGrants = 0;
  let upcomingMeetings = 0;
  let nextMeetingDate: string | null = null;
  let myLoanOutstanding = 0;

  if (member?.shg_id) {
    const [savAcc, loans, skills, grants, meetings, myLoans] = await Promise.all([
      supabase.from("savings_accounts").select("balance").eq("shg_id", member.shg_id).is("member_id", null).single(),
      supabase.from("loans").select("id, outstanding_principal, status").eq("shg_id", member.shg_id).eq("status", "ACTIVE"),
      supabase.from("skill_enrollments").select("id").eq("member_id", member.id),
      supabase.from("grant_applications").select("id").eq("shg_id", member.shg_id).in("status", ["APPLIED", "UNDER_REVIEW"]),
      supabase.from("meetings").select("id, meeting_date").eq("shg_id", member.shg_id).eq("status", "SCHEDULED").gte("meeting_date", new Date().toISOString()).order("meeting_date").limit(1),
      supabase.from("loans").select("outstanding_principal").eq("member_id", member.id).eq("status", "ACTIVE"),
    ]);

    savingsBalance = Number(savAcc.data?.balance ?? 0);
    activeLoansCount = loans.data?.length ?? 0;
    totalOutstanding = (loans.data ?? []).reduce((s, l) => s + Number(l.outstanding_principal), 0);
    enrolledSkills = skills.data?.length ?? 0;
    pendingGrants = grants.data?.length ?? 0;
    upcomingMeetings = meetings.data?.length ?? 0;
    nextMeetingDate = meetings.data?.[0]?.meeting_date ?? null;
    myLoanOutstanding = (myLoans.data ?? []).reduce((s: number, l: any) => s + Number(l.outstanding_principal), 0);
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-8">

        {/* Welcome + SHG Info */}
        {!isJoined ? (
          /* Onboarding Banner */
          <div className="mb-8 bg-gradient-to-br from-[#306e46] to-[#255737] rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute right-6 bottom-0 opacity-10">
              <Shield className="h-40 w-40" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Namaste, {firstName}! 🙏</h1>
            <p className="text-green-100 mb-6 max-w-lg">
              You haven't joined or created an SHG yet. Register your group to start managing savings, applying for loans, and accessing government schemes.
            </p>
            <Link
              href="/join"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#f28c28] text-white font-bold hover:bg-[#d97a20] transition-colors shadow-lg"
            >
              Register Your SHG <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* Welcome Banner */}
            <div className="mb-8 bg-gradient-to-br from-[#1a2332] to-[#243040] rounded-3xl p-7 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-5">
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 relative">
                <div>
                  <p className="text-white/50 text-sm mb-1">Namaste,</p>
                  <h1 className="text-3xl font-bold mb-1">{firstName} 🙏</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-white/70 text-sm">{shg?.name}</span>
                    {isLeader && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#f28c28]/20 text-[#f28c28] border border-[#f28c28]/20">
                        Leader
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-shrink-0">
                  <div className="bg-white/10 rounded-2xl px-4 py-3 text-center backdrop-blur-sm">
                    <div className="text-2xl font-bold">₹{(savingsBalance / 1000).toFixed(1)}K</div>
                    <div className="text-white/50 text-xs">Group Savings</div>
                  </div>
                  <div className="bg-white/10 rounded-2xl px-4 py-3 text-center backdrop-blur-sm">
                    <div className="text-2xl font-bold">{activeLoansCount}</div>
                    <div className="text-white/50 text-xs">Active Loans</div>
                  </div>
                  <div className="bg-white/10 rounded-2xl px-4 py-3 text-center backdrop-blur-sm">
                    <div className="text-2xl font-bold">{myLoanOutstanding > 0 ? `₹${(myLoanOutstanding/1000).toFixed(1)}K` : "—"}</div>
                    <div className="text-white/50 text-xs">My Outstanding</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Savings Balance", value: `₹${savingsBalance.toLocaleString("en-IN")}`, href: "/savings", color: "emerald" },
                { label: "Loan Outstanding", value: `₹${totalOutstanding.toLocaleString("en-IN")}`, href: "/loans", color: "blue" },
                { label: "Skills Enrolled", value: enrolledSkills.toString(), href: "/skills", color: "purple" },
                { label: "Grant Applications", value: pendingGrants.toString(), href: "/grants", color: "orange" },
              ].map(stat => (
                <Link key={stat.label} href={stat.href} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="text-xl font-bold text-[#1a1a1a] group-hover:text-[#306e46] transition-colors">{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Member Services Grid */}
        {demoRole !== "leader" && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-5">My Services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {memberItems.map((item) => (
                <Link
                  key={item.href}
                  href={isJoined ? item.href : "/join"}
                  className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                >
                  {item.badge && (
                    <div className="absolute top-4 right-4 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#f28c28] text-white uppercase tracking-wider">
                      {item.badge}
                    </div>
                  )}
                  <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="font-bold text-[#1a1a1a] mb-1 group-hover:text-[#306e46] transition-colors">{item.label}</div>
                  <div className="text-sm text-gray-500 leading-relaxed">{item.desc}</div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-gray-400 group-hover:text-[#306e46] transition-colors">
                    Open <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Leader Tools Grid */}
        {isLeader && (
          <div>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-5 flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#f28c28]" /> Leader Portal
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {leaderItems.map((item) => (
                <Link
                  key={item.href}
                  href={isJoined ? item.href : "/join"}
                  className="group bg-white rounded-3xl p-6 border border-[#f28c28]/20 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                >
                  {item.badge && (
                    <div className="absolute top-4 right-4 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#f28c28] text-white uppercase tracking-wider">
                      {item.badge}
                    </div>
                  )}
                  <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="font-bold text-[#1a1a1a] mb-1 group-hover:text-[#f28c28] transition-colors">{item.label}</div>
                  <div className="text-sm text-gray-500 leading-relaxed">{item.desc}</div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-gray-400 group-hover:text-[#f28c28] transition-colors">
                    Manage <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Join CTA if not joined */}
        {!isJoined && (
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-3xl p-6 text-center">
            <p className="text-amber-800 font-semibold mb-1">All features are locked until you join an SHG</p>
            <p className="text-amber-600 text-sm mb-4">Register or join an existing group to unlock savings, loans, and more.</p>
            <Link href="/join" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#306e46] text-white text-sm font-bold hover:bg-[#255737]">
              Register SHG <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
