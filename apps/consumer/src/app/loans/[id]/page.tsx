"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  ArrowLeft, CreditCard, Calendar, AlertCircle, CheckCircle2,
  Clock, Loader2, TrendingDown, IndianRupee, ChevronDown, ChevronUp, RefreshCw
} from "lucide-react";
import RecordRepaymentModal from "@/components/RecordRepaymentModal";

interface Loan {
  id: string;
  loan_account_number: string;
  principal_amount: number;
  outstanding_principal: number;
  interest_rate: number;
  repayment_periods: number;
  repayment_frequency: string;
  disbursement_date: string;
  expected_closure_date: string;
  purpose: string;
  status: string;
  shg_id: string;
  loan_products: { name: string } | null;
}

interface Installment {
  id: string;
  installment_number: number;
  due_date: string;
  principal_due: number;
  interest_due: number;
  principal_paid: number;
  interest_paid: number;
  penalty_due: number;
  penalty_paid: number;
  status: string;
  paid_date: string | null;
  notes: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "Pending", color: "text-amber-700 bg-amber-50 border-amber-200", icon: Clock },
  PARTIAL: { label: "Partial", color: "text-blue-700 bg-blue-50 border-blue-200", icon: TrendingDown },
  PAID: { label: "Paid", color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  OVERDUE: { label: "Overdue", color: "text-red-700 bg-red-50 border-red-200", icon: AlertCircle },
};

