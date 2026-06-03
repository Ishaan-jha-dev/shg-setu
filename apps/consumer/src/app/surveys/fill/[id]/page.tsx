"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Save, Send, MapPin, Loader2, Info, Wifi, WifiOff } from "lucide-react";

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
}

export default function FillSurveyPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params.id as string;

  const [form, setForm] = useState<SurveyForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [capturingGps, setCapturingGps] = useState(false);
  const [gpsError, setGpsError] = useState("");

  const supabase = createClient();

  useEffect(() => {
    fetchForm();
  }, [formId]);

  const fetchForm = async () => {
    try {
      const { data, error } = await supabase
        .from("survey_forms")
        .select("*")
        .eq("id", formId)
        .single();

      if (error) throw error;
      setForm(data);

      // Initialize answers object
      const initialAnswers: Record<string, any> = {};
      data.fields.forEach((f: FormField) => {
        initialAnswers[f.name] = "";
      });
      setAnswers(initialAnswers);
    } catch (err: any) {
      setError(err.message || "Failed to load survey form.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [fieldName]: value }));
  };

  const captureGps = () => {
    setCapturingGps(true);
    setGpsError("");

    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser");
      setCapturingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setCapturingGps(false);
      },
      (error) => {
        setGpsError(`GPS Capture failed: ${error.message}`);
        setCapturingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const saveOffline = () => {
    if (!form) return;

    // Validation (basic check)
    const missingFields = form.fields.filter(f => f.required && !answers[f.name]);
    if (missingFields.length > 0) {
      setError(`Please answer all required questions: ${missingFields.map(f => f.label).join(", ")}`);
      return;
    }

    const newDraft = {
      localId: `draft_${Date.now()}`,
      formId: form.id,
      formTitle: form.title,
      answers,
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
    };

    const existingRaw = localStorage.getItem("setu_survey_drafts");
    let existing = [];
    if (existingRaw) {
      try {
        existing = JSON.parse(existingRaw);
      } catch (e) {
        console.error(e);
      }
    }

    existing.push(newDraft);
    localStorage.setItem("setu_survey_drafts", JSON.stringify(existing));
    router.push("/surveys");
  };

  const submitOnline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setError("");

    // Validate
    const missingFields = form.fields.filter(f => f.required && !answers[f.name]);
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.map(f => f.label).join(", ")}`);
      return;
    }

    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();

    try {
      const { error: submitErr } = await supabase.from("survey_submissions").insert({
        form_id: form.id,
        submitted_by: user?.id || null,
        answers,
        latitude,
        longitude,
      });

      if (submitErr) throw submitErr;
      router.push("/surveys");
    } catch (err: any) {
      setError(err.message || "Failed to submit online. Please save as offline draft instead.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcf9f2] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#306e46] animate-spin mb-2" />
        <p className="text-gray-500 text-sm">Building form layout...</p>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="min-h-screen bg-[#fcf9f2] p-8 text-center">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-6 border border-gray-150 shadow-sm">
          <p className="text-red-500 font-semibold mb-4">{error}</p>
          <button onClick={() => router.push("/surveys")} className="px-6 py-2.5 bg-[#306e46] text-white rounded-full text-sm font-bold">
            Back to Surveys
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf9f2] pb-16">
      {/* Header */}
      <div className="bg-[#306e46] text-white py-8 px-6 md:px-12 shadow-sm rounded-b-[2rem] mb-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.push("/surveys")}
            className="flex items-center gap-2 text-emerald-100 hover:text-white mb-3 text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Exit Form
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight">{form?.title}</h1>
          <p className="text-emerald-100 text-xs mt-1">{form?.description}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl">
            {error}
          </div>
        )}

        <form onSubmit={submitOnline} className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
            {form?.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="block text-sm font-bold text-gray-800">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>

                {field.type === "text" && (
                  <input
                    type="text"
                    required={field.required}
                    value={answers[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    placeholder="Type your response..."
                    className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#306e46] focus:ring-2 focus:ring-[#306e46]/10 text-sm"
                  />
                )}

                {field.type === "number" && (
                  <input
                    type="number"
                    required={field.required}
                    value={answers[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    placeholder="Enter numeric value..."
                    className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#306e46] focus:ring-2 focus:ring-[#306e46]/10 text-sm"
                  />
                )}

                {field.type === "select" && (
                  <select
                    required={field.required}
                    value={answers[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#306e46] bg-white text-sm"
                  >
                    <option value="">Select an option...</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {field.type === "gps" && (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        {latitude && longitude ? (
                          <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>Lat: {latitude.toFixed(6)}, Long: {longitude.toFixed(6)}</span>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">No GPS coordinates captured yet</p>
                        )}
                        {gpsError && <p className="text-xs text-red-500 mt-1">{gpsError}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={captureGps}
                        disabled={capturingGps}
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#306e46] text-white hover:bg-[#255737] rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        {capturingGps ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Capturing...
                          </>
                        ) : (
                          <>
                            <MapPin className="h-3.5 w-3.5" /> Capture Location
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Submission Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={saveOffline}
              className="flex items-center justify-center gap-2 py-4 rounded-full border-2 border-dashed border-[#f28c28] text-[#f28c28] hover:bg-orange-50 font-bold text-sm transition-all"
            >
              <WifiOff className="h-4 w-4" /> Save Draft (Offline)
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 py-4 rounded-full bg-[#306e46] text-white hover:bg-[#255737] font-bold text-sm transition-all shadow-lg shadow-[#306e46]/20 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Submit Form (Online)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
