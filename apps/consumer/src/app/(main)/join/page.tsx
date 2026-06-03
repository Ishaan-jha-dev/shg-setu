"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Users, Building2, Calendar, CreditCard, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

const STEPS = [
  { id: 1, title: "Group Details", icon: Users },
  { id: 2, title: "Bank Account", icon: CreditCard },
  { id: 3, title: "Confirm", icon: CheckCircle },
];

export default function JoinPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    formation_date: "",
    meeting_frequency: "MONTHLY",
    registration_number: "",
    bank_name: "",
    bank_account_number: "",
    is_leader: true,
  });

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // 1. Create the SHG
    const { data: shg, error: shgErr } = await supabase
      .from("shgs")
      .insert({
        name: form.name,
        formation_date: form.formation_date,
        meeting_frequency: form.meeting_frequency,
        registration_number: form.registration_number || null,
        bank_name: form.bank_name || null,
        bank_account_number: form.bank_account_number || null,
        created_by: user.id,
        status: "ACTIVE",
      })
      .select()
      .single();

    if (shgErr) { setError(shgErr.message); setLoading(false); return; }

    // 2. Add user as member (leader)
    const { data: member, error: memberErr } = await supabase
      .from("members")
      .insert({
        shg_id: shg.id,
        profile_id: user.id,
        joined_date: new Date().toISOString().split("T")[0],
        is_leader: form.is_leader,
        status: "ACTIVE",
      })
      .select()
      .single();

    if (memberErr) { setError(memberErr.message); setLoading(false); return; }

    // 3. Create the group savings pool account
    const accNum = `SAV-${shg.id.slice(0, 8).toUpperCase()}`;
    await supabase.from("savings_accounts").insert({
      shg_id: shg.id,
      member_id: null,
      account_number: accNum,
      balance: 0,
      status: "ACTIVE",
    });

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#fcf9f2] flex flex-col items-center justify-center px-4 py-16">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <img src="/logo.png" alt="Setu" className="h-12 w-12 rounded-full border border-[#306e46]/20" />
        <div>
          <div className="text-2xl font-extrabold text-[#306e46]">Setu <span className="text-[#f28c28]">SHG</span></div>
          <div className="text-xs text-gray-500 tracking-widest uppercase">Saath • Vikas • Samriddhi</div>
        </div>
      </div>

      <div className="w-full max-w-lg">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                step === s.id ? "bg-[#306e46] text-white shadow-lg" :
                step > s.id ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"
              }`}>
                <s.icon className="h-4 w-4" />
                {s.title}
              </div>
              {i < STEPS.length - 1 && <div className={`w-6 h-0.5 ${step > s.id ? "bg-emerald-400" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600">{error}</div>
          )}

          {/* Step 1: Group Details */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-[#1a1a1a] mb-1">Register Your SHG</h2>
                <p className="text-gray-500 text-sm">Tell us about your Self-Help Group</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Group Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => update("name", e.target.value)}
                  placeholder="e.g., Savitri Mahila Mandal"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#306e46] focus:ring-2 focus:ring-[#306e46]/10 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Formation Date *</label>
                <input
                  type="date"
                  value={form.formation_date}
                  onChange={e => update("formation_date", e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#306e46] focus:ring-2 focus:ring-[#306e46]/10 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Meeting Frequency</label>
                <select
                  value={form.meeting_frequency}
                  onChange={e => update("meeting_frequency", e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#306e46] bg-white text-sm"
                >
                  <option value="WEEKLY">Weekly</option>
                  <option value="BIWEEKLY">Bi-weekly (Fortnight)</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Registration Number <span className="text-gray-400 font-normal">(Optional)</span></label>
                <input
                  type="text"
                  value={form.registration_number}
                  onChange={e => update("registration_number", e.target.value)}
                  placeholder="e.g., NRLM/UP/2024/0012"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#306e46] focus:ring-2 focus:ring-[#306e46]/10 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Role</label>
                <div className="flex gap-3">
                  {[{ val: true, label: "Group Leader" }, { val: false, label: "Member" }].map(opt => (
                    <button
                      key={String(opt.val)}
                      type="button"
                      onClick={() => update("is_leader", opt.val)}
                      className={`flex-1 py-3 rounded-2xl text-sm font-semibold border transition-all ${
                        form.is_leader === opt.val
                          ? "bg-[#306e46] text-white border-[#306e46]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-[#306e46]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Bank Account */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-[#1a1a1a] mb-1">Bank Account Details</h2>
                <p className="text-gray-500 text-sm">Link your group's bank account for savings tracking</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bank Name <span className="text-gray-400 font-normal">(Optional)</span></label>
                <input
                  type="text"
                  value={form.bank_name}
                  onChange={e => update("bank_name", e.target.value)}
                  placeholder="e.g., Bank of Baroda, SBI"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#306e46] focus:ring-2 focus:ring-[#306e46]/10 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Account Number <span className="text-gray-400 font-normal">(Optional)</span></label>
                <input
                  type="text"
                  value={form.bank_account_number}
                  onChange={e => update("bank_account_number", e.target.value)}
                  placeholder="e.g., 3456789012"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#306e46] focus:ring-2 focus:ring-[#306e46]/10 text-sm"
                />
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
                <p className="font-semibold mb-1">💡 Why link a bank account?</p>
                <p>Linking your SHG bank account helps track real deposits, withdrawals, and loan disbursements. You can skip this step and add it later from the Savings page.</p>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-[#1a1a1a] mb-1">Confirm & Register</h2>
                <p className="text-gray-500 text-sm">Review your group details before creating</p>
              </div>
              <div className="bg-[#f9fdf9] border border-emerald-100 rounded-2xl divide-y divide-gray-100">
                {[
                  { label: "Group Name", value: form.name },
                  { label: "Formation Date", value: new Date(form.formation_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
                  { label: "Meeting Frequency", value: form.meeting_frequency },
                  { label: "Your Role", value: form.is_leader ? "Group Leader" : "Member" },
                  { label: "Bank", value: form.bank_name || "Not added" },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center px-5 py-3.5">
                    <span className="text-sm text-gray-500">{row.label}</span>
                    <span className="text-sm font-semibold text-[#1a1a1a]">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-800">
                By registering, you confirm you are an authorized member of this Self-Help Group.
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 px-6 py-3 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => {
                  if (step === 1 && (!form.name || !form.formation_date)) {
                    setError("Please fill in the Group Name and Formation Date.");
                    return;
                  }
                  setError("");
                  setStep(s => s + 1);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#306e46] text-white text-sm font-bold hover:bg-[#255737] transition-all shadow-lg shadow-[#306e46]/20"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#f28c28] text-white text-sm font-bold hover:bg-[#d97a20] transition-all shadow-lg shadow-[#f28c28]/20 disabled:opacity-60"
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : <><CheckCircle className="h-4 w-4" /> Create SHG</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
