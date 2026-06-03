import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, LogOut, Crown, Calendar, Phone, CheckCircle2 } from "lucide-react";

export default async function MembersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: selfMember } = await supabase
    .from("members")
    .select("id, shg_id, is_leader, shgs(name)")
    .eq("profile_id", user.id)
    .single();

  if (!selfMember) redirect("/join");

  const { data: members } = await supabase
    .from("members")
    .select("*, profiles(full_name, phone)")
    .eq("shg_id", selfMember.shg_id)
    .order("is_leader", { ascending: false });

  const shg = selfMember.shgs as any;
  const allMembers = members || [];

  return (
    <div className="min-h-screen bg-[#fcf9f2]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="Setu" className="h-8 w-8 rounded-full border border-[#306e46]/20" />
            <span className="font-bold text-[#306e46]">Members</span>
          </Link>
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full hover:text-red-500">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
        <div className="mb-8">
          <p className="text-sm text-gray-500">{shg?.name}</p>
          <h1 className="text-3xl font-bold text-[#1a1a1a]">Group Members</h1>
          <p className="text-gray-500 text-sm mt-1">{allMembers.length} members in this SHG</p>
        </div>

        <div className="space-y-3">
          {allMembers.map((m, i) => {
            const profile = m.profiles as any;
            const isMe = m.profile_id === user.id;
            return (
              <div key={m.id} className={`bg-white rounded-2xl px-5 py-4 border shadow-sm flex items-center gap-4 ${isMe ? "border-[#306e46]/30 bg-[#306e46]/5" : "border-gray-100"}`}>
                <div className={`h-11 w-11 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${
                  m.is_leader ? "bg-[#f28c28] text-white" : "bg-gray-100 text-gray-600"
                }`}>
                  {profile?.full_name?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#1a1a1a]">{profile?.full_name ?? "Unknown Member"}</span>
                    {m.is_leader && (
                      <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-[#f28c28]/15 text-[#f28c28]">
                        <Crown className="h-3 w-3" /> Leader
                      </span>
                    )}
                    {isMe && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#306e46]/10 text-[#306e46]">You</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                    {profile?.phone && (
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{profile.phone}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Joined {new Date(m.joined_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
                <div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    m.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"
                  }`}>
                    {m.status === "ACTIVE" ? "Active" : m.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
