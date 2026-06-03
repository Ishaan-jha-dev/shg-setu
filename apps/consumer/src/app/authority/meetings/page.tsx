import { Plus, CalendarCheck, ChevronRight, Users, Clock } from "lucide-react";
import Link from "next/link";

const MEETINGS = [
  {
    id: "m1",
    date: "2025-05-28",
    type: "Monthly",
    present: 18,
    total: 20,
    attendancePct: 90,
    status: "COMPLETED",
    hasMinutes: true,
  },
  {
    id: "m2",
    date: "2025-04-26",
    type: "Monthly",
    present: 16,
    total: 20,
    attendancePct: 80,
    status: "COMPLETED",
    hasMinutes: true,
  },
  {
    id: "m3",
    date: "2025-03-29",
    type: "Monthly",
    present: 19,
    total: 20,
    attendancePct: 95,
    status: "COMPLETED",
    hasMinutes: false,
  },
  {
    id: "m4",
    date: "2025-06-28",
    type: "Monthly",
    present: 0,
    total: 20,
    attendancePct: 0,
    status: "SCHEDULED",
    hasMinutes: false,
  },
];

function AttendanceBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? "#30D158" : pct >= 60 ? "#FF9F0A" : "#FF453A";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[13px] font-semibold w-10 text-right" style={{ color }}>{pct}%</span>
    </div>
  );
}

export default function MeetingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[13px] text-[#636366] font-medium uppercase tracking-wider">Saraswati Mahila Samiti</p>
          <h1 className="text-[26px] font-bold text-[#F5F5F7] tracking-tight mt-1">Meetings & Attendance</h1>
        </div>
        <button className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Schedule Meeting
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Meetings", value: MEETINGS.filter(m => m.status === "COMPLETED").length },
          { label: "Avg. Attendance", value: `${Math.round(MEETINGS.filter(m=>m.status==="COMPLETED").reduce((a,b)=>a+b.attendancePct,0)/MEETINGS.filter(m=>m.status==="COMPLETED").length)}%` },
          { label: "Upcoming", value: MEETINGS.filter(m => m.status === "SCHEDULED").length },
        ].map(stat => (
          <div key={stat.label} className="card p-4">
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Upcoming Banner */}
      {MEETINGS.filter(m => m.status === "SCHEDULED").map(m => (
        <div key={m.id} className="card p-4 border-[rgba(10,132,255,0.3)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[rgba(10,132,255,0.15)] flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#0A84FF]" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#F5F5F7]">Upcoming: {m.type} Meeting</p>
              <p className="text-[13px] text-[#636366]">{new Date(m.date).toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
            </div>
          </div>
          <Link href={`/dashboard/meetings/${m.id}`} className="btn btn-primary">
            <CalendarCheck className="w-4 h-4" />
            Mark Attendance
          </Link>
        </div>
      ))}

      {/* Meetings List */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
          <h2 className="text-[15px] font-semibold text-[#F5F5F7]">Meeting History</h2>
        </div>
        <div className="divide-y divide-[rgba(255,255,255,0.04)]">
          {MEETINGS.filter(m => m.status === "COMPLETED").map((meeting) => (
            <Link
              key={meeting.id}
              href={`/dashboard/meetings/${meeting.id}`}
              className="flex items-center px-5 py-4 hover:bg-[rgba(255,255,255,0.03)] transition-colors group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-[10px] bg-[rgba(255,255,255,0.05)] flex items-center justify-center shrink-0">
                  <CalendarCheck className="w-4 h-4 text-[#636366]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-[#F5F5F7] truncate">{meeting.type} Meeting</p>
                  <p className="text-[12px] text-[#636366]">{new Date(meeting.date).toLocaleDateString("en-IN", { dateStyle: "medium" })}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 mx-6">
                <Users className="w-4 h-4 text-[#636366]" />
                <span className="text-[14px] text-[#98989F]">{meeting.present}/{meeting.total}</span>
              </div>

              <div className="w-40">
                <AttendanceBar pct={meeting.attendancePct} />
              </div>

              {meeting.hasMinutes && (
                <span className="badge badge-blue ml-4">Minutes</span>
              )}

              <ChevronRight className="w-4 h-4 text-[#3A3A3C] group-hover:text-[#636366] ml-4 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
