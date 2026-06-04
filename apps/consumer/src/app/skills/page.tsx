import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import SkillsClient from "./SkillsClient";

export default async function SkillsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch member profile to check for leader privilege and pass matching metadata
  const { data: member } = await supabase
    .from("members")
    .select("*, shgs(*)")
    .eq("profile_id", user.id)
    .single();

  // Fetch active programs from database
  const { data: dbPrograms } = await supabase
    .from("skill_programs")
    .select("*")
    .eq("is_active", true)
    .order("created_at");

  // Fetch existing enrollments for current member
  let dbEnrollments: any[] = [];
  if (member) {
    const { data: enrollments } = await supabase
      .from("skill_enrollments")
      .select("*")
      .eq("member_id", member.id);
    dbEnrollments = enrollments || [];
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] lg:pl-[260px] pb-24 font-sans text-[#1c1c1c]">
      <Header />
      <main className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
        <SkillsClient 
          member={member} 
          dbPrograms={dbPrograms || []} 
          dbEnrollments={dbEnrollments} 
        />
      </main>
    </div>
  );
}
