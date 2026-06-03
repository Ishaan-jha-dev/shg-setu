"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ClipboardList, Plus, CloudLightning, RefreshCw, Send, Trash2, ArrowLeft, Loader2, MapPin } from "lucide-react";

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

interface SurveyForm {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  created_at: string;
}

interface LocalDraft {
  localId: string;
  formId: string;
  formTitle: string;
  answers: Record<string, any>;
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
}

export default function SurveysPage() {
  const router = useRouter();
  const [forms, setForms] = useState<SurveyForm[]>([]);
  const [drafts, setDrafts] = useState<LocalDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");

  const supabase = createClient();

  useEffect(() => {
    fetchForms();
    loadDrafts();
  }, []);

  const fetchForms = async () => {
    try {
      const { data, error } = await supabase
        .from("survey_forms")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setForms(data || []);
    } catch (err) {
      console.error("Error fetching survey forms:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadDrafts = () => {
    const raw = localStorage.getItem("setu_survey_drafts");
    if (raw) {
      try {
        setDrafts(JSON.parse(raw));
      } catch (e) {
        console.error("Failed to parse drafts:", e);
      }
    }
  };

  const deleteDraft = (localId: string) => {
    const updated = drafts.filter((d) => d.localId !== localId);
    setDrafts(updated);
    localStorage.setItem("setu_survey_drafts", JSON.stringify(updated));
  };

  const handleSync = async () => {
    if (drafts.length === 0) return;
    setSyncing(true);
    setSyncStatus(`Syncing 1 of ${drafts.length}...`);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSyncStatus("Please login to sync data");
      setSyncing(false);
      return;
    }

    let successCount = 0;
    const remainingDrafts: LocalDraft[] = [];

    for (let i = 0; i < drafts.length; i++) {
      const draft = drafts[i];
      setSyncStatus(`Syncing ${i + 1} of ${drafts.length}...`);

      try {
        const { error } = await supabase.from("survey_submissions").insert({
          form_id: draft.formId,
          submitted_by: user.id,
          answers: draft.answers,
          latitude: draft.latitude,
          longitude: draft.longitude,
        });

        if (error) throw error;
        successCount++;
      } catch (err) {
        console.error("Failed to sync draft:", draft, err);
        remainingDrafts.push(draft);
      }
    }

    setDrafts(remainingDrafts);
    localStorage.setItem("setu_survey_drafts", JSON.stringify(remainingDrafts));
    setSyncing(false);
    setSyncStatus(`Successfully synced ${successCount} survey submission(s)!`);
    setTimeout(() => setSyncStatus(""), 4000);
  };

  return (
    <div className="min-h-screen bg-[#fcf9f2] text-gray-900 pb-16">
      {/* Dynamic Earthy Header */}
      <div className="bg-[#306e46] text-white py-8 px-6 md:px-12 shadow-sm rounded-b-[2rem]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-emerald-100 hover:text-white mb-3 text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-extrabold tracking-tight">Surveys & Field Data</h1>
            <p className="text-emerald-100 text-sm mt-1">Collect data in the field offline. Sync when online.</p>
          </div>
          <button
            onClick={() => router.push("/surveys/new")}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#f28c28] hover:bg-[#d97a20] transition-all font-bold text-sm shadow-md"
          >
            <Plus className="h-4 w-4" /> Design New Form
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form Templates */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="h-5 w-5 text-[#306e46]" />
            <h2 className="text-xl font-bold text-[#1a1a1a]">Select a Survey Template</h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-gray-100">
              <Loader2 className="h-8 w-8 text-[#306e46] animate-spin mb-2" />
              <p className="text-gray-500 text-sm">Loading available forms...</p>
            </div>
          ) : forms.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
              <p className="text-gray-400 font-medium">No forms available</p>
              <p className="text-gray-500 text-xs mt-1">Click "Design New Form" to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {forms.map((form) => (
                <div
                  key={form.id}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <span className="inline-block text-[10px] uppercase tracking-wider font-extrabold text-[#f28c28] bg-orange-50 px-2.5 py-1 rounded-full mb-3">
                      {form.fields.length} Questions
                    </span>
                    <h3 className="font-bold text-lg text-gray-900 leading-tight mb-2">{form.title}</h3>
                    <p className="text-gray-500 text-xs line-clamp-3 mb-6">{form.description}</p>
                  </div>
                  <button
                    onClick={() => router.push(`/surveys/fill/${form.id}`)}
                    className="w-full py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#306e46] font-bold text-sm transition-colors text-center"
                  >
                    Start Survey / Form
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Sync Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CloudLightning className="h-5 w-5 text-[#f28c28]" />
                <h2 className="text-lg font-bold text-gray-900">Offline Drafts</h2>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-700 rounded-full">
                {drafts.length} Pending
              </span>
            </div>

            {syncStatus && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl text-xs font-semibold">
                {syncStatus}
              </div>
            )}

            {drafts.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-sm font-medium">No offline drafts</p>
                <p className="text-[11px] text-gray-400 mt-1">Filled forms will appear here if saved offline.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 mb-6">
                {drafts.map((draft) => (
                  <div key={draft.localId} className="p-3.5 bg-gray-50 rounded-xl border border-gray-150 relative">
                    <button
                      onClick={() => deleteDraft(draft.localId)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete draft"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <p className="font-bold text-xs text-gray-900 leading-tight pr-5">{draft.formTitle}</p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Saved: {new Date(draft.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {(draft.latitude || draft.longitude) && (
                      <div className="flex items-center gap-1 text-[9px] text-[#306e46] mt-1.5 font-bold">
                        <MapPin className="h-3 w-3" />
                        <span>GPS Captured</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleSync}
              disabled={drafts.length === 0 || syncing}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#306e46] text-white hover:bg-[#255737] font-bold text-sm transition-all shadow-lg shadow-[#306e46]/10 disabled:opacity-50"
            >
              {syncing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Syncing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Sync Offline Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
