"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { CreditCard, Loader2, X, Calculator } from "lucide-react";

interface LoanProduct {
  id: string;
  name: string;
  description: string;
  min_principal: number;
  max_principal: number;
  interest_rate_per_period: number;
  min_repayment_periods: number;
  max_repayment_periods: number;
}

interface Props {
  shgId: string;
  memberId: string;
  products: LoanProduct[];
}

export default function LoanApplyModal({ shgId, memberId, products }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [form, setForm] = useState({
    loan_product_id: products[0]?.id ?? "",
    principal_amount: "",
    repayment_periods: "",
    purpose: "",
  });

  const selectedProduct = products.find(p => p.id === form.loan_product_id);
  const principal = Number(form.principal_amount) || 0;
  const periods = Number(form.repayment_periods) || 1;
  const rate = (selectedProduct?.interest_rate_per_period ?? 2) / 100;
  const emi = principal > 0 && periods > 0
    ? Math.round((principal * rate * Math.pow(1 + rate, periods)) / (Math.pow(1 + rate, periods) - 1))
    : 0;
  const totalPayable = emi * periods;
  const totalInterest = totalPayable - principal;

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const accNum = `LOAN-${Date.now().toString().slice(-8)}`;
    const disbDate = new Date();
    const closeDate = new Date();
    closeDate.setMonth(closeDate.getMonth() + periods);

    const { data: loan, error: loanErr } = await supabase.from("loans").insert({
      shg_id: shgId,
      member_id: memberId,
      loan_product_id: form.loan_product_id,
      loan_account_number: accNum,
      principal_amount: principal,
      outstanding_principal: principal,
      interest_rate: selectedProduct?.interest_rate_per_period ?? 2,
      repayment_periods: periods,
      disbursement_date: disbDate.toISOString().split("T")[0],
      expected_closure_date: closeDate.toISOString().split("T")[0],
      purpose: form.purpose,
      status: "PENDING",
      created_by: user.id,
    }).select().single();

    if (loanErr) { setError(loanErr.message); setLoading(false); return; }

    // Generate repayment schedule
    const schedule = Array.from({ length: periods }, (_, i) => {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i + 1);
      return {
        loan_id: loan.id,
        installment_number: i + 1,
        due_date: dueDate.toISOString().split("T")[0],
        principal_due: Math.round(principal / periods),
        interest_due: Math.round(emi - principal / periods),
        status: "PENDING",
      };
    });

    await supabase.from("loan_repayments").insert(schedule);

    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#306e46] text-white text-sm font-bold hover:bg-[#255737] transition-all shadow-lg shadow-[#306e46]/20"
      >
        <CreditCard className="h-4 w-4" /> Apply for Loan
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#1a1a1a]">Apply for a Loan</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}

            <div className="space-y-5">
              {/* Loan Product Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Loan Type *</label>
                <div className="grid grid-cols-1 gap-2">
                  {products.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, loan_product_id: p.id }))}
                      className={`text-left px-4 py-3 rounded-2xl border text-sm transition-all ${
                        form.loan_product_id === p.id
                          ? "border-[#306e46] bg-[#306e46]/5 text-[#306e46]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{p.interest_rate_per_period}%/month · Max ₹{Number(p.max_principal).toLocaleString("en-IN")}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Loan Amount (₹) *</label>
                <input
                  type="number"
                  value={form.principal_amount}
                  onChange={e => setForm(f => ({ ...f, principal_amount: e.target.value }))}
                  placeholder={`Min ₹${selectedProduct?.min_principal?.toLocaleString("en-IN") ?? "500"}`}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#306e46] text-lg font-bold"
                />
              </div>

              {/* Tenure */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Repayment Tenure (Months) *</label>
                <input
                  type="number"
                  value={form.repayment_periods}
                  onChange={e => setForm(f => ({ ...f, repayment_periods: e.target.value }))}
                  placeholder={`${selectedProduct?.min_repayment_periods ?? 1}–${selectedProduct?.max_repayment_periods ?? 24} months`}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#306e46] text-sm"
                />
              </div>

              {/* EMI Preview */}
              {emi > 0 && (
                <div className="bg-[#f0f7f3] rounded-2xl p-4 border border-emerald-100">
                  <div className="flex items-center gap-2 text-[#306e46] font-bold text-sm mb-3">
                    <Calculator className="h-4 w-4" /> EMI Calculator
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      { label: "Monthly EMI", value: `₹${emi.toLocaleString("en-IN")}` },
                      { label: "Total Interest", value: `₹${totalInterest.toLocaleString("en-IN")}` },
                      { label: "Total Payable", value: `₹${totalPayable.toLocaleString("en-IN")}` },
                    ].map(s => (
                      <div key={s.label}>
                        <div className="text-lg font-bold text-[#1a1a1a]">{s.value}</div>
                        <div className="text-xs text-gray-500">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Purpose */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Purpose of Loan</label>
                <textarea
                  value={form.purpose}
                  onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                  placeholder="Describe what the loan will be used for..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#306e46] text-sm resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setOpen(false)} className="flex-1 py-3 rounded-full border border-gray-200 text-sm font-semibold text-gray-600">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !form.principal_amount || !form.repayment_periods}
                className="flex-1 py-3 rounded-full bg-[#306e46] text-white text-sm font-bold hover:bg-[#255737] disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
