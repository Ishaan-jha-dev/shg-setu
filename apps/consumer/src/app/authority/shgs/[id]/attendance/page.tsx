import { createClient } from "@/utils/supabase/server";
import { CalendarCheck, Users } from "lucide-react";
import Link from "next/link";

export default async function AttendanceLedgerPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  const { data: meetings, error } = await supabase
    .from("shg_meetings")
    .select("*, meeting_attendance(*, shg_members(users(full_name, phone)))")
    .eq("shg_id", params.id)
    .order("meeting_date", { ascending: false });

  if (error) {
    return <div className="p-4 rounded-lg bg-destructive/10 text-destructive">Failed to load attendance records.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/shgs/${params.id}`} className="text-primary hover:underline font-medium">
          &larr; Back to SHG
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <CalendarCheck className="text-green-500 w-8 h-8" />
          Attendance Ledger
        </h1>
        <p className="text-muted-foreground mt-2">Historical meeting records and member presence.</p>
      </div>

      <div className="grid gap-6">
        {meetings?.map((meeting: any) => {
          const total = meeting.meeting_attendance?.length || 0;
          const present = meeting.meeting_attendance?.filter((a: any) => a.status === 'PRESENT').length || 0;
          const percent = total === 0 ? 0 : Math.round((present / total) * 100);

          return (
            <div key={meeting.id} className="glass-card rounded-2xl overflow-hidden border border-white/5">
              <div className="bg-white/5 p-6 flex justify-between items-center border-b border-white/10">
                <div>
                  <h3 className="text-xl font-bold text-white">Meeting: {new Date(meeting.meeting_date).toLocaleDateString()}</h3>
                  <p className="text-gray-400 mt-1 flex items-center gap-2">
                    <Users className="w-4 h-4" /> {present} / {total} Present ({percent}%)
                  </p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {meeting.meeting_attendance?.map((att: any) => (
                    <div key={att.id} className="flex justify-between items-center p-3 rounded-xl bg-secondary/30 border border-white/5">
                      <span className="text-gray-300 font-medium">
                        {att.shg_members?.users?.full_name || "Unknown"}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        att.status === 'PRESENT' ? 'bg-green-500/20 text-green-400' :
                        att.status === 'ABSENT' ? 'bg-red-500/20 text-red-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {att.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {(!meetings || meetings.length === 0) && (
          <div className="glass-card p-12 text-center rounded-2xl border border-white/5">
            <CalendarCheck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white">No Meetings Found</h3>
            <p className="text-gray-400 mt-2">No attendance records have been synced yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
