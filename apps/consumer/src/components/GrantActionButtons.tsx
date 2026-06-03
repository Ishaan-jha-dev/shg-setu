"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";

interface Props {
  applicationId: string;
  requestedAmount: number;
}

export default function GrantActionButtons({ applicationId, requestedAmount }: Props) {
  const [loading, setLoading] = useState(false);
  const [approvedAmount, setApprovedAmount] = useState(requestedAmount?.toString() || "");
  const router = useRouter();
  const supabase = createClient();

  const handleAction = async (status: "APPROVED" | "REJECTED") => {
    setLoading(true);
    const updates: any = { status };
    if (status === "APPROVED") {
      updates.amount_approved = Number(approvedAmount) || 0;
    }
    
    await supabase.from("grant_applications").update(updates).eq("id", applicationId);
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
      <div>
        <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Approved Amount (₹)</label>
        <input
          type="number"
          value={approvedAmount}
          onChange={e => setApprovedAmount(e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold focus:outline-none focus:border-indigo-500 disabled:opacity-50"
        />
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => handleAction("REJECTED")}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-white border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-50 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />} Reject
        </button>
        <button
          onClick={() => handleAction("APPROVED")}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Approve
        </button>
      </div>
    </div>
  );
}
