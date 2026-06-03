"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Plus, Trash2, ArrowLeft, Save, Loader2, Sparkles } from "lucide-react";

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
  optionsText?: string; // used temporarily in form builder
}

export default function NewSurveyFormPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addField = () => {
    setFields((prev) => [
      ...prev,
      {
        name: `field_${Date.now()}`,
        label: "",
        type: "text",
        required: true,
        optionsText: "",
      },
    ]);
  };

  const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const updateField = (index: number, key: keyof FormField, value: any) => {
    setFields((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      
      // Auto-generate name from label if label changes
      if (key === "label") {
        copy[index].name = value
          .toLowerCase()
          .replace(/[^a-z0-9_]+/g, "_")
          .replace(/^_+|_+$/g, "") || `field_${Date.now()}`;
      }
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError("Please specify a form title.");
      return;
    }
    if (fields.length === 0) {
      setError("Please add at least one question field to the form.");
      return;
    }

    setLoading(true);
    setError("");

    // Prepare fields for Supabase JSON structure
    const formattedFields = fields.map((f) => {
      const fieldData: any = {
        name: f.name,
        label: f.label || "Untitled Question",
        type: f.type,
        required: f.required,
      };
      if (f.type === "select" && f.optionsText) {
        fieldData.options = f.optionsText
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean);
      }
      return fieldData;
    });

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error: insertErr } = await supabase.from("survey_forms").insert({
      title,
      description,
      fields: formattedFields,
      created_by: user?.id || null,
    });

    if (insertErr) {
      setError(insertErr.message);
      setLoading(false);
    } else {
      router.push("/surveys");
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f2] pb-16">
      <div className="bg-[#306e46] text-white py-8 px-6 md:px-12 shadow-sm rounded-b-[2rem] mb-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => router.push("/surveys")}
            className="flex items-center gap-2 text-emerald-100 hover:text-white mb-3 text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Cancel & Go Back
          </button>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
            <Sparkles className="h-7 w-7 text-[#f28c28]" /> Design Survey Form
          </h1>
          <p className="text-emerald-100 text-sm mt-1">Create customized baseline, auditing, or dynamic forms for field operations.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Info */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Form General Details</h2>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Form Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Socioeconomic Baseline Survey"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#306e46] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description / Purpose</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the purpose of this data collection..."
                rows={3}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#306e46] text-sm"
              />
            </div>
          </div>

          {/* Form Fields builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Form Questions ({fields.length})</h2>
              <button
                type="button"
                onClick={addField}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#306e46] text-[#306e46] hover:bg-emerald-50 font-bold text-xs transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Add Question
              </button>
            </div>

            {fields.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-10 text-center text-gray-400">
                No questions added yet. Click "Add Question" to start building your form.
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, idx) => (
                  <div
                    key={field.name}
                    className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm relative group hover:border-[#306e46]/30 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => removeField(idx)}
                      className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Question Label / Prompt</label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateField(idx, "label", e.target.value)}
                          placeholder="e.g., What is your primary occupation?"
                          className="w-full px-4 py-3 rounded-xl border border-gray-150 focus:outline-none focus:border-[#306e46] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Answer Input Type</label>
                        <select
                          value={field.type}
                          onChange={(e) => updateField(idx, "type", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-150 focus:outline-none focus:border-[#306e46] bg-white text-sm"
                        >
                          <option value="text">Text response</option>
                          <option value="number">Numeric entry</option>
                          <option value="select">Multiple choice (dropdown)</option>
                          <option value="gps">GPS Coordinates capture</option>
                        </select>
                      </div>
                    </div>

                    {field.type === "select" && (
                      <div className="mt-4">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                          Multiple Choice Options (comma separated)
                        </label>
                        <input
                          type="text"
                          value={field.optionsText || ""}
                          onChange={(e) => updateField(idx, "optionsText", e.target.value)}
                          placeholder="Option 1, Option 2, Option 3..."
                          className="w-full px-4 py-3 rounded-xl border border-gray-150 focus:outline-none focus:border-[#306e46] text-sm"
                        />
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`req_${field.name}`}
                        checked={field.required}
                        onChange={(e) => updateField(idx, "required", e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-[#306e46] focus:ring-[#306e46]"
                      />
                      <label htmlFor={`req_${field.name}`} className="text-xs font-semibold text-gray-600 cursor-pointer">
                        Is answering this question required?
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full bg-[#f28c28] text-white hover:bg-[#d97a20] font-bold text-sm transition-all shadow-lg shadow-[#f28c28]/20 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Survey Template
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
