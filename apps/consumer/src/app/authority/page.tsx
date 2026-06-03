import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck, Building, Users, PiggyBank,
  Landmark, ArrowRight, TrendingUp, AlertTriangle, LogOut, Bell
} from "lucide-react";
import Header from "@/components/Header";

export default async function AuthorityDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) redirect("/login");

  // Verify Authority Role (in a real app, check a specific role/permission table)
  // For now, anyone logging into the Admin app sees the global view.

  // 1. Fetch aggregate metrics across the entire platform
  const [
    { count: totalSHGs },
    { count: totalMembers },
    { data: allSavings },
    { data: allLoans },
    { count: pendingGrants }
  ] = await Promise.all([
    supabase.from("shgs").select("*", { count: "exact", head: true }),
    supabase.from("members").select("*", { count: "exact", head: true }),
    supabase.from("savings_accounts").select("balance").is("member_id", null), // Only group pools
    supabase.from("loans").select("outstanding_principal, status").eq("status", "ACTIVE"),
    supabase.from("grant_applications").select("*", { count: "exact", head: true }).eq("status", "UNDER_REVIEW")
  ]);

  const totalPoolSavings = (allSavings || []).reduce((acc, account) => acc + Number(account.balance), 0);
  const totalActiveLoansAmount = (allLoans || []).reduce((acc, loan) => acc + Number(loan.outstanding_principal), 0);

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <Header />

      <div className="container mx-auto px-4 max-w-6xl py-8 space-y-8">
        
        {/* Top Banner */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
            <Building className="h-64 w-64" />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Global Oversight Dashboard</h1>
            <p className="text-indigo-200 max-w-xl">
              Monitor the financial health, credit linkage, and compliance of all Self Help Groups operating on the Setu platform.
            </p>
          </div>
        </div>

        {/* Aggregate KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total SHGs", value: totalSHGs || 0, icon: Building, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Total Members", value: totalMembers || 0, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Total Pool Savings", value: `₹${(totalPoolSavings/1000).toFixed(1)}K`, icon: PiggyBank, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Outstanding Credit", value: `₹${(totalActiveLoansAmount/1000).toFixed(1)}K`, icon: Landmark, color: "text-blue-600", bg: "bg-blue-50" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <div className={`h-12 w-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-2xl font-extrabold text-slate-800 mb-1">{stat.value}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Operations Grid */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-5">Operations & Review</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* SHG Directory */}
            <Link href="/authority/shgs" className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all block">
              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building className="h-5 w-5 text-slate-700" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">SHG Directory</h3>
              <p className="text-sm text-slate-500 mb-4">View ledgers, meeting compliance, and grading for all registered groups.</p>
              <div className="text-sm font-semibold text-indigo-600 flex items-center gap-1">
                View Directory <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Grants Pipeline */}
            <Link href="/authority/grants" className="group bg-white rounded-3xl p-6 border border-indigo-100 shadow-sm hover:shadow-md transition-all block relative">
              {(pendingGrants || 0) > 0 && (
                <div className="absolute top-4 right-4 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <AlertTriangle className="h-3 w-3" /> {pendingGrants} Pending
                </div>
              )}
              <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">Grants Pipeline</h3>
              <p className="text-sm text-slate-500 mb-4">Review and approve/reject government schemes & NGO grant applications.</p>
              <div className="text-sm font-semibold text-indigo-600 flex items-center gap-1">
                Review Grants <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
}
