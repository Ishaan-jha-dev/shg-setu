import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Clock, CheckCircle2, LogOut, Star, Users, Zap } from "lucide-react";
import EnrollButton from "@/components/EnrollButton";

const categoryColors: Record<string, string> = {
  VOCATIONAL: "bg-orange-100 text-orange-700",
  DIGITAL: "bg-blue-100 text-blue-700",
  AGRICULTURE: "bg-green-100 text-green-700",
  FINANCE: "bg-purple-100 text-purple-700",
  HEALTH: "bg-red-100 text-red-700",
};

export default async function SkillsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("members")
    .select("id, shg_id")
    .eq("profile_id", user.id)
    .single();

  const { data: programs } = await supabase
    .from("skill_programs")
    .select("*")
    .eq("is_active", true)
    .order("created_at");

  // Get this member's enrollments
  const { data: enrollments } = await supabase
    .from("skill_enrollments")
    .select("program_id, status")
    .eq("member_id", member?.id ?? "");

  const enrolledIds = new Set((enrollments || []).map(e => e.program_id));
  const allPrograms = programs || [];
  const myEnrollments = allPrograms.filter(p => enrolledIds.has(p.id));
  const available = allPrograms.filter(p => !enrolledIds.has(p.id));

  return (
    <div className="min-h-screen bg-[#fcf9f2]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="Setu" className="h-8 w-8 rounded-full border border-[#306e46]/20" />
            <span className="font-bold text-[#306e46]">Skill Development</span>
          </Link>
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors bg-gray-50 px-4 py-2 rounded-full">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
        {/* Hero */}
        <div className="mb-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
            <BookOpen className="h-full w-full" />
          </div>
          <p className="text-blue-200 text-sm font-medium mb-1">Learn. Grow. Earn.</p>
          <h1 className="text-3xl font-bold mb-2">Skill Development Hub</h1>
          <p className="text-blue-200 text-base max-w-lg">Free vocational, digital, and agricultural training programs for SHG members — from government and NGO partners.</p>
          <div className="flex gap-4 mt-5">
            <div className="bg-white/10 rounded-2xl px-4 py-2 text-center">
              <div className="font-bold text-xl">{allPrograms.length}</div>
              <div className="text-blue-200 text-xs">Programs</div>
            </div>
            <div className="bg-white/10 rounded-2xl px-4 py-2 text-center">
              <div className="font-bold text-xl">{myEnrollments.length}</div>
              <div className="text-blue-200 text-xs">Enrolled</div>
            </div>
          </div>
        </div>

        {/* My Enrollments */}
        {myEnrollments.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-4">📚 My Enrolled Programs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myEnrollments.map(program => {
                const enrollment = (enrollments || []).find(e => e.program_id === program.id);
                return (
                  <div key={program.id} className="bg-white rounded-3xl p-5 border border-blue-100 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${categoryColors[program.category] ?? "bg-gray-100 text-gray-600"}`}>
                        {program.category}
                      </span>
                      <span className={`text-xs font-semibold flex items-center gap-1 ${enrollment?.status === "COMPLETED" ? "text-emerald-600" : "text-blue-600"}`}>
                        {enrollment?.status === "COMPLETED" ? <><CheckCircle2 className="h-3 w-3" />Completed</> : <><Clock className="h-3 w-3" />In Progress</>}
                      </span>
                    </div>
                    <h3 className="font-bold text-[#1a1a1a] mb-1">{program.name}</h3>
                    <p className="text-xs text-gray-500">{program.provider} · {program.duration_weeks} weeks</p>
                    <div className="h-1.5 bg-gray-100 rounded-full mt-3">
                      <div className="h-1.5 bg-blue-500 rounded-full w-1/3" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Programs */}
        <div>
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-4">🎓 Available Programs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {available.map(program => (
              <div key={program.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${categoryColors[program.category] ?? "bg-gray-100 text-gray-600"}`}>
                    {program.category}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    {program.is_free ? "FREE" : `₹${program.fee}`}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#1a1a1a] mb-2">{program.name}</h3>
                <p className="text-sm text-gray-500 mb-4 flex-1">{program.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{program.duration_weeks} weeks</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{program.provider}</span>
                </div>
                {member && (
                  <EnrollButton programId={program.id} memberId={member.id} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
