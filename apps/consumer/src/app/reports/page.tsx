"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, BookOpen, Plus, Landmark, Scale, BarChart3, Loader2 } from "lucide-react";
import NewJournalVoucherModal from "@/components/NewJournalVoucherModal";

interface JournalEntry {
  id: string;
  transaction_id: string;
  account_name: string;
  is_debit: boolean;
  amount: number;
  entry_date: string;
  description: string;
}

export default function ReportsDashboardPage() {
  const router = useRouter();
  const [shgId, setShgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Calculated ledger account balances
  const [balances, setBalances] = useState({
    cash: 0,
    loanPortfolio: 0,
    savingsLiability: 0,
    interestIncome: 0,
    feesIncome: 0,
    expenses: 0,
  });

  const supabase = createClient();

  useEffect(() => {
    fetchSHGAndLedger();
  }, []);

  const fetchSHGAndLedger = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Get user's member SHG details
      const { data: member, error: memberErr } = await supabase
        .from("members")
        .select("shg_id")
        .eq("profile_id", user.id)
        .single();

      if (memberErr || !member?.shg_id) {
        setLoading(false);
        return;
      }

      setShgId(member.shg_id);
      await fetchLedger(member.shg_id);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchLedger = async (shgUuid: string) => {
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("shg_id", shgUuid)
        .order("entry_date", { ascending: false });

      if (error) throw error;
      setEntries(data || []);
      calculateBalances(data || []);
    } catch (err) {
      console.error("Error fetching general ledger:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateBalances = (ledgerLines: JournalEntry[]) => {
    let cashVal = 0;
    let loanVal = 0;
    let savingsVal = 0;
    let interestVal = 0;
    let feesVal = 0;
    let expenseVal = 0;

    ledgerLines.forEach((line) => {
      const amt = Number(line.amount);
      const isDebit = line.is_debit;

      switch (line.account_name) {
        case "CASH":
          cashVal += isDebit ? amt : -amt;
          break;
        case "LOAN_PORTFOLIO":
          loanVal += isDebit ? amt : -amt;
          break;
        case "SAVINGS_LIABILITY":
          // Liability normally increases on CREDIT (not DEBIT)
          savingsVal += isDebit ? -amt : amt;
          break;
        case "INTEREST_INCOME":
          // Revenue normally increases on CREDIT
          interestVal += isDebit ? -amt : amt;
          break;
        case "FEES_INCOME":
          feesVal += isDebit ? -amt : amt;
          break;
        case "EXPENSES":
          // Expense normally increases on DEBIT
          expenseVal += isDebit ? amt : -amt;
          break;
      }
    });

    setBalances({
      cash: cashVal,
      loanPortfolio: loanVal,
      savingsLiability: savingsVal,
      interestIncome: interestVal,
      feesIncome: feesVal,
      expenses: expenseVal,
    });
  };

  // Calculations for Trial Balance
  const totalAssets = balances.cash + balances.loanPortfolio;
  const retainedEarnings = balances.interestIncome + balances.feesIncome - balances.expenses;
  const totalLiabilitiesEquity = balances.savingsLiability + retainedEarnings;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcf9f2] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#306e46] animate-spin mb-2" />
        <p className="text-gray-500 text-sm">Loading group accounts...</p>
      </div>
    );
  }

  if (!shgId) {
    return (
      <div className="min-h-screen bg-[#fcf9f2] p-8 text-center">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-6 border border-gray-150 shadow-sm">
          <p className="text-gray-600 font-semibold mb-4">You must belong to an SHG to access financial statements.</p>
          <button onClick={() => router.push("/dashboard")} className="px-6 py-2.5 bg-[#306e46] text-white rounded-full text-sm font-bold">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf9f2] text-gray-900 pb-16">
      {/* Header */}
      <div className="bg-[#306e46] text-white py-8 px-6 md:px-12 shadow-sm rounded-b-[2rem]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-emerald-100 hover:text-white mb-3 text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-extrabold tracking-tight">Accounts & Ledger Statements</h1>
            <p className="text-emerald-100 text-sm mt-1">Double-entry General Ledger audit reports.</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#f28c28] hover:bg-[#d97a20] transition-all font-bold text-sm shadow-md"
          >
            <Plus className="h-4 w-4" /> Post Journal Voucher
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Financial Statement */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trial Balance Card */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Scale className="h-5 w-5 text-[#306e46]" />
              <h2 className="text-xl font-bold text-gray-900">Trial Balance Sheet</h2>
            </div>

            <div className="space-y-6">
              {/* Assets Section */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Assets</h3>
                <div className="bg-gray-50 rounded-2xl divide-y divide-gray-200/50">
                  <div className="flex justify-between px-4 py-3 text-sm">
                    <span className="text-gray-600">Cash in Hand</span>
                    <span className="font-semibold text-gray-900">₹{balances.cash.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between px-4 py-3 text-sm">
                    <span className="text-gray-600">Outstanding Loans Portfolio</span>
                    <span className="font-semibold text-gray-900">₹{balances.loanPortfolio.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between px-4 py-3 text-sm font-bold bg-[#306e46]/5 text-[#306e46]">
                    <span>Total Assets</span>
                    <span>₹{totalAssets.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Liabilities and Equity Section */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Liabilities & Reserves</h3>
                <div className="bg-gray-50 rounded-2xl divide-y divide-gray-200/50">
                  <div className="flex justify-between px-4 py-3 text-sm">
                    <span className="text-gray-600">Member Savings Liability</span>
                    <span className="font-semibold text-gray-900">₹{balances.savingsLiability.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between px-4 py-3 text-sm">
                    <span className="text-gray-600">Retained Earnings / Group Pool Reserves</span>
                    <span className="font-semibold text-gray-900">₹{retainedEarnings.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between px-4 py-3 text-sm font-bold bg-[#f28c28]/5 text-[#f28c28]">
                    <span>Total Liabilities & Equity</span>
                    <span>₹{totalLiabilitiesEquity.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Balanced indicator */}
              <div className={`p-4 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2 border ${
                totalAssets === totalLiabilitiesEquity 
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}>
                {totalAssets === totalLiabilitiesEquity ? (
                  <span>✅ Ledger is balanced perfectly! Assets match Liabilities.</span>
                ) : (
                  <span>⚠️ Warning: Double-entry imbalance detected. Please review journal entry history.</span>
                )}
              </div>
            </div>
          </div>

          {/* Ledger History List */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-[#306e46]" />
              <h2 className="text-lg font-bold text-[#1a1a1a]">General Ledger Audit Log</h2>
            </div>

            {entries.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">
                No accounting journal entries posted yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold">Tx ID</th>
                      <th className="pb-3 font-semibold">Account</th>
                      <th className="pb-3 font-semibold">Debit</th>
                      <th className="pb-3 font-semibold">Credit</th>
                      <th className="pb-3 font-semibold hidden md:table-cell">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {entries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 text-gray-500 whitespace-nowrap">
                          {new Date(entry.entry_date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="py-3 font-mono text-gray-400">{entry.transaction_id.slice(0, 9)}</td>
                        <td className="py-3 font-bold text-gray-900">{entry.account_name}</td>
                        <td className="py-3 font-semibold text-emerald-600">
                          {entry.is_debit ? `₹${Number(entry.amount).toLocaleString("en-IN")}` : "-"}
                        </td>
                        <td className="py-3 font-semibold text-gray-500">
                          {!entry.is_debit ? `₹${Number(entry.amount).toLocaleString("en-IN")}` : "-"}
                        </td>
                        <td className="py-3 text-gray-500 max-w-[150px] truncate hidden md:table-cell" title={entry.description}>
                          {entry.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Performance Analytics */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-[#f28c28]" />
              <h2 className="text-lg font-bold text-gray-900">Income Statement</h2>
            </div>
            
            <div className="space-y-3.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Interest Earned</span>
                <span className="font-semibold text-emerald-600">+₹{balances.interestIncome.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Fees & Penalty Income</span>
                <span className="font-semibold text-emerald-600">+₹{balances.feesIncome.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-xs border-b border-gray-100 pb-3">
                <span className="text-gray-500">Auditing & Misc Expenses</span>
                <span className="font-semibold text-red-500">-₹{balances.expenses.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1">
                <span>Net Surplus</span>
                <span className={retainedEarnings >= 0 ? "text-emerald-700" : "text-red-700"}>
                  ₹{retainedEarnings.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <NewJournalVoucherModal
        shgId={shgId}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => fetchLedger(shgId)}
      />
    </div>
  );
}
