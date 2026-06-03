"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { X, Plus, Info, Check, Loader2 } from "lucide-react";

interface NewJournalVoucherModalProps {
  shgId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ACCOUNTS = [
  { value: "CASH", label: "Cash in Hand (Asset)" },
  { value: "LOAN_PORTFOLIO", label: "Loan Portfolio (Asset)" },
  { value: "SAVINGS_LIABILITY", label: "Member Savings Liability (Equity/Liability)" },
  { value: "INTEREST_INCOME", label: "Interest Income (Revenue)" },
  { value: "FEES_INCOME", label: "Fees & Charges (Revenue)" },
  { value: "EXPENSES", label: "General Expenses (Expense)" },
];

export default function NewJournalVoucherModal({ shgId, isOpen, onClose, onSuccess }: NewJournalVoucherModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [acc1, setAcc1] = useState("CASH");
  const [type1, setType1] = useState<"DEBIT" | "CREDIT">("DEBIT");
  const [amount, setAmount] = useState("");
  const [acc2, setAcc2] = useState("SAVINGS_LIABILITY");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError("Please specify a valid transaction amount.");
      return;
    }

    if (acc1 === acc2) {
      setError("Debit and Credit accounts must be different.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const txId = `JV-${Date.now()}`;

    // Double entry lines
    const entries = [
      {
        transaction_id: txId,
        shg_id: shgId,
        account_name: acc1,
        is_debit: type1 === "DEBIT",
        amount: numAmount,
        description: description || "Manual journal entry adjustment",
      },
      {
        transaction_id: txId,
        shg_id: shgId,
        account_name: acc2,
        is_debit: type1 === "CREDIT", // opposite of entry 1
        amount: numAmount,
        description: description || "Manual journal entry adjustment",
      },
    ];

    try {
      const { error: insertErr } = await supabase
        .from("journal_entries")
        .insert(entries);

      if (insertErr) throw insertErr;
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create journal voucher entries.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-[#306e46] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">New Journal Voucher</h3>
            <p className="text-emerald-100 text-xs mt-0.5">ERPNext double-entry accounting adjust</p>
          </div>
          <button onClick={onClose} className="text-emerald-100 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Account 1 Detail */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Book Entry #1</span>
              <div className="flex gap-2">
                {(["DEBIT", "CREDIT"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType1(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                      type1 === t
                        ? "bg-[#306e46] text-white border-[#306e46]"
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Account</label>
                <select
                  value={acc1}
                  onChange={(e) => setAcc1(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#306e46] bg-white text-xs"
                >
                  {ACCOUNTS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g., 500"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#306e46] text-xs"
                />
              </div>
            </div>
          </div>

          {/* Account 2 (Auto-balanced Offset) */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Book Entry #2 (Offset)</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                {type1 === "DEBIT" ? "CREDIT" : "DEBIT"} (Auto Balanced)
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Offset Account</label>
              <select
                value={acc2}
                onChange={(e) => setAcc2(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#306e46] bg-white text-xs"
              >
                {ACCOUNTS.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description / Voucher Remarks</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain why this accounting adjustment is being recorded..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#306e46] text-xs"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-full bg-[#f28c28] hover:bg-[#d97a20] text-white font-bold text-xs transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" /> Posting...
                </>
              ) : (
                <>
                  <Check className="h-4.5 w-4.5" /> Post Voucher
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
