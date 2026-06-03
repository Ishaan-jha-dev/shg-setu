import { ChevronLeft, Download, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

const MEMBER = { id: "1", name: "Anita Devi", phone: "+91 9876543210", role: "PRESIDENT", joinedAt: "Jan 2023" };

const TRANSACTIONS = [
  { id: "t1", date: "2025-05-28", type: "DEPOSIT", amount: 500, balance: 12500, note: "May 2025 contribution" },
  { id: "t2", date: "2025-04-26", type: "DEPOSIT", amount: 500, balance: 12000, note: "Apr 2025 contribution" },
  { id: "t3", date: "2025-03-29", type: "DEPOSIT", amount: 500, balance: 11500, note: "Mar 2025 contribution" },
  { id: "t4", date: "2025-02-22", type: "DEPOSIT", amount: 500, balance: 11000, note: "Feb 2025 contribution" },
  { id: "t5", date: "2025-01-25", type: "DEPOSIT", amount: 500, balance: 10500, note: "Jan 2025 contribution" },
  { id: "t6", date: "2024-12-28", type: "WITHDRAWAL", amount: -2000, balance: 10000, note: "Emergency withdrawal — approved by group" },
  { id: "t7", date: "2024-11-23", type: "DEPOSIT", amount: 500, balance: 12000, note: "Nov 2024 contribution" },
  { id: "t8", date: "2024-10-26", type: "DEPOSIT", amount: 500, balance: 11500, note: "Oct 2024 contribution" },
];

export default function MemberPassbookPage({ params }: { params: { memberId: string } }) {
  const currentBalance = TRANSACTIONS[0]?.balance ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/savings" className="btn btn-ghost px-2">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div>
          <p className="text-[13px] text-[#636366] font-medium uppercase tracking-wider">Savings Passbook</p>
          <h1 className="text-[24px] font-bold text-[#F5F5F7] tracking-tight">{MEMBER.name}</h1>
        </div>
        <button className="btn btn-ghost ml-auto">
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      {/* Passbook Header */}
      <div className="card p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[rgba(255,255,255,0.06)] flex items-center justify-center text-[22px] font-bold text-[#98989F]">
            {MEMBER.name.charAt(0)}
          </div>
          <div>
            <p className="text-[18px] font-bold text-[#F5F5F7]">{MEMBER.name}</p>
            <p className="text-[13px] text-[#636366]">{MEMBER.role} · Joined {MEMBER.joinedAt}</p>
            <p className="text-[13px] text-[#636366]">{MEMBER.phone}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[13px] text-[#636366] mb-1">Current Balance</p>
          <p className="text-[32px] font-bold text-[#30D158]">₹{currentBalance.toLocaleString()}</p>
        </div>
      </div>

      {/* Transaction Ledger */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-[#F5F5F7]">Transaction History</h2>
          <span className="badge badge-gray">{TRANSACTIONS.length} entries</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Balance After</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {TRANSACTIONS.map((txn) => (
              <tr key={txn.id}>
                <td><span className="text-[#636366]">{txn.date}</span></td>
                <td>
                  <div className="flex items-center gap-1.5">
                    {txn.type === "DEPOSIT"
                      ? <><TrendingUp className="w-4 h-4 text-[#30D158]" /><span className="badge badge-green">Deposit</span></>
                      : <><TrendingDown className="w-4 h-4 text-[#FF453A]" /><span className="badge badge-red">Withdrawal</span></>
                    }
                  </div>
                </td>
                <td>
                  <span className={`font-bold text-[15px] ${txn.amount > 0 ? "text-[#30D158]" : "text-[#FF453A]"}`}>
                    {txn.amount > 0 ? "+" : ""}₹{Math.abs(txn.amount).toLocaleString()}
                  </span>
                </td>
                <td><span className="font-semibold text-[#F5F5F7]">₹{txn.balance.toLocaleString()}</span></td>
                <td><span className="text-[#636366]">{txn.note}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
