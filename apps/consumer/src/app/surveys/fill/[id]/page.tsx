"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  ArrowLeft, MapPin, Loader2, Save, Send, CheckCircle, AlertCircle, WifiOff
} from "lucide-react";

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
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [savedOffline, setSavedOffline] = useState(false);
  const [error, setError] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, []);

  useEffect(() => { fetchForm(); }, [formId]);

  const fetchForm = async () => {
    try {
      const { data, error } = await supabase.from("survey_forms").select("*").eq("id", formId).single();
      if (error) throw error;
      setForm(data);
      // Initialize blank answers
      const init: Record<string, any> = {};
      (data.fields || []).forEach((f: FormField) => { init[f.name] = f.type === "yes_no" ? null : ""; });
      setAnswers(init);
    } catch (err: any) {
      setError("Form not found.");
    } finally {
      setLoading(false);
    }
  };

  const captureGPS = () => {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setGpsCoords(coords);
        setAnswers(prev => ({ ...prev, _gps: `${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}` }));
        setGpsLoading(false);
      },
      () => { setGpsLoading(false); setError("GPS access denied."); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const validateForm = (): boolean => {
    if (!form) return false;
    for (const field of form.fields) {
      if (field.required) {
        const val = answers[field.name];
        if (val === null || val === undefined || val === "") {
          setError(`"${field.label}" is required.`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSaveOffline = () => {
    const draft = {
      localId: `draft_${Date.now()}`,
      formId,
      formTitle: form?.title || "",
      answers,
      latitude: gpsCoords?.lat || null,
      longitude: gpsCoords?.lng || null,
      timestamp: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem("setu_survey_drafts") || "[]");
    existing.push(draft);
    localStorage.setItem("setu_survey_drafts", JSON.stringify(existing));
    setSavedOffline(true);
    setTimeout(() => router.push("/surveys"), 1500);
  };

  const handleSubmit = async () => {
    setError("");
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated.");

      const { error: subErr } = await supabase.from("survey_submissions").insert({
        form_id: formId,
        submitted_by: user.id,
        answers,
        latitude: gpsCoords?.lat || null,
        longitude: gpsCoords?.lng || null,
      });

      if (subErr) throw subErr;
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateAnswer = (fieldName: string, value: any) => {
    setAnswers(prev => ({ ...prev, [fieldName]: value }));
  };

  if (loading) return (
    <div className="min-h-screen bg-[#fcf9f2] flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-[#306e46] animate-spin" />
    </div>
  );

  if (!form) return (
    <div className="min-h-screen bg-[#fcf9f2] p-8 text-center">
      <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
      <p className="text-gray-600 font-semibold">{error || "Form not found."}</p>
      <button onClick={() => router.push("/surveys")} className="mt-4 px-6 py-2.5 bg-[#306e46] text-white rounded-full text-sm font-bold">Back</button>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen bg-[#fcf9f2] flex items-center justify-center p-8">
      <div className="bg-white rounded-3xl p-10 text-center shadow-xl border border-gray-100 max-w-sm w-full">
        <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Submitted!</h2>
        <p className="text-gray-500 text-sm mb-6">Your survey response has been saved to the server.</p>
        <button onClick={() => router.push("/surveys")} className="px-8 py-3 rounded-full bg-[#306e46] text-white font-bold hover:bg-[#255737] transition-colors">
          Back to Surveys
        </button>
      </div>
    </div>
  );

  if (savedOffline) return (
    <div className="min-h-screen bg-[#fcf9f2] flex items-center justify-center p-8">
      <div className="bg-white rounded-3xl p-10 text-center shadow-xl border border-gray-100 max-w-sm w-full">
        <Save className="h-14 w-14 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Saved Offline!</h2>
        <p className="text-gray-500 text-sm mb-2">Your response is saved locally.</p>
        <p className="text-gray-400 text-xs mb-6">Sync it from the Surveys page when you're back online.</p>
        <button onClick={() => router.push("/surveys")} className="px-8 py-3 rounded-full bg-[#306e46] text-white font-bold">
          Back to Surveys
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcf9f2] pb-20">
      {/* Header */}
      <div className="bg-[#306e46] text-white py-6 px-6 rounded-b-[2rem] shadow-md">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => router.push("/surveys")} className="flex items-center gap-2 text-emerald-100 hover:text-white mb-3 text-sm font-semibold">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold">{form.title}</h1>
              {form.description && <p className="text-emerald-100 text-sm mt-0.5">{form.description}</p>}
            </div>
            {!isOnline && (
              <div className="flex items-center gap-1 bg-amber-500/20 text-amber-200 text-[10px] font-bold px-3 py-1.5 rounded-full border border-amber-400/20">
                <WifiOff className="h-3 w-3" /> Offline
              </div>
            )}
          </div>
          <p className="text-emerald-200 text-xs mt-2">{form.fields.length} questions</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-6 mt-6 space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-semibold">
            <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
          </div>
        )}

        {/* GPS Capture */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${gpsCoords ? "bg-emerald-50" : "bg-gray-100"}`}>
              <MapPin className={`h-4 w-4 ${gpsCoords ? "text-emerald-600" : "text-gray-400"}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-700">GPS Location</p>
              <p className="text-[10px] text-gray-400">
                {gpsCoords ? `${gpsCoords.lat.toFixed(5)}, ${gpsCoords.lng.toFixed(5)}` : "Not captured"}
              </p>
            </div>
          </div>
          <button
            onClick={captureGPS}
            disabled={gpsLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#306e46] text-white text-xs font-bold hover:bg-[#255737] transition-colors disabled:opacity-60"
          >
            {gpsLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />}
            {gpsCoords ? "Recapture" : "Capture GPS"}
          </button>
        </div>

        {/* Form Fields */}
        {form.fields.map((field, idx) => (
          <div key={field.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <label className="block text-sm font-bold text-gray-900 mb-1">
              {idx + 1}. {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <p className="text-[10px] text-gray-400 uppercase font-bold mb-3">{field.type}</p>

            {/* Text */}
            {field.type === "text" && (
              <input
                type="text"
                value={answers[field.name] || ""}
                onChange={e => updateAnswer(field.name, e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#306e46] text-sm"
                placeholder="Type your answer..."
              />
            )}

            {/* Textarea */}
            {field.type === "textarea" && (
              <textarea
                value={answers[field.name] || ""}
                onChange={e => updateAnswer(field.name, e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#306e46] text-sm resize-none"
                placeholder="Type your answer..."
              />
            )}

            {/* Number */}
            {field.type === "number" && (
              <input
                type="number"
                value={answers[field.name] || ""}
                onChange={e => updateAnswer(field.name, e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#306e46] text-sm font-bold"
                placeholder="0"
              />
            )}

            {/* Date */}
            {field.type === "date" && (
              <input
                type="date"
                value={answers[field.name] || ""}
                onChange={e => updateAnswer(field.name, e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#306e46] text-sm"
              />
            )}

            {/* Select */}
            {field.type === "select" && (
              <div className="grid grid-cols-2 gap-2">
                {(field.options || []).map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => updateAnswer(field.name, opt)}
                    className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all text-left ${
                      answers[field.name] === opt
                        ? "border-[#306e46] bg-[#306e46]/5 text-[#306e46]"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Yes/No */}
            {field.type === "yes_no" && (
              <div className="flex gap-3">
                {["Yes", "No"].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => updateAnswer(field.name, val)}
                    className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all ${
                      answers[field.name] === val
                        ? val === "Yes"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-red-500 bg-red-50 text-red-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {val === "Yes" ? "✓ Yes" : "✗ No"}
                  </button>
                ))}
              </div>
            )}

            {/* GPS (read from captured coords) */}
            {field.type === "gps" && (
              <div className={`px-4 py-3 rounded-xl border text-sm ${gpsCoords ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
                {gpsCoords ? `📍 ${gpsCoords.lat.toFixed(6)}, ${gpsCoords.lng.toFixed(6)}` : "Capture GPS above to fill this field"}
              </div>
            )}
          </div>
        ))}

        {/* Submit or Save Offline */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSaveOffline}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full border-2 border-[#306e46] text-[#306e46] font-bold text-sm hover:bg-[#306e46]/5 transition-colors"
          >
            <Save className="h-4 w-4" /> Save Offline
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !isOnline}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#306e46] text-white font-bold text-sm hover:bg-[#255737] transition-colors shadow-md disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isOnline ? "Submit Online" : "No Connection"}
          </button>
        </div>
      </div>
    </div>
  );
}
