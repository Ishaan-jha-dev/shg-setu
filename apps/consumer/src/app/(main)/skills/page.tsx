import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Clock, CheckCircle2, ArrowLeft, Star, Users, Award, Lock } from "lucide-react";
import EnrollButton from "@/components/EnrollButton";
import MarkCompleteButton from "@/components/MarkCompleteButton";

const categoryColors: Record<string, string> = {
  VOCATIONAL: "bg-orange-100 text-orange-700",
  DIGITAL: "bg-blue-100 text-blue-700",
  AGRICULTURE: "bg-green-100 text-green-700",
  FINANCE: "bg-purple-100 text-purple-700",
  HEALTH: "bg-red-100 text-red-700",
};

function getProgress(enrolledAt: string, durationWeeks: number, status: string): number {
  if (status === "COMPLETED") return 100;
  if (!enrolledAt) return 0;
  const start = new Date(enrolledAt).getTime();
  const now = Date.now();
  const totalMs = durationWeeks * 7 * 24 * 60 * 60 * 1000;
  return Math.min(99, Math.round(((now - start) / totalMs) * 100));
}

export default async function SkillsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("members")
    .select("id, shg_id, is_leader")
    .eq("profile_id", user.id)
    .single();

  const { data: programs } = await supabase
    .from("skill_programs")
    .select("*")
    .eq("is_active", true)
    .order("created_at");

  const { data: enrollments } = await supabase
    .from("skill_enrollments")
    .select("program_id, status, enrolled_at, completion_date, id")
    .eq("member_id", member?.id ?? "");

  const enrolledMap = new Map((enrollments || []).map(e => [e.program_id, e]));
  const allPrograms = programs || [];
  const myEnrollments = allPrograms.filter(p => enrolledMap.has(p.id));
  const available = allPrograms.filter(p => !enrolledMap.has(p.id));
  const completedCount = [...enrolledMap.values()].filter(e => e.status === "COMPLETED").length;

  return (
    <div className="min-h-screen bg-[#fcf9f2] pb-16">
      <div className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white py-8 px-6 rounded-b-[2rem] shadow-md">
        <div className="max-w-5xl mx-auto">
          <Link href="/dashboard" className="flex items-center gap-2 text-violet-100 hover:text-white mb-3 text-sm font-semibold">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <p className="text-violet-200 text-xs font-bold uppercase tracking-widest mb-1">Learn · Grow · Earn</p>
          <h1 className="text-3xl font-extrabold">Skill Development Hub</h1>
          <p className="text-violet-100 text-sm mt-1 max-w-lg">Free vocational, digital, and agricultural training from government and NGO partners.</p>
          <div className="flex gap-4 mt-5">
            {[
              { label: "Programs", value: allPrograms.length },
              { label: "Enrolled", value: myEnrollments.length },
              { label: "Completed", value: completedCount },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-2xl px-5 py-3 text-center">
                <div className="font-extrabold text-xl">{s.value}</div>
                <div className="text-violet-200 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 mt-8 space-y-10">
        {/* My Enrolled Programs */}
        {myEnrollments.length > 0 && (
          <section>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">📚 My Enrolled Programs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myEnrollments.map(program => {
                const enrollment = enrolledMap.get(program.id)!;
                const progress = getProgress(enrollment.enrolled_at, program.duration_weeks, enrollment.status);
                const isCompleted = enrollment.status === "COMPLETED";

                return (
                  <div key={program.id} className={`bg-white rounded-3xl p-5 border shadow-sm ${isCompleted ? "border-emerald-200" : "border-violet-100"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${categoryColors[program.category] ?? "bg-gray-100 text-gray-600"}`}>
                        {program.category}
                      </span>
                      <span className={`text-xs font-semibold flex items-center gap-1 ${isCompleted ? "text-emerald-600" : "text-violet-600"}`}>
                        {isCompleted ? <><CheckCircle2 className="h-3.5 w-3.5" /> Completed</> : <><Clock className="h-3.5 w-3.5" /> In Progress</>}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{program.name}</h3>
                    <p className="text-xs text-gray-500 mb-1">{program.provider} · {program.duration_weeks} weeks</p>
                    <p className="text-xs text-gray-400 mb-4 line-clamp-2">{program.description}</p>

                    {/* Real progress bar */}
                    <div className="mb-2">
                      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all ${isCompleted ? "bg-emerald-500" : "bg-violet-500"}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {isCompleted && enrollment.completion_date && (
                      <p className="text-[10px] text-emerald-600 font-semibold mb-3">
                        ✅ Completed on {new Date(enrollment.completion_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}

                    {/* Leader can mark complete */}
                    {member?.is_leader && !isCompleted && (
                      <MarkCompleteButton enrollmentId={enrollment.id} />
                    )}

                    {/* Certificate download */}
                    {isCompleted && (
                      <Link
                        href={`/skills/certificate/${enrollment.id}`}
                        className="mt-2 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors"
                      >
                        <Award className="h-3.5 w-3.5" /> Download Certificate
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Available Programs */}
        <section>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">🎓 Available Programs</h2>
          {available.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
              <BookOpen className="h-10 w-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium text-sm">You're enrolled in all available programs!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {available.map(program => (
                <div key={program.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${categoryColors[program.category] ?? "bg-gray-100 text-gray-600"}`}>
                      {program.category}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                      {program.is_free ? "FREE" : `₹${program.fee}`}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{program.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 flex-1">{program.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {program.duration_weeks} weeks</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {program.provider}</span>
                    {program.certificate_on_completion && (
                      <span className="flex items-center gap-1 text-emerald-600"><Award className="h-3 w-3" /> Certificate</span>
                    )}
                  </div>
                  {member && <EnrollButton programId={program.id} memberId={member.id} />}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
