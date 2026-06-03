"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  ArrowLeft, Plus, Trash2, Save, Loader2, Type, Hash,
  List, ToggleLeft, MapPin, CheckSquare
} from "lucide-react";

type FieldType = "text" | "number" | "select" | "yes_no" | "gps" | "textarea" | "date";

interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string;
}

const FIELD_TYPES: { value: FieldType; label: string; icon: any; desc: string }[] = [
  { value: "text", label: "Short Text", icon: Type, desc: "Single line answer" },
  { value: "textarea", label: "Long Text", icon: Type, desc: "Multi-line paragraph" },
  { value: "number", label: "Number", icon: Hash, desc: "Numeric value" },
  { value: "select", label: "Dropdown", icon: List, desc: "Choose one option" },
  { value: "yes_no", label: "Yes / No", icon: ToggleLeft, desc: "Boolean question" },
  { value: "date", label: "Date", icon: CheckSquare, desc: "Date picker" },
  { value: "gps", label: "GPS Location", icon: MapPin, desc: "Capture coordinates" },
];

export default function NewSurveyPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const addField = (type: FieldType) => {
    setFields(prev => [...prev, {
      name: `field_${Date.now()}`,
      label: "",
      type,
      required: false,
      options: type === "select" ? "Option 1\nOption 2\nOption 3" : undefined,
    }]);
  };

  const updateField = (idx: number, updates: Partial<FormField>) => {
    setFields(prev => prev.map((f, i) => i === idx ? { ...f, ...updates } : f));
  };

  const removeField = (idx: number) => {
    setFields(prev => prev.filter((_, i) => i !== idx));
  };

  const moveField = (idx: number, dir: -1 | 1) => {
    const next = idx + dir;
    if (next < 0 || next >= fields.length) return;
    const arr = [...fields];
    [arr[idx], arr[next]] = [arr[next], arr[idx]];
    setFields(arr);
  };

  const handleSave = async () => {
    if (!title.trim()) { setError("Please enter a form title."); return; }
    if (fields.length === 0) { setError("Please add at least one question."); return; }
    const emptyLabels = fields.filter(f => !f.label.trim());
    if (emptyLabels.length > 0) { setError("All questions must have a label."); return; }

    setSaving(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const parsedFields = fields.map(f => ({
      name: f.label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""),
      label: f.label,
      type: f.type,
      required: f.required,
      options: f.options ? f.options.split("\n").map(o => o.trim()).filter(Boolean) : undefined,
    }));

    const { error: saveErr } = await supabase.from("survey_forms").insert({
      title,
      description,
      fields: parsedFields,
      created_by: user.id,
    });

    if (saveErr) { setError(saveErr.message); setSaving(false); return; }
    router.push("/surveys");
  };

  return (
    <div className="min-h-screen bg-[#fcf9f2] pb-20">
      <div className="bg-[#306e46] text-white py-6 px-6 rounded-b-[2rem] shadow-md">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => router.push("/surveys")} className="flex items-center gap-2 text-emerald-100 hover:text-white mb-3 text-sm font-semibold">
            <ArrowLeft className="h-4 w-4" /> Back to Surveys
          </button>
          <h1 className="text-2xl font-extrabold">Design New Form</h1>
          <p className="text-emerald-100 text-sm mt-1">Build a custom data collection form for field use.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 mt-6 space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-semibold">{error}</div>
        )}

        {/* Form metadata */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Form Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Household Baseline Survey"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#306e46] font-bold text-lg"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="What is this form for? Who should fill it?"
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#306e46] text-sm resize-none"
            />
          </div>
        </div>

        {/* Field list */}
        {fields.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Questions ({fields.length})</h2>
            {fields.map((field, idx) => {
              const FieldIcon = FIELD_TYPES.find(t => t.value === field.type)?.icon || Type;
              return (
                <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-7 w-7 rounded-lg bg-[#306e46]/10 flex items-center justify-center flex-shrink-0">
                      <FieldIcon className="h-4 w-4 text-[#306e46]" />
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase">{FIELD_TYPES.find(t => t.value === field.type)?.label}</span>
                    <div className="flex items-center gap-1 ml-auto">
                      <button onClick={() => moveField(idx, -1)} disabled={idx === 0} className="h-6 w-6 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-30 flex items-center justify-center text-xs">↑</button>
                      <button onClick={() => moveField(idx, 1)} disabled={idx === fields.length - 1} className="h-6 w-6 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 disabled:opacity-30 flex items-center justify-center text-xs">↓</button>
                      <button onClick={() => removeField(idx)} className="h-6 w-6 rounded-lg bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 flex items-center justify-center">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={field.label}
                    onChange={e => updateField(idx, { label: e.target.value })}
                    placeholder="Question label *"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#306e46] text-sm font-semibold mb-2"
                  />

                  {field.type === "select" && (
                    <div>
                      <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Options (one per line)</label>
                      <textarea
                        value={field.options}
                        onChange={e => updateField(idx, { options: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#306e46] text-xs resize-none"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={e => updateField(idx, { required: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-xs text-gray-500 font-semibold">Required field</span>
                  </label>
                </div>
              );
            })}
          </div>
        )}

        {/* Add field buttons */}
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Add Question</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FIELD_TYPES.map(ft => (
              <button
                key={ft.value}
                onClick={() => addField(ft.value)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:border-[#306e46] hover:text-[#306e46] hover:bg-[#306e46]/5 transition-colors text-left"
              >
                <ft.icon className="h-4 w-4 flex-shrink-0" />
                <div>
                  <div className="font-bold">{ft.label}</div>
                  <div className="text-[9px] text-gray-400">{ft.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-[#306e46] text-white font-bold hover:bg-[#255737] transition-colors shadow-lg disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {saving ? "Saving Form..." : `Save Form (${fields.length} questions)`}
        </button>
      </div>
    </div>
  );
}
