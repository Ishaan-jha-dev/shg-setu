"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { CalendarPlus, Loader2, X } from "lucide-react";

export default function NewMeetingButton({ shgId }: { shgId: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ meeting_date: "", meeting_type: "REGULAR", agenda: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("meetings").insert({
      shg_id: shgId,
      meeting_date: form.meeting_date,
      meeting_type: form.meeting_type,
      agenda: form.agenda,
      status: "SCHEDULED",
      conducted_by: user?.id,
    });
    setOpen(false);
    setLoading(false);
    router.refresh();
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#306e46] text-white text-sm font-bold hover:bg-[#255737] shadow-lg shadow-[#306e46]/20">
        <CalendarPlus className="h-4 w-4" /> Schedule Meeting
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Schedule Meeting</h3>
              <button onClick={() => setOpen(false)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Meeting Date *</label>
                <input type="date" value={form.meeting_date} onChange={e => setForm(f => ({ ...f, meeting_date: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#306e46] text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Type</label>
                <select value={form.meeting_type} onChange={e => setForm(f => ({ ...f, meeting_type: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm">
                  <option value="REGULAR">Regular Meeting</option>
                  <option value="SPECIAL">Special Meeting</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Agenda</label>
                <input type="text" value={form.agenda} onChange={e => setForm(f => ({ ...f, agenda: e.target.value }))}
                  placeholder="e.g., Monthly savings collection + loan review"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#306e46] text-sm" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setOpen(false)} className="flex-1 py-3 rounded-full border border-gray-200 text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={handleSubmit} disabled={loading || !form.meeting_date}
                className="flex-1 py-3 rounded-full bg-[#306e46] text-white text-sm font-bold hover:bg-[#255737] disabled:opacity-60">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
