import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, LogOut, Plus, CheckCircle2, Clock, Users, ClipboardList } from "lucide-react";
import NewMeetingButton from "@/components/NewMeetingButton";

export default async function MeetingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("members")
    .select("*, shgs(*)")
    .eq("profile_id", user.id)
    .single();

  if (!member) redirect("/join");

  const { data: meetings } = await supabase
    .from("meetings")
    .select("*")
    .eq("shg_id", member.shg_id)
    .order("meeting_date", { ascending: false });

  const { data: allMembers } = await supabase
    .from("members")
    .select("id, profiles(full_name, phone)")
    .eq("shg_id", member.shg_id);

  const shg = member.shgs as any;
  const allMeetings = meetings || [];
  const upcoming = allMeetings.filter(m => m.status === "SCHEDULED");
  const completed = allMeetings.filter(m => m.status === "COMPLETED");

  return (
    <div className="min-h-screen bg-[#fcf9f2]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="Setu" className="h-8 w-8 rounded-full border border-[#306e46]/20" />
            <span className="font-bold text-[#306e46]">Meetings</span>
          </Link>
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full hover:text-red-500">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
        <div className="mb-8">
          <p className="text-sm text-gray-500">{shg.name}</p>
          <h1 className="text-3xl font-bold text-[#1a1a1a]">Meeting Management</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Upcoming", value: upcoming.length, icon: Clock, color: "text-amber-600" },
            { label: "Completed", value: completed.length, icon: CheckCircle2, color: "text-emerald-600" },
            { label: "Total Members", value: (allMembers || []).length, icon: Users, color: "text-blue-600" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <s.icon className={`h-5 w-5 mx-auto mb-1 ${s.color}`} />
              <div className="text-2xl font-bold text-[#1a1a1a]">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Schedule Meeting Button */}
        <div className="mb-6">
          <NewMeetingButton shgId={member.shg_id} />
        </div>

        {/* Upcoming Meetings */}
        {upcoming.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">📅 Upcoming Meetings</h2>
            <div className="space-y-3">
              {upcoming.map(m => (
                <div key={m.id} className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#1a1a1a] mb-1">
                        {new Date(m.meeting_date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{m.meeting_type}</span>
                        {m.agenda && <span className="text-xs text-gray-500">{m.agenda}</span>}
                      </div>
                    </div>
                    <Link
                      href={`/meetings/${m.id}`}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#306e46] text-white text-xs font-bold hover:bg-[#255737] transition-colors"
                    >
                      <ClipboardList className="h-3.5 w-3.5" /> Collection Sheet
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Meetings */}
        {completed.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">✅ Completed Meetings</h2>
            <div className="space-y-3">
              {completed.map(m => (
                <div key={m.id} className="bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm text-[#1a1a1a]">
                      {new Date(m.meeting_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{m.notes || "No notes recorded"}</div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {allMeetings.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-6 py-16 text-center">
            <Calendar className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No meetings scheduled yet</p>
            <p className="text-gray-400 text-sm mt-1">Schedule your first SHG meeting to track attendance and collections</p>
          </div>
        )}
      </div>
    </div>
  );
}
