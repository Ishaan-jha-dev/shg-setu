import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TrendingUp, LogOut, CheckCircle2, Clock, XCircle, ExternalLink, IndianRupee } from "lucide-react";
import GrantApplyButton from "@/components/GrantApplyButton";

const categoryColors: Record<string, string> = {
  BUSINESS: "bg-purple-100 text-purple-700",
  AGRICULTURE: "bg-green-100 text-green-700",
  HOUSING: "bg-orange-100 text-orange-700",
  EDUCATION: "bg-blue-100 text-blue-700",
  HEALTH: "bg-red-100 text-red-700",
};

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  APPLIED: { label: "Applied", color: "text-blue-600 bg-blue-50 border-blue-200", icon: Clock },
  UNDER_REVIEW: { label: "Under Review", color: "text-amber-600 bg-amber-50 border-amber-200", icon: Clock },
  APPROVED: { label: "Approved ✓", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", color: "text-red-600 bg-red-50 border-red-200", icon: XCircle },
};

export default async function GrantsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("members")
    .select("id, shg_id")
    .eq("profile_id", user.id)
    .single();

  const { data: schemes } = await supabase
    .from("grant_schemes")
    .select("*")
    .eq("is_active", true);

  const { data: applications } = await supabase
    .from("grant_applications")
    .select("*, grant_schemes(name)")
    .eq("shg_id", member?.shg_id ?? "")
    .order("applied_at", { ascending: false });

  const appliedSchemeIds = new Set((applications || []).map(a => a.scheme_id));
  const allSchemes = schemes || [];
  const myApplications = applications || [];

  return (
    <div className="min-h-screen bg-[#fcf9f2]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="Setu" className="h-8 w-8 rounded-full border border-[#306e46]/20" />
            <span className="font-bold text-[#306e46]">Grant Acquisition</span>
          </Link>
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 bg-gray-50 px-4 py-2 rounded-full">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
        {/* Hero */}
        <div className="mb-10 bg-gradient-to-br from-purple-600 to-violet-700 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute right-6 top-6 opacity-10">
            <TrendingUp className="h-40 w-40" />
          </div>
          <p className="text-purple-200 text-sm font-medium mb-1">Government & NGO Schemes</p>
          <h1 className="text-3xl font-bold mb-2">Grant Acquisition Hub</h1>
          <p className="text-purple-200 text-base max-w-lg">Find and apply for verified government schemes, NABARD grants, and NGO programs designed for SHG members.</p>
          <div className="flex gap-4 mt-5">
            <div className="bg-white/10 rounded-2xl px-4 py-2 text-center">
              <div className="font-bold text-xl">{allSchemes.length}</div>
              <div className="text-purple-200 text-xs">Available Schemes</div>
            </div>
            <div className="bg-white/10 rounded-2xl px-4 py-2 text-center">
              <div className="font-bold text-xl">{myApplications.filter(a => a.status === "APPROVED").length}</div>
              <div className="text-purple-200 text-xs">Approved</div>
            </div>
          </div>
        </div>

        {/* My Applications */}
        {myApplications.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-4">📋 My Applications</h2>
            <div className="space-y-3">
              {myApplications.map(app => {
                const cfg = statusConfig[app.status] ?? statusConfig["APPLIED"];
                const StatusIcon = cfg.icon;
                return (
                  <div key={app.id} className="bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm text-[#1a1a1a]">{(app.grant_schemes as any)?.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Applied: {new Date(app.applied_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        {app.amount_approved && ` · ₹${Number(app.amount_approved).toLocaleString("en-IN")} approved`}
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${cfg.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Schemes */}
        <div>
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-4">🏛️ Available Government Schemes</h2>
          <div className="grid grid-cols-1 gap-5">
            {allSchemes.map(scheme => {
              const alreadyApplied = appliedSchemeIds.has(scheme.id);
              return (
                <div key={scheme.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${categoryColors[scheme.category] ?? "bg-gray-100 text-gray-600"}`}>
                          {scheme.category}
                        </span>
                        {scheme.max_amount && (
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <IndianRupee className="h-3 w-3" />Up to ₹{Number(scheme.max_amount).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-[#1a1a1a]">{scheme.name}</h3>
                    </div>
                    <div className="text-xs text-gray-400 font-medium bg-gray-50 px-3 py-1.5 rounded-full">{scheme.provider}</div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{scheme.description}</p>
                  {scheme.eligibility && (
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 text-xs text-amber-800 mb-4">
                      <span className="font-semibold">Eligibility: </span>{scheme.eligibility}
                    </div>
                  )}
                  <div className="flex gap-3">
                    {member && !alreadyApplied && (
                      <GrantApplyButton schemeId={scheme.id} shgId={member.shg_id} memberId={member.id} appliedById={user.id} />
                    )}
                    {alreadyApplied && (
                      <div className="flex-1 py-2.5 rounded-2xl bg-gray-100 text-gray-500 text-sm font-semibold text-center">
                        Already Applied
                      </div>
                    )}
                    {scheme.application_url && (
                      <a href={scheme.application_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                        <ExternalLink className="h-3.5 w-3.5" />Official Portal
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
