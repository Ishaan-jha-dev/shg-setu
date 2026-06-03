"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function MarkCompleteButton({ enrollmentId }: { enrollmentId: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleMark = async () => {
    setLoading(true);
    await supabase.from("skill_enrollments").update({
      status: "COMPLETED",
      completion_date: new Date().toISOString().split("T")[0],
      progress_percent: 100,
    }).eq("id", enrollmentId);
    setLoading(false);
    setDone(true);
    router.refresh();
  };

  return (
    <button
      onClick={handleMark}
      disabled={loading || done}
      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-violet-50 text-violet-700 text-xs font-bold hover:bg-violet-100 transition-colors disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
      {done ? "Marked Complete!" : "Mark as Completed"}
    </button>
  );
}
