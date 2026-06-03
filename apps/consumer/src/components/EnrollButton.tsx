"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2, BookOpen } from "lucide-react";

interface Props { programId: string; memberId: string; }

export default function EnrollButton({ programId, memberId }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const enroll = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("skill_enrollments").insert({
      program_id: programId,
      member_id: memberId,
      status: "ENROLLED",
    });
    router.refresh();
  };

  return (
    <button
      onClick={enroll}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><BookOpen className="h-4 w-4" /> Enroll Now</>}
    </button>
  );
}
