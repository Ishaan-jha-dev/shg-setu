"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Zap, Loader2 } from "lucide-react";

interface Props {
  loanId: string;
  shgId: string;
  principalAmount: number;
}

export default function LoanApprovalActions({ loanId, shgId, principalAmount }: Props) {
  const [loading, setLoading] = useState<"approve" | "reject" | "disburse" | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleApprove = async () => {
    setLoading("approve");
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("loans").update({
      status: "APPROVED",
      approved_by: user?.id,
      approved_at: new Date().toISOString(),
    }).eq("id", loanId);
    setLoading(null);
    router.refresh();
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { setShowRejectInput(true); return; }
    setLoading("reject");
    await supabase.from("loans").update({
      status: "REJECTED",
      rejection_reason: rejectReason,
    }).eq("id", loanId);
    setLoading(null);
    router.refresh();
  };

  const handleDisburse = async () => {
    setLoading("disburse");
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Set loan to ACTIVE
    await supabase.from("loans").update({
      status: "ACTIVE",
      disbursement_date: new Date().toISOString().split("T")[0],
    }).eq("id", loanId);

    // 2. Post journal entry: LOAN_PORTFOLIO (Dr) vs CASH (Cr)
    const txId = `DISB-${Date.now()}`;
    await supabase.from("journal_entries").insert([
      { transaction_id: txId, shg_id: shgId, account_name: "LOAN_PORTFOLIO", is_debit: true, amount: principalAmount, description: `Loan disbursement — ${loanId.slice(0, 8)}` },
      { transaction_id: txId, shg_id: shgId, account_name: "CASH", is_debit: false, amount: principalAmount, description: `Cash disbursed to borrower — ${loanId.slice(0, 8)}` },
    ]);

    setLoading(null);
    router.refresh();
  };

  return (
    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">
      <button
        onClick={handleApprove}
        disabled={loading !== null}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors disabled:opacity-60"
      >
        {loading === "approve" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
        Approve
      </button>

      {showRejectInput ? (
        <div className="flex gap-2 flex-1">
          <input
            type="text"
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Reason for rejection..."
            className="flex-1 px-3 py-1.5 rounded-xl border border-red-200 text-xs focus:outline-none focus:border-red-400"
            autoFocus
          />
          <button
            onClick={handleReject}
            disabled={loading !== null}
            className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-60"
          >
            {loading === "reject" ? <Loader2 className="h-3 w-3 animate-spin" /> : "Confirm Reject"}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowRejectInput(true)}
          disabled={loading !== null}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-bold hover:bg-red-100 transition-colors disabled:opacity-60"
        >
          <XCircle className="h-3.5 w-3.5" /> Reject
        </button>
      )}
    </div>
  );
}

export function LoanDisburseButton({ loanId, shgId, principalAmount }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDisburse = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("loans").update({
      status: "ACTIVE",
      disbursement_date: new Date().toISOString().split("T")[0],
    }).eq("id", loanId);

    const txId = `DISB-${Date.now()}`;
    await supabase.from("journal_entries").insert([
      { transaction_id: txId, shg_id: shgId, account_name: "LOAN_PORTFOLIO", is_debit: true, amount: principalAmount, description: `Loan disbursement — ${loanId.slice(0, 8)}` },
      { transaction_id: txId, shg_id: shgId, account_name: "CASH", is_debit: false, amount: principalAmount, description: `Cash disbursed to borrower` },
    ]);

    setLoading(false);
    router.refresh();
  };

  return (
    <button
      onClick={handleDisburse}
      disabled={loading}
      className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
      Disburse Loan (Mark Active)
    </button>
  );
}
