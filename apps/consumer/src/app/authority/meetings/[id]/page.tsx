"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Clock, ChevronLeft, Save, FileText } from "lucide-react";
import Link from "next/link";

const MOCK_MEMBERS = [
  { id: "1", name: "Anita Devi", role: "PRESIDENT" },
  { id: "2", name: "Sunita Sharma", role: "SECRETARY" },
  { id: "3", name: "Meena Kumari", role: "TREASURER" },
  { id: "4", name: "Radha Devi", role: "MEMBER" },
  { id: "5", name: "Geeta Singh", role: "MEMBER" },
  { id: "6", name: "Kamla Yadav", role: "MEMBER" },
  { id: "7", name: "Savita Tiwari", role: "MEMBER" },
  { id: "8", name: "Pushpa Gupta", role: "MEMBER" },
];

type Status = "PRESENT" | "ABSENT" | "LATE";

export default function MeetingDetailPage({ params }: { params: { id: string } }) {
  const [attendance, setAttendance] = useState<Record<string, Status>>(
    Object.fromEntries(MOCK_MEMBERS.map(m => [m.id, "PRESENT"]))
  );
  const [minutes, setMinutes] = useState("");
  const [saved, setSaved] = useState(false);

  const toggle = (memberId: string) => {
    const cycle: Status[] = ["PRESENT", "LATE", "ABSENT"];
    const current = attendance[memberId];
    const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];
    setAttendance(prev => ({ ...prev, [memberId]: next }));
  };

  const counts = {
    PRESENT: Object.values(attendance).filter(s => s === "PRESENT").length,
    LATE: Object.values(attendance).filter(s => s === "LATE").length,
    ABSENT: Object.values(attendance).filter(s => s === "ABSENT").length,
  };

  const handleSave = () => setSaved(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/meetings" className="btn btn-ghost px-2">
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div>
          <p className="text-[13px] text-[#636366] font-medium uppercase tracking-wider">Monthly Meeting</p>
          <h1 className="text-[24px] font-bold text-[#F5F5F7] tracking-tight">Mark Attendance</h1>
        </div>
      </div>

      {/* Summary Counters */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 border-[rgba(48,209,88,0.2)]">
          <div className="stat-value text-[#30D158]">{counts.PRESENT}</div>
          <div className="stat-label">Present</div>
        </div>
        <div className="card p-4 border-[rgba(255,159,10,0.2)]">
          <div className="stat-value text-[#FF9F0A]">{counts.LATE}</div>
          <div className="stat-label">Late</div>
        </div>
        <div className="card p-4 border-[rgba(255,69,58,0.2)]">
          <div className="stat-value text-[#FF453A]">{counts.ABSENT}</div>
          <div className="stat-label">Absent</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Grid */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
            <p className="text-[14px] font-semibold text-[#F5F5F7]">
              Tap to toggle — Present → Late → Absent
            </p>
          </div>
          <div className="divide-y divide-[rgba(255,255,255,0.04)]">
            {MOCK_MEMBERS.map(member => {
              const status = attendance[member.id];
              return (
                <button
                  key={member.id}
                  onClick={() => toggle(member.id)}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[rgba(255,255,255,0.03)] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center text-[13px] font-semibold text-[#636366]">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-[#F5F5F7]">{member.name}</p>
                      <p className="text-[11px] text-[#636366]">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {status === "PRESENT" && (
                      <>
                        <span className="text-[12px] font-semibold text-[#30D158]">Present</span>
                        <CheckCircle2 className="w-5 h-5 text-[#30D158]" />
                      </>
                    )}
                    {status === "LATE" && (
                      <>
                        <span className="text-[12px] font-semibold text-[#FF9F0A]">Late</span>
                        <Clock className="w-5 h-5 text-[#FF9F0A]" />
                      </>
                    )}
                    {status === "ABSENT" && (
                      <>
                        <span className="text-[12px] font-semibold text-[#FF453A]">Absent</span>
                        <XCircle className="w-5 h-5 text-[#FF453A]" />
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Meeting Minutes */}
        <div className="card p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#636366]" />
            <h2 className="text-[15px] font-semibold text-[#F5F5F7]">Meeting Minutes</h2>
          </div>
          <textarea
            value={minutes}
            onChange={e => setMinutes(e.target.value)}
            placeholder="Record what was discussed in today's meeting: topics, decisions, action items..."
            className="input flex-1 resize-none h-48"
          />
          <button
            onClick={handleSave}
            className={`btn w-full ${saved ? "btn-success" : "btn-primary"}`}
          >
            <Save className="w-4 h-4" />
            {saved ? "Attendance Saved!" : "Save Attendance & Minutes"}
          </button>
        </div>
      </div>
    </div>
  );
}
