"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Send } from "lucide-react";

interface Props {
  schemeId: string;
  shgId: string;
  memberId: string;
  appliedById: string;
}

export default function GrantApplyButton({ schemeId, shgId, memberId, appliedById }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const apply = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("grant_applications").insert({
      scheme_id: schemeId,
      shg_id: shgId,
      applied_by: appliedById,
      status: "APPLIED",
    });
    router.refresh();
  };

  return (
    <button
      onClick={apply}
      disabled={loading}
      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" />Apply Now</>}
    </button>
  );
}
