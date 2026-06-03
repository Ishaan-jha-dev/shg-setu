"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowDownLeft, ArrowUpRight, Loader2, X } from "lucide-react";

interface Props {
  accountId: string;
  type: "DEPOSIT" | "WITHDRAWAL";
  onSuccess?: () => void;
}

export default function SavingsDepositModal({ accountId, type, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const isDeposit = type === "DEPOSIT";

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Insert transaction
    const { error: txnErr } = await supabase.from("savings_transactions").insert({
      account_id: accountId,
      transaction_type: type,
      amount: Number(amount),
      reference_id: reference || null,
      notes: notes || null,
      recorded_by: user?.id,
    });

    if (txnErr) { setError(txnErr.message); setLoading(false); return; }

    // 2. Update balance on the account
    const { data: acc } = await supabase
      .from("savings_accounts")
      .select("balance")
      .eq("id", accountId)
      .single();

    const newBalance = isDeposit
      ? Number(acc?.balance ?? 0) + Number(amount)
      : Number(acc?.balance ?? 0) - Number(amount);

    await supabase.from("savings_accounts").update({ balance: newBalance }).eq("id", accountId);

    setOpen(false);
    setAmount("");
    setReference("");
    setNotes("");
    if (onSuccess) onSuccess();
    else router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${
          isDeposit
            ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200"
            : "bg-white text-orange-600 border border-orange-200 hover:bg-orange-50"
        }`}
      >
        {isDeposit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
        {isDeposit ? "Record Deposit" : "Record Withdrawal"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${isDeposit ? "bg-emerald-100" : "bg-orange-100"}`}>
                  {isDeposit ? <ArrowDownLeft className="h-5 w-5 text-emerald-600" /> : <ArrowUpRight className="h-5 w-5 text-orange-600" />}
                </div>
                <h3 className="text-lg font-bold text-[#1a1a1a]">{isDeposit ? "Record Deposit" : "Record Withdrawal"}</h3>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amount (₹) *</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#306e46] focus:ring-2 focus:ring-[#306e46]/10 text-2xl font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Reference / Receipt No. <span className="text-gray-400 font-normal">(Optional)</span></label>
                <input
                  type="text"
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  placeholder="e.g., RCPT-001"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#306e46] focus:ring-2 focus:ring-[#306e46]/10 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Notes <span className="text-gray-400 font-normal">(Optional)</span></label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g., Monthly meeting collection"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#306e46] text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setOpen(false)} className="flex-1 py-3 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`flex-1 py-3 rounded-full text-sm font-bold text-white transition-all disabled:opacity-60 ${
                  isDeposit ? "bg-emerald-600 hover:bg-emerald-700" : "bg-orange-500 hover:bg-orange-600"
                }`}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : `Confirm ${isDeposit ? "Deposit" : "Withdrawal"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
