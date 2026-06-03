import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PiggyBank, ArrowUpRight, ArrowDownLeft, Plus, TrendingUp, LogOut } from "lucide-react";
import SavingsDepositModal from "@/components/SavingsDepositModal";

export default async function SavingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("members")
    .select("*, shgs(*)")
    .eq("profile_id", user.id)
    .single();

  if (!member) redirect("/join");

  // Group pool savings account
  const { data: pool } = await supabase
    .from("savings_accounts")
    .select("*")
    .eq("shg_id", member.shg_id)
    .is("member_id", null)
    .single();

  // All transactions for this SHG
  const { data: transactions } = await supabase
    .from("savings_transactions")
    .select("*")
    .eq("account_id", pool?.id ?? "")
    .order("transaction_date", { ascending: false })
    .limit(30);

  const shg = member.shgs as any;
  const txns = transactions || [];
  const totalDeposits = txns.filter(t => t.transaction_type === "DEPOSIT").reduce((s, t) => s + Number(t.amount), 0);
  const totalWithdrawals = txns.filter(t => t.transaction_type === "WITHDRAWAL").reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="min-h-screen bg-[#fcf9f2]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="Setu" className="h-8 w-8 rounded-full border border-[#306e46]/20" />
            <span className="font-bold text-[#306e46]">Savings Ledger</span>
          </Link>
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors bg-gray-50 px-4 py-2 rounded-full">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
        {/* SHG Header */}
        <div className="mb-8">
          <p className="text-sm text-gray-500 font-medium">{shg.name}</p>
          <h1 className="text-3xl font-bold text-[#1a1a1a]">Savings Ledger</h1>
          <p className="text-gray-500 text-sm mt-1">All deposits and withdrawals for the group pool</p>
        </div>

        {/* Balance + Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="sm:col-span-1 bg-gradient-to-br from-[#306e46] to-[#255737] rounded-3xl p-6 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <p className="text-green-200 text-sm font-medium mb-1">Group Pool Balance</p>
            <div className="text-4xl font-bold mb-1">₹{Number(pool?.balance ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
            <p className="text-green-200 text-xs">{txns.length} total transactions</p>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Total Deposits</span>
            </div>
            <div className="text-2xl font-bold text-[#1a1a1a]">₹{totalDeposits.toLocaleString("en-IN")}</div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center">
                <ArrowUpRight className="h-4 w-4 text-orange-600" />
              </div>
              <span className="text-sm text-gray-500 font-medium">Total Withdrawals</span>
            </div>
            <div className="text-2xl font-bold text-[#1a1a1a]">₹{totalWithdrawals.toLocaleString("en-IN")}</div>
          </div>
        </div>

        {/* Add Transaction */}
        <div className="flex gap-3 mb-6">
          <SavingsDepositModal accountId={pool?.id ?? ""} type="DEPOSIT" />
          <SavingsDepositModal accountId={pool?.id ?? ""} type="WITHDRAWAL" />
        </div>

        {/* Transaction Ledger Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-[#1a1a1a]">Transaction History</h2>
            <span className="text-xs text-gray-400">{txns.length} entries</span>
          </div>
          {txns.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <PiggyBank className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No transactions yet</p>
              <p className="text-gray-400 text-sm mt-1">Record the first deposit to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">
                <div className="col-span-2">Date</div>
                <div className="col-span-4">Type / Reference</div>
                <div className="col-span-3 text-right">Debit (Dr)</div>
                <div className="col-span-3 text-right">Credit (Cr)</div>
              </div>
              {txns.map((txn) => (
                <div key={txn.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
                  <div className="col-span-2 text-xs text-gray-500">
                    {new Date(txn.transaction_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </div>
                  <div className="col-span-4">
                    <div className="flex items-center gap-2">
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        txn.transaction_type === "DEPOSIT" ? "bg-emerald-50" : "bg-orange-50"
                      }`}>
                        {txn.transaction_type === "DEPOSIT"
                          ? <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600" />
                          : <ArrowUpRight className="h-3.5 w-3.5 text-orange-600" />
                        }
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#1a1a1a]">{txn.transaction_type === "DEPOSIT" ? "Deposit" : "Withdrawal"}</div>
                        {txn.reference_id && <div className="text-xs text-gray-400">Ref: {txn.reference_id}</div>}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 text-right">
                    {txn.transaction_type === "WITHDRAWAL" ? (
                      <span className="text-sm font-bold text-orange-600">₹{Number(txn.amount).toLocaleString("en-IN")}</span>
                    ) : <span className="text-sm text-gray-300">—</span>}
                  </div>
                  <div className="col-span-3 text-right">
                    {txn.transaction_type === "DEPOSIT" ? (
                      <span className="text-sm font-bold text-emerald-600">₹{Number(txn.amount).toLocaleString("en-IN")}</span>
                    ) : <span className="text-sm text-gray-300">—</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
