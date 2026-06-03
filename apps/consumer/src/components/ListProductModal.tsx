"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Plus, Loader2, X } from "lucide-react";

const CATEGORIES = ["Handicrafts", "Food Products", "Textiles", "Agriculture", "Other"];

export default function ListProductModal({ shgId, memberId }: { shgId: string; memberId: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "Handicrafts", description: "", price_per_unit: "", unit: "piece", quantity_available: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("marketplace_products").insert({
      shg_id: shgId,
      member_id: memberId,
      name: form.name,
      category: form.category,
      description: form.description,
      price_per_unit: Number(form.price_per_unit),
      unit: form.unit,
      quantity_available: Number(form.quantity_available) || 0,
      is_listed: true,
    });
    setOpen(false);
    setLoading(false);
    router.refresh();
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-6 py-3 rounded-full bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700 shadow-lg shadow-cyan-200">
        <Plus className="h-4 w-4" /> List a Product
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">List a Product</h3>
              <button onClick={() => setOpen(false)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              {[
                { label: "Product Name *", field: "name", type: "text", placeholder: "e.g., Hand-embroidered Cushion Cover" },
                { label: "Price per Unit (₹) *", field: "price_per_unit", type: "number", placeholder: "0.00" },
                { label: "Unit", field: "unit", type: "text", placeholder: "piece, kg, litre, dozen..." },
                { label: "Quantity Available", field: "quantity_available", type: "number", placeholder: "0" },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
                  <input type={type} value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-cyan-500 text-sm" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe your product..." rows={2}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-cyan-500 text-sm resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setOpen(false)} className="flex-1 py-3 rounded-full border border-gray-200 text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={handleSubmit} disabled={loading || !form.name || !form.price_per_unit}
                className="flex-1 py-3 rounded-full bg-cyan-600 text-white text-sm font-bold disabled:opacity-60">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "List Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
