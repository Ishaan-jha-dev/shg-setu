"use client";

import { useState } from "react";
import { Plus, TrendingUp, Download, ChevronRight, X } from "lucide-react";
import Link from "next/link";

const SAVINGS_DATA = [
  { id: "1", name: "Anita Devi", balance: 12500, lastDeposit: 500, lastDate: "2025-05-28", months: 28 },
  { id: "2", name: "Sunita Sharma", balance: 11200, lastDeposit: 500, lastDate: "2025-05-28", months: 28 },
  { id: "3", name: "Meena Kumari", balance: 10800, lastDeposit: 500, lastDate: "2025-05-28", months: 28 },
  { id: "4", name: "Radha Devi", balance: 9400, lastDeposit: 500, lastDate: "2025-05-28", months: 26 },
  { id: "5", name: "Geeta Singh", balance: 8200, lastDeposit: 500, lastDate: "2025-05-28", months: 24 },
  { id: "6", name: "Kamla Yadav", balance: 7800, lastDeposit: 500, lastDate: "2025-05-28", months: 22 },
  { id: "7", name: "Savita Tiwari", balance: 6900, lastDeposit: 500, lastDate: "2025-05-28", months: 20 },
  { id: "8", name: "Pushpa Gupta", balance: 5400, lastDeposit: 0, lastDate: "2025-04-26", months: 18 },
];

const TOTAL_POOL = SAVINGS_DATA.reduce((s, m) => s + m.balance, 0);

export default function SavingsPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState("");
  const [amount, setAmount] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[13px] text-[#636366] font-medium uppercase tracking-wider">Saraswati Mahila Samiti</p>
          <h1 className="text-[26px] font-bold text-[#F5F5F7] tracking-tight mt-1">Savings Ledger</h1>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" />
            Record Savings
          </button>
        </div>
      </div>

      {/* Group Pool Banner */}
      <div className="card p-6 flex items-center justify-between">
        <div>
          <p className="text-[13px] text-[#636366] mb-1">Total Group Pool</p>
          <p className="text-[36px] font-bold text-[#F5F5F7] tracking-tight">₹{TOTAL_POOL.toLocaleString()}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <TrendingUp className="w-4 h-4 text-[#30D158]" />
            <span className="text-[13px] text-[#30D158] font-medium">₹4,000 this month</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[13px] text-[#636366] mb-1">Net Lending Capacity</p>
          <p className="text-[28px] font-bold text-[#30D158]">₹{(TOTAL_POOL - 22500).toLocaleString()}</p>
          <p className="text-[12px] text-[#636366] mt-1">after active loans</p>
        </div>
      </div>

      {/* Member Savings Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
          <h2 className="text-[15px] font-semibold text-[#F5F5F7]">Member Savings</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Total Balance</th>
              <th>Last Deposit</th>
              <th>Last Date</th>
              <th>Months Active</th>
              <th>Passbook</th>
            </tr>
          </thead>
          <tbody>
            {SAVINGS_DATA.map((m) => (
              <tr key={m.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center text-[13px] font-semibold text-[#636366]">
                      {m.name.charAt(0)}
                    </div>
                    <span className="font-medium text-[#F5F5F7]">{m.name}</span>
                  </div>
                </td>
                <td><span className="font-bold text-[#30D158]">₹{m.balance.toLocaleString()}</span></td>
                <td>
                  {m.lastDeposit > 0 
                    ? <span className="text-[#F5F5F7] font-medium">₹{m.lastDeposit}</span>
                    : <span className="badge badge-red">Missed</span>
                  }
                </td>
                <td><span className="text-[#636366]">{m.lastDate}</span></td>
                <td><span className="badge badge-gray">{m.months} months</span></td>
                <td>
                  <Link href={`/dashboard/savings/${m.id}`} className="btn btn-ghost text-[#0A84FF] px-2">
                    View <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Record Savings Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="card p-6 w-[380px] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[18px] font-bold text-[#F5F5F7]">Record Savings</h3>
              <button className="btn btn-ghost p-1" onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="section-header block mb-2">Member</label>
                <select
                  className="input"
                  value={selectedMember}
                  onChange={e => setSelectedMember(e.target.value)}
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <option value="">Select member...</option>
                  {SAVINGS_DATA.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="section-header block mb-2">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="500"
                  className="input"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="section-header block mb-2">Date</label>
                <input type="date" className="input" defaultValue={new Date().toISOString().split("T")[0]} />
              </div>
              <div>
                <label className="section-header block mb-2">Notes (optional)</label>
                <input type="text" placeholder="e.g. May 2025 contribution" className="input" />
              </div>
              <button
                className="btn btn-primary w-full mt-2"
                onClick={() => setShowModal(false)}
              >
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
