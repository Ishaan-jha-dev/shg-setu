"use client";

import { useState } from "react";
import { ChevronLeft, Plus, CheckCircle2, Circle, X } from "lucide-react";
import Link from "next/link";

const LOAN = {
  id: "l1", member: "Meena Kumari", principal: 10000, interest: 2,
  outstanding: 6800, purpose: "Goat farming equipment",
  status: "ACTIVE", disbursed: "2025-01-15",
  emiAmount: 1200, months: 10,
};

const REPAYMENTS = [
  { id: "r1", date: "2025-05-28", amount: 1200, type: "Principal+Interest", status: "PAID" },
  { id: "r2", date: "2025-04-26", amount: 1200, type: "Principal+Interest", status: "PAID" },
  { id: "r3", date: "2025-03-29", amount: 1200, type: "Principal+Interest", status: "PAID" },
  { id: "r4", date: "2025-02-22", amount: 1200, type: "Principal+Interest", status: "PAID" },
  { id: "r5", date: "2025-06-28", amount: 1200, type: "Principal+Interest", status: "UPCOMING" },
  { id: "r6", date: "2025-07-28", amount: 1200, type: "Principal+Interest", status: "UPCOMING" },
  { id: "r7", date: "2025-08-28", amount: 1200, type: "Principal+Interest", status: "UPCOMING" },
];

export default function LoanDetailPage({ params }: { params: { id: string } }) {
  const [showModal, setShowModal] = useState(false);
  const paidCount = REPAYMENTS.filter(r => r.status === "PAID").length;
  const totalCount = REPAYMENTS.length;
  const paidPct = Math.round((paidCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/loans" className="btn btn-ghost px-2">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div>
          <p className="text-[13px] text-[#636366] font-medium uppercase tracking-wider">Loan Details</p>
          <h1 className="text-[24px] font-bold text-[#F5F5F7] tracking-tight">{LOAN.member}</h1>
        </div>
        <button className="btn btn-primary ml-auto" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          Record Repayment
        </button>
      </div>

      {/* Loan Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="stat-value">₹{LOAN.principal.toLocaleString()}</div>
          <div className="stat-label">Principal</div>
        </div>
        <div className="card p-4">
          <div className="stat-value text-[#FF9F0A]">₹{LOAN.outstanding.toLocaleString()}</div>
          <div className="stat-label">Outstanding</div>
        </div>
        <div className="card p-4">
          <div className="stat-value text-[#30D158]">₹{(LOAN.principal - LOAN.outstanding).toLocaleString()}</div>
          <div className="stat-label">Repaid</div>
        </div>
        <div className="card p-4">
          <div className="stat-value">{LOAN.interest}%</div>
          <div className="stat-label">Rate / Month</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card p-5">
        <div className="flex justify-between items-center mb-3">
          <p className="text-[14px] font-semibold text-[#F5F5F7]">Repayment Progress</p>
          <span className="text-[14px] font-bold text-[#30D158]">{paidCount}/{totalCount} installments paid</span>
        </div>
        <div className="h-2 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
          <div className="h-full bg-[#30D158] rounded-full transition-all" style={{ width: `${paidPct}%` }} />
        </div>
        <div className="flex justify-between mt-2">
          <p className="text-[12px] text-[#636366]">Purpose: {LOAN.purpose}</p>
          <p className="text-[12px] text-[#636366]">Disbursed {LOAN.disbursed}</p>
        </div>
      </div>

      {/* Repayment Schedule */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
          <h2 className="text-[15px] font-semibold text-[#F5F5F7]">Repayment Schedule</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Due Date</th>
              <th>EMI Amount</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {REPAYMENTS.map((r) => (
              <tr key={r.id}>
                <td>
                  {r.status === "PAID"
                    ? <span className="flex items-center gap-1.5 text-[#30D158]"><CheckCircle2 className="w-4 h-4" />Paid</span>
                    : <span className="flex items-center gap-1.5 text-[#636366]"><Circle className="w-4 h-4" />Upcoming</span>
                  }
                </td>
                <td><span className={r.status === "UPCOMING" ? "text-[#FF9F0A] font-medium" : "text-[#636366]"}>{r.date}</span></td>
                <td><span className="font-semibold text-[#F5F5F7]">₹{r.amount.toLocaleString()}</span></td>
                <td><span className="text-[#636366] text-[13px]">{r.type}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Repayment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="card p-6 w-[380px] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[18px] font-bold text-[#F5F5F7]">Record Repayment</h3>
              <button className="btn btn-ghost p-1" onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="section-header block mb-2">Borrower</label>
                <p className="text-[15px] font-semibold text-[#F5F5F7]">{LOAN.member}</p>
              </div>
              <div>
                <label className="section-header block mb-2">Amount Paid (₹)</label>
                <input type="number" placeholder={String(LOAN.emiAmount)} className="input" defaultValue={LOAN.emiAmount} />
              </div>
              <div>
                <label className="section-header block mb-2">Payment Date</label>
                <input type="date" className="input" defaultValue={new Date().toISOString().split("T")[0]} />
              </div>
              <div>
                <label className="section-header block mb-2">Notes</label>
                <input type="text" placeholder="e.g. Cash received in meeting" className="input" />
              </div>
              <button className="btn btn-primary w-full" onClick={() => setShowModal(false)}>
                Confirm Repayment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
