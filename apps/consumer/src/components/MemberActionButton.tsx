"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { MoreVertical, UserX, UserCheck, Crown, Loader2 } from "lucide-react";

interface Props {
  memberId: string;
  currentStatus: string;
  currentIsLeader: boolean;
}

export default function MemberActionButton({ memberId, currentStatus, currentIsLeader }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAction = async (action: "activate" | "deactivate" | "promote" | "demote") => {
    setLoading(true);
    setOpen(false);
    try {
      let update: Record<string, any> = {};
      if (action === "activate") update = { status: "ACTIVE" };
      if (action === "deactivate") update = { status: "INACTIVE" };
      if (action === "promote") update = { is_leader: true };
      if (action === "demote") update = { is_leader: false };

      const { error } = await supabase.from("members").update(update).eq("id", memberId);
      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="h-8 w-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-44">
            {currentStatus === "ACTIVE" ? (
              <button
                onClick={() => handleAction("deactivate")}
                className="w-full flex items-center gap-2 px-4 py-3 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <UserX className="h-4 w-4" /> Mark Inactive
              </button>
            ) : (
              <button
                onClick={() => handleAction("activate")}
                className="w-full flex items-center gap-2 px-4 py-3 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <UserCheck className="h-4 w-4" /> Reactivate
              </button>
            )}
            {currentIsLeader ? (
              <button
                onClick={() => handleAction("demote")}
                className="w-full flex items-center gap-2 px-4 py-3 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors border-t border-gray-50"
              >
                <Crown className="h-4 w-4" /> Remove Leader Role
              </button>
            ) : (
              <button
                onClick={() => handleAction("promote")}
                className="w-full flex items-center gap-2 px-4 py-3 text-xs font-semibold text-amber-600 hover:bg-amber-50 transition-colors border-t border-gray-50"
              >
                <Crown className="h-4 w-4" /> Promote as Leader
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
