"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { X, CheckCircle, Loader2, AlertTriangle, IndianRupee } from "lucide-react";

interface RecordRepaymentModalProps {
  installment: {
    id: string;
    installment_number: number;
    due_date: string;
    principal_due: number;
    interest_due: number;
    penalty_due: number;
    status: string;
  };
  loanId: string;
  shgId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RecordRepaymentModal({
  installment,
  loanId,
  shgId,
  onClose,
  onSuccess,
}: RecordRepaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [principalPaid, setPrincipalPaid] = useState(String(installment.principal_due));
  const [interestPaid, setInterestPaid] = useState(String(installment.interest_due));
  const [penaltyPaid, setPenaltyPaid] = useState(String(installment.penalty_due));
  const [notes, setNotes] = useState("");

  const totalDue = Number(installment.principal_due) + Number(installment.interest_due) + Number(installment.penalty_due);
  const totalPaying = (Number(principalPaid) || 0) + (Number(interestPaid) || 0) + (Number(penaltyPaid) || 0);
  const isOverpaying = totalPaying > totalDue;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (totalPaying <= 0) {
      setError("Amount paid must be greater than zero.");
      return;
    }
    if (isOverpaying) {
      setError("Total amount paid cannot exceed total due amount.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      // 1. Determine new status
      const pPaid = Number(principalPaid) || 0;
      const iPaid = Number(interestPaid) || 0;
      const penPaid = Number(penaltyPaid) || 0;
      const isFullyPaid = pPaid >= installment.principal_due && iPaid >= installment.interest_due && penPaid >= installment.penalty_due;
      const newStatus = isFullyPaid ? "PAID" : "PARTIAL";

      // 2. Update repayment record
      const { error: repErr } = await supabase
        .from("loan_repayments")
        .update({
          principal_paid: pPaid,
          interest_paid: iPaid,
          penalty_paid: penPaid,
          paid_date: new Date().toISOString().split("T")[0],
          status: newStatus,
          notes,
        })
        .eq("id", installment.id);

      if (repErr) throw repErr;

      // 3. Reduce outstanding_principal on the loan (Fineract: LoanTransaction posting)
      const { data: loanData, error: loanFetchErr } = await supabase
        .from("loans")
        .select("outstanding_principal, principal_amount")
        .eq("id", loanId)
        .single();

      if (loanFetchErr) throw loanFetchErr;

      const newOutstanding = Math.max(0, Number(loanData.outstanding_principal) - pPaid);
      const isClosed = newOutstanding === 0;

      const { error: loanUpdateErr } = await supabase
        .from("loans")
        .update({
          outstanding_principal: newOutstanding,
          status: isClosed ? "CLOSED" : "ACTIVE",
        })
        .eq("id", loanId);

      if (loanUpdateErr) throw loanUpdateErr;

      // 4. Auto-post journal entry (Fineract: Accounting Rules)
      const txId = `REPMT-${Date.now()}`;
      const journalLines = [
        // Debit: CASH (cash received from borrower)
        { transaction_id: txId, shg_id: shgId, account_name: "CASH", is_debit: true, amount: totalPaying, description: `Loan repayment - Installment #${installment.installment_number}` },
        // Credit: LOAN_PORTFOLIO (reduce outstanding loan asset)
        { transaction_id: txId, shg_id: shgId, account_name: "LOAN_PORTFOLIO", is_debit: false, amount: pPaid, description: `Principal repaid - Installment #${installment.installment_number}` },
      ];

      if (iPaid > 0) {
        // Credit: INTEREST_INCOME
        journalLines.push({ transaction_id: txId, shg_id: shgId, account_name: "INTEREST_INCOME", is_debit: false, amount: iPaid, description: `Interest collected - Installment #${installment.installment_number}` });
      }
      if (penPaid > 0) {
        // Credit: FEES_INCOME
        journalLines.push({ transaction_id: txId, shg_id: shgId, account_name: "FEES_INCOME", is_debit: false, amount: penPaid, description: `Penalty collected - Installment #${installment.installment_number}` });
      }

      const { error: journalErr } = await supabase.from("journal_entries").insert(journalLines);
      if (journalErr) console.warn("Journal entry failed:", journalErr.message); // non-fatal

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to record repayment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-[#306e46] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Record Repayment</h3>
            <p className="text-emerald-100 text-xs mt-0.5">
              Installment #{installment.installment_number} · Due {new Date(installment.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
          <button onClick={onClose} className="text-emerald-100 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Due Summary */}
        <div className="bg-[#f8fdf9] border-b border-gray-100 px-6 py-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 mb-1">Principal Due</p>
            <p className="font-bold text-gray-900 text-sm">₹{Number(installment.principal_due).toLocaleString("en-IN")}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Interest Due</p>
            <p className="font-bold text-gray-900 text-sm">₹{Number(installment.interest_due).toLocaleString("en-IN")}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Penalty</p>
            <p className="font-bold text-gray-900 text-sm">₹{Number(installment.penalty_due).toLocaleString("en-IN")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-semibold">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Principal (₹)</label>
              <input
                type="number"
                value={principalPaid}
                onChange={(e) => setPrincipalPaid(e.target.value)}
                min="0"
                step="0.01"
                max={installment.principal_due}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#306e46] text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Interest (₹)</label>
              <input
                type="number"
                value={interestPaid}
                onChange={(e) => setInterestPaid(e.target.value)}
                min="0"
                step="0.01"
                max={installment.interest_due}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#306e46] text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Penalty (₹)</label>
              <input
                type="number"
                value={penaltyPaid}
                onChange={(e) => setPenaltyPaid(e.target.value)}
                min="0"
                step="0.01"
                max={installment.penalty_due}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#306e46] text-sm"
              />
            </div>
          </div>

          {/* Total paying indicator */}
          <div className={`flex items-center justify-between px-4 py-3 rounded-2xl ${isOverpaying ? "bg-red-50 border border-red-200" : "bg-emerald-50 border border-emerald-100"}`}>
            <span className="text-xs font-bold text-gray-600">Total collecting now</span>
            <span className={`font-bold text-base ${isOverpaying ? "text-red-600" : "text-[#306e46]"}`}>
              ₹{totalPaying.toLocaleString("en-IN")}
            </span>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Collected at monthly meeting..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#306e46] text-sm"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isOverpaying || totalPaying <= 0}
              className="flex-1 py-3 rounded-full bg-[#306e46] hover:bg-[#255737] text-white font-bold text-xs transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Posting...</>
              ) : (
                <><CheckCircle className="h-4 w-4" /> Confirm Receipt</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
