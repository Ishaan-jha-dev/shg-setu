import { Download, FileText, TrendingUp, Users, PiggyBank, Landmark } from "lucide-react";

const REPORT_DATA = {
  groupName: "Saraswati Mahila Samiti",
  period: "Jan 2023 – May 2025",
  totalMembers: 20,
  totalSavings: 148500,
  totalLoansDisbursed: 29000,
  totalRepaid: 22200,
  outstandingLoans: 10000,
  avgAttendance: 87,
  meetingsHeld: 28,
};

const SAVINGS_BY_MONTH = [
  { month: "Jan", amount: 8000 },
  { month: "Feb", amount: 9500 },
  { month: "Mar", amount: 10200 },
  { month: "Apr", amount: 9800 },
  { month: "May", amount: 11000 },
];

const ATTENDANCE_BY_MONTH = [
  { month: "Jan", pct: 80 },
  { month: "Feb", pct: 90 },
  { month: "Mar", pct: 95 },
  { month: "Apr", pct: 80 },
  { month: "May", pct: 90 },
];

function MiniBarChart({ data, valueKey, color }: { data: any[]; valueKey: string; color: string }) {
  const max = Math.max(...data.map(d => d[valueKey]));
  return (
    <div className="flex items-end gap-2 h-20 mt-3">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-sm transition-all"
            style={{ height: `${(d[valueKey] / max) * 64}px`, background: color, opacity: 0.8 }}
          />
          <span className="text-[10px] text-[#636366]">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[13px] text-[#636366] font-medium uppercase tracking-wider">Analytics</p>
          <h1 className="text-[26px] font-bold text-[#F5F5F7] tracking-tight mt-1">Reports</h1>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button className="btn btn-primary">
            <FileText className="w-4 h-4" />
            Download PDF Report
          </button>
        </div>
      </div>

      {/* Report Header */}
      <div className="card p-5 flex items-center justify-between">
        <div>
          <p className="text-[18px] font-bold text-[#F5F5F7]">{REPORT_DATA.groupName}</p>
          <p className="text-[13px] text-[#636366] mt-0.5">Period: {REPORT_DATA.period}</p>
        </div>
        <span className="badge badge-green">Active Group</span>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Members", value: REPORT_DATA.totalMembers, icon: Users, color: "#0A84FF" },
          { label: "Group Savings", value: `₹${(REPORT_DATA.totalSavings / 1000).toFixed(1)}K`, icon: PiggyBank, color: "#30D158" },
          { label: "Loans Disbursed", value: `₹${(REPORT_DATA.totalLoansDisbursed / 1000).toFixed(1)}K`, icon: Landmark, color: "#FF9F0A" },
          { label: "Avg. Attendance", value: `${REPORT_DATA.avgAttendance}%`, icon: TrendingUp, color: "#BF5AF2" },
        ].map(m => (
          <div key={m.label} className="card p-5">
            <div className="w-8 h-8 rounded-[8px] mb-3 flex items-center justify-center" style={{ background: `${m.color}20` }}>
              <m.icon className="w-4 h-4" style={{ color: m.color }} />
            </div>
            <div className="stat-value" style={{ color: m.color }}>{m.value}</div>
            <div className="stat-label">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Savings Chart */}
        <div className="card p-5">
          <h2 className="text-[15px] font-semibold text-[#F5F5F7]">Monthly Savings Collection</h2>
          <p className="text-[13px] text-[#636366] mt-0.5">Last 5 months · ₹</p>
          <MiniBarChart data={SAVINGS_BY_MONTH} valueKey="amount" color="#30D158" />
        </div>

        {/* Attendance Chart */}
        <div className="card p-5">
          <h2 className="text-[15px] font-semibold text-[#F5F5F7]">Meeting Attendance Rate</h2>
          <p className="text-[13px] text-[#636366] mt-0.5">Last 5 months · %</p>
          <MiniBarChart data={ATTENDANCE_BY_MONTH} valueKey="pct" color="#0A84FF" />
        </div>

        {/* Financial Summary */}
        <div className="card p-5">
          <h2 className="text-[15px] font-semibold text-[#F5F5F7] mb-4">Loan Summary</h2>
          <div className="space-y-3">
            {[
              { label: "Total Disbursed", value: `₹${REPORT_DATA.totalLoansDisbursed.toLocaleString()}`, color: "#FF9F0A" },
              { label: "Total Repaid", value: `₹${REPORT_DATA.totalRepaid.toLocaleString()}`, color: "#30D158" },
              { label: "Outstanding", value: `₹${REPORT_DATA.outstandingLoans.toLocaleString()}`, color: "#FF453A" },
              { label: "Recovery Rate", value: `${Math.round(REPORT_DATA.totalRepaid / REPORT_DATA.totalLoansDisbursed * 100)}%`, color: "#30D158" },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center py-2 border-b border-[rgba(255,255,255,0.05)]">
                <span className="text-[14px] text-[#98989F]">{row.label}</span>
                <span className="text-[15px] font-bold" style={{ color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Meeting Summary */}
        <div className="card p-5">
          <h2 className="text-[15px] font-semibold text-[#F5F5F7] mb-4">Meeting Summary</h2>
          <div className="space-y-3">
            {[
              { label: "Total Meetings Held", value: REPORT_DATA.meetingsHeld },
              { label: "Average Attendance", value: `${REPORT_DATA.avgAttendance}%` },
              { label: "100% Attendance Meetings", value: "3" },
              { label: "Members with Perfect Attendance", value: "12" },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center py-2 border-b border-[rgba(255,255,255,0.05)]">
                <span className="text-[14px] text-[#98989F]">{row.label}</span>
                <span className="text-[15px] font-bold text-[#F5F5F7]">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
