"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  ArrowLeft, CheckCircle2, XCircle, Loader2, Users,
  IndianRupee, Save, Calendar, ClipboardCheck, AlertCircle
} from "lucide-react";

interface Member {
  id: string;
  is_leader: boolean;
  profiles: { full_name: string; phone: string } | null;
}

interface AttendanceRow {
  memberId: string;
  name: string;
  present: boolean;
  collectedAmount: string;
  notes: string;
}

interface Meeting {
  id: string;
  meeting_date: string;
  meeting_type: string;
  agenda: string | null;
  status: string;
  notes: string | null;
  shg_id: string;
}

export default function MeetingCollectionPage() {
  const router = useRouter();
  const params = useParams();
  const meetingId = params.id as string;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [isLeader, setIsLeader] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [meetingNotes, setMeetingNotes] = useState("");
  const [totalCollected, setTotalCollected] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [meetingId]);

  useEffect(() => {
    const t = rows.reduce((s, r) => s + (Number(r.collectedAmount) || 0), 0);
    setTotalCollected(t);
  }, [rows]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: mtg, error: mtgErr } = await supabase
        .from("meetings")
        .select("*")
        .eq("id", meetingId)
        .single();
      if (mtgErr || !mtg) throw new Error("Meeting not found.");
      setMeeting(mtg);
      setMeetingNotes(mtg.notes || "");

      // Verify user is a member + check if leader
      const { data: selfMember } = await supabase
        .from("members")
        .select("is_leader")
        .eq("profile_id", user.id)
        .eq("shg_id", mtg.shg_id)
        .single();
      setIsLeader(selfMember?.is_leader ?? false);

      // Fetch all members
      const { data: members } = await supabase
        .from("members")
        .select("id, is_leader, profiles(full_name, phone)")
        .eq("shg_id", mtg.shg_id)
        .eq("status", "ACTIVE")
        .order("is_leader", { ascending: false });

      // Fetch existing attendance records
      const { data: existing } = await supabase
        .from("meeting_attendance")
        .select("*")
        .eq("meeting_id", meetingId);

      const existingMap = new Map((existing || []).map((a: any) => [a.member_id, a]));

      setRows(
        (members || []).map((m: any) => {
          const att = existingMap.get(m.id);
          return {
            memberId: m.id,
            name: m.profiles?.full_name || "Unknown",
            present: att ? att.is_present : false,
            collectedAmount: att ? String(att.collected_amount || 0) : "0",
            notes: att ? att.notes || "" : "",
          };
        })
      );
    } catch (err: any) {
      setError(err.message || "Failed to load meeting.");
    } finally {
      setLoading(false);
    }
  };

  const togglePresence = (memberId: string) => {
    if (meeting?.status === "COMPLETED" && !isLeader) return;
    setRows(prev => prev.map(r =>
      r.memberId === memberId ? { ...r, present: !r.present } : r
    ));
  };

  const updateAmount = (memberId: string, val: string) => {
    setRows(prev => prev.map(r =>
      r.memberId === memberId ? { ...r, collectedAmount: val } : r
    ));
  };

  const markAllPresent = () => setRows(prev => prev.map(r => ({ ...r, present: true })));
  const setAllAmount = (amount: string) => setRows(prev => prev.map(r => ({ ...r, collectedAmount: amount })));

  const handleSave = async (complete: boolean) => {
    setSaving(true);
    setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated.");

      // Upsert attendance records
      const attendanceRecords = rows.map(r => ({
        meeting_id: meetingId,
        member_id: r.memberId,
        is_present: r.present,
        collected_amount: Number(r.collectedAmount) || 0,
        is_collection_done: (Number(r.collectedAmount) || 0) > 0,
        notes: r.notes,
      }));

      const { error: attErr } = await supabase
        .from("meeting_attendance")
        .upsert(attendanceRecords, { onConflict: "meeting_id,member_id" });
      if (attErr) throw attErr;

      // If savings collected, create savings transactions for each member
      if (totalCollected > 0) {
        const savingsInserts = rows
          .filter(r => Number(r.collectedAmount) > 0)
          .map(r => ({
            account_id: null, // will be set via group pool
            shg_id: meeting!.shg_id,
            member_id: r.memberId,
            transaction_type: "DEPOSIT",
            amount: Number(r.collectedAmount),
            notes: `Meeting collection — ${new Date(meeting!.meeting_date).toLocaleDateString("en-IN")}`,
            recorded_by: user.id,
            transaction_date: meeting!.meeting_date,
          }));

        // Get group pool account id
        const { data: pool } = await supabase
          .from("savings_accounts")
          .select("id")
          .eq("shg_id", meeting!.shg_id)
          .is("member_id", null)
          .single();

        if (pool) {
          const txnsWithAccount = savingsInserts.map(t => ({ ...t, account_id: pool.id }));
          await supabase.from("savings_transactions").insert(txnsWithAccount);
          // Update pool balance
          await supabase.rpc("increment_savings_balance", {
            p_account_id: pool.id,
            p_amount: totalCollected,
          }).catch(() => {}); // non-fatal if RPC doesn't exist
        }
      }

      // Update meeting status + notes
      if (complete) {
        const { error: mtgErr } = await supabase
          .from("meetings")
          .update({ status: "COMPLETED", notes: meetingNotes })
          .eq("id", meetingId);
        if (mtgErr) throw mtgErr;
        setMeeting(prev => prev ? { ...prev, status: "COMPLETED" } : prev);
      } else {
        await supabase.from("meetings").update({ notes: meetingNotes }).eq("id", meetingId);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const presentCount = rows.filter(r => r.present).length;
  const attendanceRate = rows.length > 0 ? Math.round((presentCount / rows.length) * 100) : 0;

  if (loading) return (
    <div className="min-h-screen bg-[#fcf9f2] flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-[#306e46] animate-spin" />
    </div>
  );

  if (!meeting) return (
    <div className="min-h-screen bg-[#fcf9f2] p-8 text-center">
      <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
      <p className="text-gray-600 font-semibold">{error || "Meeting not found."}</p>
      <button onClick={() => router.push("/meetings")} className="mt-4 px-6 py-2.5 bg-[#306e46] text-white rounded-full text-sm font-bold">Back</button>
    </div>
  );

  const isCompleted = meeting.status === "COMPLETED";

  return (
    <div className="min-h-screen bg-[#fcf9f2] pb-20">
      {/* Header */}
      <div className="bg-[#306e46] text-white py-6 px-6 rounded-b-[2rem] shadow-md">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => router.push("/meetings")} className="flex items-center gap-2 text-emerald-100 hover:text-white mb-3 text-sm font-semibold">
            <ArrowLeft className="h-4 w-4" /> Back to Meetings
          </button>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-200">{meeting.meeting_type}</span>
                {isCompleted && (
                  <span className="text-xs bg-emerald-500/30 text-emerald-100 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Completed
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-extrabold">
                {new Date(meeting.meeting_date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </h1>
              {meeting.agenda && <p className="text-emerald-100 text-sm mt-1">{meeting.agenda}</p>}
            </div>
            {/* Summary stats */}
            <div className="flex gap-3">
              <div className="bg-white/10 rounded-2xl px-4 py-2 text-center">
                <p className="text-lg font-extrabold">{presentCount}/{rows.length}</p>
                <p className="text-emerald-200 text-[10px]">Present</p>
              </div>
              <div className="bg-white/10 rounded-2xl px-4 py-2 text-center">
                <p className="text-lg font-extrabold">₹{totalCollected.toLocaleString("en-IN")}</p>
                <p className="text-emerald-200 text-[10px]">Collected</p>
              </div>
            </div>
          </div>

          {/* Attendance bar */}
          <div className="mt-4 h-2 bg-white/20 rounded-full">
            <div className="h-2 bg-[#f28c28] rounded-full transition-all" style={{ width: `${attendanceRate}%` }} />
          </div>
          <p className="text-emerald-200 text-xs mt-1">{attendanceRate}% attendance rate</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 mt-6 space-y-5">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-semibold">
            <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
          </div>
        )}
        {saved && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-semibold">
            <CheckCircle2 className="h-4 w-4" /> Saved successfully!
          </div>
        )}

        {/* Quick actions (leader only) */}
        {isLeader && !isCompleted && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-2">
            <button onClick={markAllPresent} className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors">
              ✓ Mark All Present
            </button>
            <button onClick={() => setAllAmount("100")} className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors">
              ₹100 for All
            </button>
            <button onClick={() => setAllAmount("200")} className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors">
              ₹200 for All
            </button>
            <button onClick={() => setAllAmount("500")} className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors">
              ₹500 for All
            </button>
          </div>
        )}

        {/* Collection Sheet */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-[#306e46]" />
            <h2 className="font-bold text-gray-900">Attendance & Collection Sheet</h2>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
            <div className="col-span-1">Present</div>
            <div className="col-span-5">Member</div>
            <div className="col-span-3">Collection (₹)</div>
            <div className="col-span-3">Notes</div>
          </div>

          <div className="divide-y divide-gray-50">
            {rows.map((row) => (
              <div key={row.memberId} className={`grid grid-cols-12 gap-2 px-6 py-3.5 items-center transition-colors ${row.present ? "bg-emerald-50/30" : ""}`}>
                {/* Attendance toggle */}
                <div className="col-span-1">
                  <button
                    onClick={() => togglePresence(row.memberId)}
                    disabled={isCompleted && !isLeader}
                    className={`h-7 w-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      row.present
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-gray-300 text-transparent hover:border-emerald-300"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Name */}
                <div className="col-span-5">
                  <p className="text-sm font-semibold text-gray-900">{row.name}</p>
                  {!row.present && <p className="text-[10px] text-red-400 font-semibold">Absent</p>}
                </div>

                {/* Amount */}
                <div className="col-span-3">
                  <input
                    type="number"
                    value={row.collectedAmount}
                    onChange={(e) => updateAmount(row.memberId, e.target.value)}
                    disabled={(isCompleted && !isLeader) || !row.present}
                    min="0"
                    className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-sm font-semibold focus:outline-none focus:border-[#306e46] disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Notes */}
                <div className="col-span-3">
                  <input
                    type="text"
                    value={row.notes}
                    onChange={(e) => setRows(prev => prev.map(r => r.memberId === row.memberId ? { ...r, notes: e.target.value } : r))}
                    disabled={isCompleted && !isLeader}
                    placeholder="optional"
                    className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[#306e46] disabled:opacity-40"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Totals row */}
          <div className="grid grid-cols-12 gap-2 px-6 py-4 bg-[#306e46]/5 border-t border-[#306e46]/10 items-center">
            <div className="col-span-1" />
            <div className="col-span-5">
              <p className="text-xs font-bold text-gray-700">{presentCount} present · {rows.length - presentCount} absent</p>
            </div>
            <div className="col-span-3">
              <p className="text-sm font-extrabold text-[#306e46]">₹{totalCollected.toLocaleString("en-IN")}</p>
              <p className="text-[10px] text-gray-400">Total</p>
            </div>
          </div>
        </div>

        {/* Meeting notes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Meeting Notes / Minutes</label>
          <textarea
            rows={3}
            value={meetingNotes}
            onChange={(e) => setMeetingNotes(e.target.value)}
            disabled={isCompleted && !isLeader}
            placeholder="Record discussion points, decisions made, action items..."
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#306e46] resize-none disabled:opacity-50"
          />
        </div>

        {/* Action buttons */}
        {isLeader && !isCompleted && (
          <div className="flex gap-3">
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full border-2 border-[#306e46] text-[#306e46] font-bold text-sm hover:bg-[#306e46]/5 transition-colors disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Draft"}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#306e46] text-white font-bold text-sm hover:bg-[#255737] transition-colors shadow-md disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" />
              {saving ? "Saving..." : "Mark Meeting Complete"}
            </button>
          </div>
        )}

        {isCompleted && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center text-emerald-700 text-sm font-semibold">
            ✅ This meeting has been completed and locked.
            {isLeader && " Leaders can still edit attendance above."}
          </div>
        )}
      </div>
    </div>
  );
}
