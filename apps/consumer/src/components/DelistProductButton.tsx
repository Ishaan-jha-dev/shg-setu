"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { EyeOff, Loader2 } from "lucide-react";

export default function DelistProductButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelist = async () => {
    if (!confirm) { setConfirm(true); return; }
    setLoading(true);
    await supabase.from("marketplace_products").update({ is_listed: false }).eq("id", productId);
    setLoading(false);
    router.refresh();
  };

  return (
    <button
      onClick={handleDelist}
      disabled={loading}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors border ${
        confirm
          ? "bg-red-600 text-white border-red-600 hover:bg-red-700"
          : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
      } disabled:opacity-60`}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <EyeOff className="h-3.5 w-3.5" />}
      {confirm ? "Confirm Delist" : "Delist"}
    </button>
  );
}
