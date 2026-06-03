"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  PiggyBank, ArrowUpRight, ArrowDownLeft, ArrowLeft,
  Users, Loader2, RefreshCw, User
} from "lucide-react";
import SavingsDepositModal from "@/components/SavingsDepositModal";
import Link from "next/link";

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  transaction_date: string;
  reference_id: string | null;
  notes: string | null;
  member_id: string | null;
}

interface MemberAccount {
  member_id: string;
  balance: number;
  memberName: string;
}

export default function SavingsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"group" | "members">("group");
  const [loading, setLoading] = useState(true);
  const [shgId, setShgId] = useState<string | null>(null);
  const [poolId, setPoolId] = useState<string | null>(null);
  const [poolBalance, setPoolBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [memberAccounts, setMemberAccounts] = useState<MemberAccount[]>([]);
  const [shgName, setShgName] = useState("");
  const [isLeader, setIsLeader] = useState(false);

  const supabase = createClient();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: member } = await supabase
        .from("members")
        .select("shg_id, is_leader, shgs(name)")
        .eq("profile_id", user.id)
        .single();
      if (!member) { router.push("/join"); return; }

      const sid = member.shg_id;
      setShgId(sid);
      setShgName((member.shgs as any)?.name || "");
      setIsLeader(member.is_leader);

      // Group pool
      const { data: pool } = await supabase
        .from("savings_accounts")
        .select("id, balance")
        .eq("shg_id", sid)
        .is("member_id", null)
        .single();

      if (pool) {
        setPoolId(pool.id);
        setPoolBalance(Number(pool.balance));

        const { data: txns } = await supabase
          .from("savings_transactions")
          .select("*")
          .eq("account_id", pool.id)
          .order("transaction_date", { ascending: false })
          .limit(50);
        setTransactions(txns || []);
      }

      // Per-member accounts
      const { data: accounts } = await supabase
        .from("savings_accounts")
        .select("member_id, balance, members(profiles(full_name))")
        .eq("shg_id", sid)
        .not("member_id", "is", null);

      setMemberAccounts(
        (accounts || []).map((a: any) => ({
          member_id: a.member_id,
          balance: Number(a.balance),
          memberName: a.members?.profiles?.full_name || "Unknown",
        })).sort((a, b) => b.balance - a.balance)
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Compute running balance (ascending date)
  const sortedAsc = [...transactions].reverse();
  let running = 0;
  const withBalance = sortedAsc.map(t => {
    if (t.transaction_type === "DEPOSIT") running += Number(t.amount);
    else running -= Number(t.amount);
    return { ...t, runningBalance: running };
  }).reverse();

  const totalDeposits = transactions.filter(t => t.transaction_type === "DEPOSIT").reduce((s, t) => s + Number(t.amount), 0);
  const totalWithdrawals = transactions.filter(t => t.transaction_type === "WITHDRAWAL").reduce((s, t) => s + Number(t.amount), 0);
  const totalMemberSavings = memberAccounts.reduce((s, a) => s + a.balance, 0);

  if (loading) return (
    <div className="min-h-screen bg-[#fcf9f2] flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-[#306e46] animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcf9f2] pb-16">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#306e46] to-[#1e4d32] text-white py-8 px-6 rounded-b-[2rem] shadow-md">
        <div className="max-w-5xl mx-auto">
          <Link href="/dashboard" className="flex items-center gap-2 text-emerald-100 hover:text-white mb-3 text-sm font-semibold">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1">{shgName}</p>
          <h1 className="text-3xl font-extrabold">Savings Ledger</h1>

          {/* Balance Cards */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="bg-white/10 rounded-2xl p-4">
              <p className="text-emerald-200 text-[10px] font-bold uppercase mb-1">Group Pool</p>
              <p className="text-2xl font-extrabold">₹{poolBalance.toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4">
              <p className="text-emerald-200 text-[10px] font-bold uppercase mb-1">Total Deposits</p>
              <p className="text-2xl font-extrabold text-emerald-300">₹{totalDeposits.toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-4">
              <p className="text-emerald-200 text-[10px] font-bold uppercase mb-1">Withdrawals</p>
              <p className="text-2xl font-extrabold text-orange-300">₹{totalWithdrawals.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 mt-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 p-1 mb-6 shadow-sm w-fit">
          <button
            onClick={() => setTab("group")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === "group" ? "bg-[#306e46] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <PiggyBank className="h-4 w-4" /> Group Pool
          </button>
          <button
            onClick={() => setTab("members")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === "members" ? "bg-[#306e46] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Users className="h-4 w-4" /> Per Member
          </button>
        </div>

        {tab === "group" && (
          <div className="space-y-5">
            {/* Actions */}
            {isLeader && poolId && (
              <div className="flex gap-3">
                <SavingsDepositModal accountId={poolId} type="DEPOSIT" onSuccess={fetchAll} />
                <SavingsDepositModal accountId={poolId} type="WITHDRAWAL" onSuccess={fetchAll} />
                <button onClick={fetchAll} className="ml-auto flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#306e46] transition-colors">
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </button>
              </div>
            )}

            {/* Ledger */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">Transaction Ledger</h2>
                <span className="text-xs text-gray-400">{transactions.length} entries</span>
              </div>

              {transactions.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <PiggyBank className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No transactions yet</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-12 gap-2 px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                    <div className="col-span-2">Date</div>
                    <div className="col-span-3">Type</div>
                    <div className="col-span-2">Debit (Dr)</div>
                    <div className="col-span-2">Credit (Cr)</div>
                    <div className="col-span-2 text-right">Balance</div>
                    <div className="col-span-1">Notes</div>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {withBalance.map((txn) => (
                      <div key={txn.id} className="grid grid-cols-12 gap-2 px-6 py-3.5 items-center hover:bg-gray-50/50 text-xs">
                        <div className="col-span-2 text-gray-500 whitespace-nowrap">
                          {new Date(txn.transaction_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                        </div>
                        <div className="col-span-3 flex items-center gap-1.5">
                          <div className={`h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0 ${txn.transaction_type === "DEPOSIT" ? "bg-emerald-50" : "bg-orange-50"}`}>
                            {txn.transaction_type === "DEPOSIT"
                              ? <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600" />
                              : <ArrowUpRight className="h-3.5 w-3.5 text-orange-600" />}
                          </div>
                          <span className="font-semibold text-gray-800">{txn.transaction_type === "DEPOSIT" ? "Deposit" : "Withdrawal"}</span>
                        </div>
                        <div className="col-span-2 font-bold text-orange-600">
                          {txn.transaction_type === "WITHDRAWAL" ? `₹${Number(txn.amount).toLocaleString("en-IN")}` : "—"}
                        </div>
                        <div className="col-span-2 font-bold text-emerald-600">
                          {txn.transaction_type === "DEPOSIT" ? `₹${Number(txn.amount).toLocaleString("en-IN")}` : "—"}
                        </div>
                        <div className="col-span-2 text-right font-extrabold text-gray-900">
                          ₹{txn.runningBalance.toLocaleString("en-IN")}
                        </div>
                        <div className="col-span-1 text-gray-400 truncate" title={txn.notes || ""}>
                          {txn.notes ? "📝" : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {tab === "members" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Member Savings</p>
                <p className="text-2xl font-extrabold text-gray-900">₹{totalMemberSavings.toLocaleString("en-IN")}</p>
              </div>
              <p className="text-xs text-gray-400">{memberAccounts.length} accounts</p>
            </div>

            {memberAccounts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
                <Users className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium text-sm">No member savings accounts yet.</p>
                <p className="text-gray-400 text-xs mt-1">These are created automatically when members join.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                  <div className="col-span-1">#</div>
                  <div className="col-span-7">Member</div>
                  <div className="col-span-4 text-right">Balance</div>
                </div>
                <div className="divide-y divide-gray-50">
                  {memberAccounts.map((a, i) => (
                    <div key={a.member_id} className="grid grid-cols-12 gap-2 px-6 py-4 items-center">
                      <div className="col-span-1 text-xs text-gray-400 font-bold">{i + 1}</div>
                      <div className="col-span-7 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                          {a.memberName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{a.memberName}</span>
                      </div>
                      <div className="col-span-4 text-right">
                        <span className={`text-sm font-extrabold ${a.balance > 0 ? "text-emerald-600" : "text-gray-400"}`}>
                          ₹{a.balance.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
