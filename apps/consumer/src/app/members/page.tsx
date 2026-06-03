import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Crown, Calendar, Phone, PiggyBank, CreditCard, ArrowLeft } from "lucide-react";
import MemberActionButton from "@/components/MemberActionButton";

export default async function MembersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: selfMember } = await supabase
    .from("members")
    .select("id, shg_id, is_leader, shgs(name, formation_date)")
    .eq("profile_id", user.id)
    .single();

  if (!selfMember) redirect("/join");

  const shg = selfMember.shgs as any;

  // All members with profiles
  const { data: members } = await supabase
    .from("members")
    .select("*, profiles(full_name, phone, email)")
    .eq("shg_id", selfMember.shg_id)
    .order("is_leader", { ascending: false })
    .order("joined_date", { ascending: true });

  // All active loans for this SHG (to badge per member)
  const { data: loans } = await supabase
    .from("loans")
    .select("member_id, outstanding_principal, status")
    .eq("shg_id", selfMember.shg_id)
    .eq("status", "ACTIVE");

  // Per-member savings accounts
  const { data: savingsAccounts } = await supabase
    .from("savings_accounts")
    .select("member_id, balance")
    .eq("shg_id", selfMember.shg_id)
    .not("member_id", "is", null);

  const allMembers = members || [];
  const activeLoans = loans || [];
  const savings = savingsAccounts || [];

  // Build lookup maps
  const loansByMember = new Map<string, number>();
  activeLoans.forEach(l => {
    loansByMember.set(l.member_id, (loansByMember.get(l.member_id) || 0) + Number(l.outstanding_principal));
  });

  const savingsByMember = new Map<string, number>();
  savings.forEach(s => {
    if (s.member_id) savingsByMember.set(s.member_id, Number(s.balance));
  });

  const activeCount = allMembers.filter(m => m.status === "ACTIVE").length;
  const leaderCount = allMembers.filter(m => m.is_leader).length;
  const totalSavings = Array.from(savingsByMember.values()).reduce((s, v) => s + v, 0);
  const totalLoanExposure = Array.from(loansByMember.values()).reduce((s, v) => s + v, 0);

  return (
    <div className="min-h-screen bg-[#fcf9f2]">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white py-8 px-6 rounded-b-[2rem] shadow-md">
        <div className="max-w-4xl mx-auto">
          <Link href="/dashboard" className="flex items-center gap-2 text-pink-100 hover:text-white mb-3 text-sm font-semibold">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <h1 className="text-2xl font-extrabold">{shg?.name}</h1>
          <p className="text-pink-100 text-sm mt-1">
            {formation_date_formatted(shg?.formation_date)}
          </p>
          {/* SHG stats */}
          <div className="grid grid-cols-4 gap-3 mt-5">
            {[
              { label: "Members", value: allMembers.length },
              { label: "Active", value: activeCount },
              { label: "Leaders", value: leaderCount },
              { label: "Total Savings", value: `₹${(totalSavings / 1000).toFixed(1)}K` },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-2xl p-3 text-center">
                <p className="text-lg font-extrabold">{s.value}</p>
                <p className="text-pink-200 text-[10px]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 mt-6 space-y-3 pb-12">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
          <Users className="h-4 w-4" /> Member Directory
        </h2>

        {allMembers.map((m) => {
          const profile = m.profiles as any;
          const isMe = m.profile_id === user.id;
          const loanOutstanding = loansByMember.get(m.id) || 0;
          const memberSavings = savingsByMember.get(m.id) || 0;

          return (
            <div
              key={m.id}
              className={`bg-white rounded-2xl border shadow-sm p-5 ${
                isMe ? "border-[#306e46]/30 ring-1 ring-[#306e46]/10" : "border-gray-100"
              } ${m.status !== "ACTIVE" ? "opacity-60" : ""}`}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xl font-extrabold flex-shrink-0 ${
                  m.is_leader ? "bg-gradient-to-br from-[#f28c28] to-orange-500 text-white shadow-md" : "bg-gray-100 text-gray-600"
                }`}>
                  {profile?.full_name?.charAt(0)?.toUpperCase() ?? "?"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900">{profile?.full_name ?? "Unknown"}</span>
                    {m.is_leader && (
                      <span className="flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#f28c28]/15 text-[#f28c28]">
                        <Crown className="h-2.5 w-2.5" /> LEADER
                      </span>
                    )}
                    {isMe && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#306e46]/10 text-[#306e46]">YOU</span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      m.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"
                    }`}>{m.status}</span>
                  </div>

                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                    {profile?.phone && (
                      <a href={`tel:${profile.phone}`} className="flex items-center gap-1 hover:text-[#306e46]">
                        <Phone className="h-3 w-3" /> {profile.phone}
                      </a>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Joined {new Date(m.joined_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </span>
                  </div>

                  {/* Financial stats row */}
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs">
                      <div className="h-6 w-6 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <PiggyBank className="h-3.5 w-3.5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">₹{memberSavings.toLocaleString("en-IN")}</p>
                        <p className="text-[9px] text-gray-400">Savings</p>
                      </div>
                    </div>
                    {loanOutstanding > 0 && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <div className="h-6 w-6 rounded-lg bg-blue-50 flex items-center justify-center">
                          <CreditCard className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">₹{loanOutstanding.toLocaleString("en-IN")}</p>
                          <p className="text-[9px] text-gray-400">Loan Outstanding</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Leader actions */}
                {selfMember.is_leader && !isMe && (
                  <MemberActionButton
                    memberId={m.id}
                    currentStatus={m.status}
                    currentIsLeader={m.is_leader}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formation_date_formatted(date: string | null | undefined): string {
  if (!date) return "SHG Group";
  const d = new Date(date);
  const months = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 30));
  return `Formed ${d.toLocaleDateString("en-IN", { month: "long", year: "numeric" })} · Active for ${months} months`;
}
