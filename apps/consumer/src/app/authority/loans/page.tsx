"use client";

import { useState } from "react";
import { Plus, ChevronRight, X, CheckCircle2, XCircle, Clock } from "lucide-react";
import Link from "next/link";

const LOANS = [
  {
    id: "l1", member: "Meena Kumari", principal: 10000, interest: 2, outstanding: 6800,
    purpose: "Goat farming equipment", status: "ACTIVE", disbursed: "2025-01-15",
    emiAmount: 1200, missedPayments: 0, nextDue: "2025-06-28",
  },
  {
    id: "l2", member: "Radha Devi", principal: 8000, interest: 2, outstanding: 3200,
    purpose: "Agarbatti making supplies", status: "ACTIVE", disbursed: "2024-11-10",
    emiAmount: 800, missedPayments: 1, nextDue: "2025-06-28",
  },
  {
    id: "l3", member: "Geeta Singh", principal: 5000, interest: 2, outstanding: 12500,
    purpose: "Handloom loom repair", status: "REQUESTED", disbursed: null,
    emiAmount: 500, missedPayments: 0, nextDue: null,
  },
  {
    id: "l4", member: "Savita Tiwari", principal: 6000, interest: 2, outstanding: 0,
    purpose: "Vegetable farming seeds", status: "CLOSED", disbursed: "2024-07-01",
    emiAmount: 600, missedPayments: 0, nextDue: null,
  },
];

const STATS = {
  totalDisbursed: LOANS.filter(l => l.status !== "REQUESTED").reduce((s, l) => s + l.principal, 0),
  totalOutstanding: LOANS.filter(l => l.status === "ACTIVE").reduce((s, l) => s + l.outstanding, 0),
  activeCount: LOANS.filter(l => l.status === "ACTIVE").length,
  pendingApproval: LOANS.filter(l => l.status === "REQUESTED").length,
};

function StatusBadge({ status }: { status: string }) {
  if (status === "ACTIVE") return <span className="badge badge-green">Active</span>;
  if (status === "REQUESTED") return <span className="badge badge-orange flex items-center gap-1"><Clock className="w-3 h-3" />Pending</span>;
  if (status === "CLOSED") return <span className="badge badge-gray">Closed</span>;
  return null;
}

export default function LoansPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[13px] text-[#636366] font-medium uppercase tracking-wider">Saraswati Mahila Samiti</p>
          <h1 className="text-[26px] font-bold text-[#F5F5F7] tracking-tight mt-1">Internal Loans</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          New Loan Request
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="stat-value">₹{(STATS.totalDisbursed/1000).toFixed(0)}K</div>
          <div className="stat-label">Total Disbursed</div>
        </div>
        <div className="card p-4">
          <div className="stat-value text-[#FF9F0A]">₹{STATS.totalOutstanding.toLocaleString()}</div>
          <div className="stat-label">Outstanding</div>
        </div>
        <div className="card p-4">
          <div className="stat-value text-[#30D158]">{STATS.activeCount}</div>
          <div className="stat-label">Active Loans</div>
        </div>
        <div className="card p-4">
          <div className="stat-value text-[#FF9F0A]">{STATS.pendingApproval}</div>
          <div className="stat-label">Pending Approval</div>
        </div>
      </div>

      {/* Pending Approvals */}
      {LOANS.filter(l => l.status === "REQUESTED").map(loan => (
        <div key={loan.id} className="card p-5 border border-[rgba(255,159,10,0.3)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="badge badge-orange"><Clock className="w-3 h-3" />Pending Approval</span>
              </div>
              <p className="text-[16px] font-bold text-[#F5F5F7]">{loan.member}</p>
              <p className="text-[13px] text-[#636366] mt-0.5">Purpose: {loan.purpose}</p>
              <p className="text-[24px] font-bold text-[#F5F5F7] mt-3">₹{loan.principal.toLocaleString()}</p>
              <p className="text-[12px] text-[#636366]">at {loan.interest}% per month</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button className="btn btn-danger">
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <button className="btn btn-success">
                <CheckCircle2 className="w-4 h-4" />
                Approve
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Active Loans */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
          <h2 className="text-[15px] font-semibold text-[#F5F5F7]">All Loans</h2>
        </div>
        <div className="divide-y divide-[rgba(255,255,255,0.04)]">
          {LOANS.map(loan => {
            const paidPct = loan.principal > 0 ? Math.round((1 - loan.outstanding / loan.principal) * 100) : 100;
            return (
              <Link
                key={loan.id}
                href={`/dashboard/loans/${loan.id}`}
                className="flex items-center px-5 py-4 hover:bg-[rgba(255,255,255,0.03)] transition-colors group gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[14px] font-semibold text-[#F5F5F7]">{loan.member}</p>
                    <StatusBadge status={loan.status} />
                    {loan.missedPayments > 0 && <span className="badge badge-red">{loan.missedPayments} missed</span>}
                  </div>
                  <p className="text-[12px] text-[#636366] truncate">{loan.purpose}</p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[15px] font-bold text-[#F5F5F7]">₹{loan.principal.toLocaleString()}</p>
                  <p className="text-[12px] text-[#636366]">principal</p>
                </div>

                {loan.status === "ACTIVE" && (
                  <div className="w-32 shrink-0">
                    <div className="flex justify-between text-[11px] text-[#636366] mb-1">
                      <span>Repaid</span>
                      <span>{paidPct}%</span>
                    </div>
                    <div className="h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                      <div className="h-full bg-[#30D158] rounded-full" style={{ width: `${paidPct}%` }} />
                    </div>
                  </div>
                )}

                <ChevronRight className="w-4 h-4 text-[#3A3A3C] group-hover:text-[#636366] transition-colors" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* New Loan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="card p-6 w-[420px] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[18px] font-bold text-[#F5F5F7]">New Loan Request</h3>
              <button className="btn btn-ghost p-1" onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="section-header block mb-2">Member</label>
                <select className="input" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <option value="">Select member...</option>
                  <option>Anita Devi</option>
                  <option>Sunita Sharma</option>
                  <option>Meena Kumari</option>
                </select>
              </div>
              <div>
                <label className="section-header block mb-2">Loan Amount (₹)</label>
                <input type="number" placeholder="5000" className="input" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="section-header block mb-2">Interest Rate (%/month)</label>
                  <input type="number" placeholder="2" className="input" defaultValue="2" />
                </div>
                <div>
                  <label className="section-header block mb-2">Repayment Months</label>
                  <input type="number" placeholder="12" className="input" />
                </div>
              </div>
              <div>
                <label className="section-header block mb-2">Purpose</label>
                <input type="text" placeholder="e.g. Goat farming, handicraft supplies..." className="input" />
              </div>
              <button className="btn btn-primary w-full mt-2" onClick={() => setShowModal(false)}>
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