export default function LoanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const loanId = params.id as string;

  const [loan, setLoan] = useState<Loan | null>(null);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLeader, setIsLeader] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchLoanData();
  }, [loanId]);

  const fetchLoanData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // Fetch loan with product info
      const { data: loanData, error: loanErr } = await supabase
        .from("loans")
        .select("*, loan_products(name)")
        .eq("id", loanId)
        .single();

      if (loanErr || !loanData) throw new Error("Loan not found.");
      setLoan(loanData);

      // Check if user is leader (to enable repayment recording)
      const { data: member } = await supabase
        .from("members")
        .select("is_leader")
        .eq("profile_id", user.id)
        .eq("shg_id", loanData.shg_id)
        .single();
      setIsLeader(member?.is_leader ?? false);

      // Fetch repayment schedule
      const { data: schData, error: schErr } = await supabase
        .from("loan_repayments")
        .select("*")
        .eq("loan_id", loanId)
        .order("installment_number", { ascending: true });

      if (schErr) throw schErr;

      // Mark overdue installments
      const today = new Date().toISOString().split("T")[0];
      const enriched = (schData || []).map((inst: Installment) => ({
        ...inst,
        status: inst.status === "PENDING" && inst.due_date < today ? "OVERDUE" : inst.status,
      }));
      setInstallments(enriched);
    } catch (err: any) {
      setError(err.message || "Failed to load loan details.");
    } finally {
      setLoading(false);
    }
  };

  // Derived metrics
  const totalRepaid = installments.filter(i => i.status === "PAID").length;
  const overdue = installments.filter(i => i.status === "OVERDUE").length;
  const totalInterestCollected = installments.reduce((s, i) => s + Number(i.interest_paid), 0);
  const progress = loan
    ? Math.round(((Number(loan.principal_amount) - Number(loan.outstanding_principal)) / Number(loan.principal_amount)) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcf9f2] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#306e46] animate-spin mb-3" />
        <p className="text-gray-500 text-sm">Loading loan details...</p>
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="min-h-screen bg-[#fcf9f2] p-8 text-center">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <p className="font-semibold text-gray-700 mb-4">{error || "Loan not found."}</p>
          <button onClick={() => router.push("/loans")} className="px-6 py-2.5 bg-[#306e46] text-white rounded-full text-sm font-bold">
            Back to Loans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf9f2] pb-16">
      {/* Header */}
      <div className="bg-[#306e46] text-white py-8 px-6 md:px-12 shadow-sm rounded-b-[2rem]">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push("/loans")}
            className="flex items-center gap-2 text-emerald-100 hover:text-white mb-3 text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Loans
          </button>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-emerald-200 text-xs mb-1">A/C: {loan.loan_account_number ?? "–"}</p>
              <h1 className="text-2xl font-extrabold">{(loan.loan_products as any)?.name ?? "Loan"}</h1>
              <p className="text-emerald-100 text-sm mt-1">
                {loan.interest_rate}% / month · {loan.repayment_periods} installments · {loan.repayment_frequency}
              </p>
            </div>
            <div className="text-right">
              <p className="text-emerald-200 text-xs mb-1">Outstanding</p>
              <p className="text-3xl font-extrabold">₹{Number(loan.outstanding_principal).toLocaleString("en-IN")}</p>
              <p className="text-emerald-200 text-xs mt-0.5">of ₹{Number(loan.principal_amount).toLocaleString("en-IN")}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5 h-2.5 bg-white/20 rounded-full">
            <div
              className="h-2.5 bg-[#f28c28] rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-emerald-100 mt-1.5">
            <span>{progress}% repaid</span>
            {loan.expected_closure_date && (
              <span>Closes {new Date(loan.expected_closure_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 mt-8 space-y-6">
        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Installments Paid", value: `${totalRepaid} / ${installments.length}`, highlight: false },
            { label: "Overdue Installments", value: String(overdue), highlight: overdue > 0 },
            { label: "Interest Collected", value: `₹${totalInterestCollected.toLocaleString("en-IN")}`, highlight: false },
            { label: "Loan Status", value: loan.status, highlight: loan.status === "OVERDUE" },
          ].map((m) => (
            <div key={m.label} className={`bg-white rounded-2xl p-4 border shadow-sm ${m.highlight ? "border-red-200" : "border-gray-100"}`}>
              <p className="text-lg font-bold text-gray-900">{m.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Loan Details Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#306e46]" /> Loan Terms
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            {[
              { label: "Principal Amount", value: `₹${Number(loan.principal_amount).toLocaleString("en-IN")}` },
              { label: "Interest Rate", value: `${loan.interest_rate}% / month` },
              { label: "Frequency", value: loan.repayment_frequency },
              { label: "Disbursement Date", value: loan.disbursement_date ? new Date(loan.disbursement_date).toLocaleDateString("en-IN") : "–" },
              { label: "Expected Closure", value: loan.expected_closure_date ? new Date(loan.expected_closure_date).toLocaleDateString("en-IN") : "–" },
              { label: "Purpose", value: loan.purpose ?? "–" },
            ].map((row) => (
              <div key={row.label}>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-0.5">{row.label}</p>
                <p className="font-semibold text-gray-800">{row.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Repayment Schedule (Fineract style) */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#306e46]" /> Repayment Schedule
            </h2>
            <button
              onClick={fetchLoanData}
              className="text-gray-400 hover:text-[#306e46] transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {installments.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <p className="text-sm font-medium">No installments scheduled yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {installments.map((inst) => {
                const cfg = STATUS_CONFIG[inst.status] ?? STATUS_CONFIG["PENDING"];
                const StatusIcon = cfg.icon;
                const isExpanded = expandedId === inst.id;
                const totalDue = Number(inst.principal_due) + Number(inst.interest_due) + Number(inst.penalty_due);
                const totalPaid = Number(inst.principal_paid) + Number(inst.interest_paid) + Number(inst.penalty_paid);

                return (
                  <div key={inst.id}>
                    <div
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : inst.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                          {inst.installment_number}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            Due {new Date(inst.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                          <p className="text-xs text-gray-400">
                            ₹{Number(inst.principal_due).toLocaleString("en-IN")} principal + ₹{Number(inst.interest_due).toLocaleString("en-IN")} interest
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                        <span className="text-sm font-bold text-gray-900">₹{totalDue.toLocaleString("en-IN")}</span>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                      </div>
                    </div>

                    {/* Expanded Detail Row */}
                    {isExpanded && (
                      <div className="px-6 pb-5 bg-gray-50/50">
                        <div className="grid grid-cols-3 gap-4 text-xs mb-4">
                          <div className="bg-white rounded-xl p-3 border border-gray-100">
                            <p className="text-gray-400 font-bold uppercase tracking-wider mb-1">Principal</p>
                            <p className="font-semibold">Due: ₹{Number(inst.principal_due).toLocaleString("en-IN")}</p>
                            <p className="text-emerald-600 font-semibold">Paid: ₹{Number(inst.principal_paid).toLocaleString("en-IN")}</p>
                          </div>
                          <div className="bg-white rounded-xl p-3 border border-gray-100">
                            <p className="text-gray-400 font-bold uppercase tracking-wider mb-1">Interest</p>
                            <p className="font-semibold">Due: ₹{Number(inst.interest_due).toLocaleString("en-IN")}</p>
                            <p className="text-emerald-600 font-semibold">Paid: ₹{Number(inst.interest_paid).toLocaleString("en-IN")}</p>
                          </div>
                          <div className="bg-white rounded-xl p-3 border border-gray-100">
                            <p className="text-gray-400 font-bold uppercase tracking-wider mb-1">Penalty</p>
                            <p className="font-semibold">Due: ₹{Number(inst.penalty_due).toLocaleString("en-IN")}</p>
                            <p className="text-emerald-600 font-semibold">Paid: ₹{Number(inst.penalty_paid).toLocaleString("en-IN")}</p>
                          </div>
                        </div>

                        {inst.paid_date && (
                          <p className="text-xs text-gray-500 mb-3">
                            Collected on {new Date(inst.paid_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            {inst.notes && ` · ${inst.notes}`}
                          </p>
                        )}

                        {/* Record repayment button — visible if pending/partial + leader */}
                        {["PENDING", "OVERDUE", "PARTIAL"].includes(inst.status) && isLeader && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedInstallment(inst); }}
                            className="w-full py-2.5 rounded-2xl bg-[#306e46] text-white text-xs font-bold hover:bg-[#255737] transition-colors shadow-sm"
                          >
                            Record Repayment
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Repayment Modal */}
      {selectedInstallment && (
        <RecordRepaymentModal
          installment={selectedInstallment}
          loanId={loan.id}
          shgId={loan.shg_id}
          onClose={() => setSelectedInstallment(null)}
          onSuccess={fetchLoanData}
        />
      )}
    </div>
  );
}
