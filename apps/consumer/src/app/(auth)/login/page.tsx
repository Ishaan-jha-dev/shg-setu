"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Leaf, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
      },
    });
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Account created! Check your email to confirm, then log in.");
      setMode("login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fcf9f2] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 mb-10 justify-center">
          <img src="/logo.png" alt="Setu Logo" className="h-10 w-10 rounded-full object-cover border border-[#306e46]/20" />
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-[#306e46]">Setu</span>
              <span className="text-xl font-bold text-[#f28c28]">SHG</span>
            </div>
            <span className="text-[9px] tracking-widest text-gray-400 uppercase">Saath • Vikas • Samriddhi</span>
          </div>
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          {/* Toggle */}
          <div className="flex bg-[#f0f4f0] rounded-full p-1 mb-8">
            <button
              onClick={() => { setMode("login"); setError(null); setSuccess(null); }}
              className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${mode === "login" ? "bg-[#306e46] text-white shadow-sm" : "text-gray-500"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("register"); setError(null); setSuccess(null); }}
              className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${mode === "register" ? "bg-[#306e46] text-white shadow-sm" : "text-gray-500"}`}
            >
              Register
            </button>
          </div>

          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">
            {mode === "login" ? "Welcome back" : "Join Setu SHG"}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {mode === "login" ? "Sign in to access your SHG dashboard." : "Create your account to get started."}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-100 text-sm text-green-700">{success}</div>
          )}

          <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-4">
            {mode === "register" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#306e46]/30 focus:border-[#306e46] outline-none transition-all"
                    placeholder="Priya Sharma"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#306e46]/30 focus:border-[#306e46] outline-none transition-all"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#306e46]/30 focus:border-[#306e46] outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#306e46]/30 focus:border-[#306e46] outline-none transition-all"
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-[#306e46] text-white font-semibold rounded-full hover:bg-[#255737] transition-all shadow-lg shadow-[#306e46]/20 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
              ) : (
                <>{mode === "login" ? "Sign In" : "Create Account"} <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing you agree to our{" "}
          <Link href="/terms" className="text-[#306e46] hover:underline">Terms</Link> &amp;{" "}
          <Link href="/privacy" className="text-[#306e46] hover:underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
