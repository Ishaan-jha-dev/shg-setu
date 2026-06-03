"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Award, Loader2, X, CheckCircle } from "lucide-react";

interface Props {
  schemeId: string;
  shgId: string;
  memberId: string;
  appliedById: string;
  schemeName: string;
  maxAmount?: number;
}

export default function GrantApplyButton({ schemeId, shgId, memberId, appliedById, schemeName, maxAmount }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [amountRequested, setAmountRequested] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleApply = async () => {
    setLoading(true);
    setError("");
    const { error: err } = await supabase.from("grant_applications").insert({
      scheme_id: schemeId,
      shg_id: shgId,
      member_id: memberId,
      applied_by: appliedById,
      status: "APPLIED",
      amount_requested: Number(amountRequested) || null,
      notes: notes || null,
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setLoading(false);
    setSuccess(true);
    setTimeout(() => { setOpen(false); setSuccess(false); router.refresh(); }, 1500);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex-1 py-2.5 rounded-2xl bg-[#306e46] text-white text-sm font-bold hover:bg-[#255737] transition-colors shadow-sm"
      >
        Apply Now
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Apply for Scheme</h3>
                <p className="text-violet-100 text-xs mt-0.5">{schemeName}</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-violet-100 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            {success ? (
              <div className="p-10 text-center">
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                <p className="font-bold text-gray-900">Application Submitted!</p>
                <p className="text-xs text-gray-500 mt-1">Your application is under review.</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs">{error}</div>}

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Amount Requested (₹) {maxAmount && <span className="text-gray-300 font-normal">Max ₹{maxAmount.toLocaleString("en-IN")}</span>}
                  </label>
                  <input
                    type="number"
                    value={amountRequested}
                    onChange={e => setAmountRequested(e.target.value)}
                    max={maxAmount}
                    placeholder="Enter amount you are requesting"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-violet-500 text-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Purpose / Notes</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Describe how your SHG will use this grant, eligibility details..."
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-violet-500 text-sm resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-1">
                  <button onClick={() => setOpen(false)} className="flex-1 py-3 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={loading}
                    className="flex-1 py-3 rounded-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-1.5"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Award className="h-4 w-4" /> Submit Application</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
