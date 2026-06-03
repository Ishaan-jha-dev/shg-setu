import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import Header from "@/components/Header";
import { 
  Users, MapPin, Calendar, Clock, IndianRupee,
  ChevronRight, Activity, TrendingUp, HandCoins, CheckCircle2, Circle,
  BookOpen, Wallet, BarChart2, PiggyBank, Landmark
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .single();

  const { data: member } = await supabase
    .from("members")
    .select("*, shgs(*)")
    .eq("profile_id", user.id)
    .single();

  const shg = member?.shgs as any;
  const isJoined = !!member;
  const firstName = profile?.full_name?.split(" ")[0] ?? "Member";

  // Demo Mode Override
  const cookieStore = await cookies();
  const demoRole = cookieStore.get("demo_role")?.value;
  let isLeader = member?.is_leader;
  if (demoRole === "leader") isLeader = true;
  if (demoRole === "member") isLeader = false;

  return (
    <div className="min-h-screen bg-[#fafaf9] lg:pl-[260px] pb-24">
      <Header />
      
      <main className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* HERO SECTION */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#edf4e8] to-[#f8f9f6] mb-6 flex flex-col md:flex-row items-stretch border border-[#e5e7eb]/60">
          
          {/* Left Text Content */}
          <div className="flex-1 p-8 md:p-12 z-10 flex flex-col justify-between">
            <div>
              <p className="text-[#374151] font-medium mb-1">Namaste,</p>
              <h1 className="text-5xl font-extrabold text-[#111827] mb-6 tracking-tight flex items-center gap-3">
                {firstName} <span className="text-3xl">👋</span>
              </h1>
              
              <div className="text-[#374151] text-lg mb-2 flex items-center gap-2">
                Welcome back to <span className="font-bold text-[#1a4023]">{shg?.name || "Your SHG"}</span>
              </div>
              <p className="text-[#4b5563]">
                {shg?.total_members || 20} women are building a stronger future together.
              </p>
            </div>

            {/* Quick Stats Pills */}
            <div className="flex flex-wrap gap-4 mt-10">
              <div className="bg-[#f0f5ec] border border-[#dce6d5] rounded-xl px-5 py-3 flex items-center gap-4 shadow-sm">
                <Calendar className="text-[#2d5635] h-6 w-6" />
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#6b7280]">Today's meeting</div>
                  <div className="font-bold text-[#111827]">7:00 PM</div>
                </div>
              </div>
              <div className="bg-[#fef9f0] border border-[#fce6c5] rounded-xl px-5 py-3 flex items-center gap-4 shadow-sm">
                <div className="h-7 w-7 rounded-full border border-[#f28c28] flex items-center justify-center text-[#f28c28] font-bold text-xs">
                  ₹
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#6b7280]">Next repayment</div>
                  <div className="font-bold text-[#111827]">₹1,500 <span className="text-[#f28c28] text-xs ml-1 font-semibold">due tomorrow</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image Mask */}
          <div className="hidden md:block w-[55%] relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#edf4e8] to-transparent z-10 w-32"></div>
            <img 
              src="/shg_hero_banner.png" 
              alt="SHG Meeting" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: ACTIVITY FEED */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white rounded-3xl border border-[#e5e7eb] p-6 shadow-sm flex-1">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-[#111827]">Activity Feed</h2>
                <button className="text-[#2d5635] text-sm font-semibold hover:underline">View all</button>
              </div>

              <div className="space-y-6">
                {/* Today */}
                <div>
                  <h3 className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider mb-4">Today</h3>
                  <div className="space-y-5 relative before:absolute before:inset-0 before:ml-[13px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    
                    {/* Item 1 */}
                    <div className="relative flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-7 w-7 rounded-full bg-[#f0fdf4] border-2 border-white flex items-center justify-center z-10 shadow-sm text-emerald-600">
                          <IndianRupee className="h-3.5 w-3.5" />
                        </div>
                        <p className="text-sm text-[#374151]">Sunita deposited <span className="font-bold">₹500</span></p>
                      </div>
                      <span className="text-xs text-[#9ca3af]">10:30 AM</span>
                    </div>

                    {/* Item 2 */}
                    <div className="relative flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-7 w-7 rounded-full bg-[#fff7ed] border-2 border-white flex items-center justify-center z-10 shadow-sm text-orange-600">
                          <HandCoins className="h-3.5 w-3.5" />
                        </div>
                        <p className="text-sm text-[#374151]">Rekha completed a repayment of <span className="font-bold">₹1,000</span></p>
                      </div>
                      <span className="text-xs text-[#9ca3af]">09:45 AM</span>
                    </div>

                    {/* Item 3 */}
                    <div className="relative flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-7 w-7 rounded-full bg-[#f0f9ff] border-2 border-white flex items-center justify-center z-10 shadow-sm text-sky-600">
                          <Users className="h-3.5 w-3.5" />
                        </div>
                        <p className="text-sm text-[#374151]">Attendance marked for today's meeting</p>
                      </div>
                      <span className="text-xs text-[#9ca3af]">09:30 AM</span>
                    </div>

                    {/* Item 4 */}
                    <div className="relative flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-7 w-7 rounded-full bg-[#f5f3ff] border-2 border-white flex items-center justify-center z-10 shadow-sm text-violet-600">
                          <BookOpen className="h-3.5 w-3.5" />
                        </div>
                        <p className="text-sm text-[#374151]">3 members enrolled in tailoring training</p>
                      </div>
                      <span className="text-xs text-[#9ca3af]">08:15 AM</span>
                    </div>

                  </div>
                </div>

                {/* Yesterday */}
                <div className="pt-2">
                  <h3 className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider mb-4">Yesterday</h3>
                  <div className="space-y-5 relative before:absolute before:inset-0 before:ml-[13px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    
                    {/* Item 5 */}
                    <div className="relative flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-7 w-7 rounded-full bg-[#fff1f2] border-2 border-white flex items-center justify-center z-10 shadow-sm text-rose-600">
                          <TrendingUp className="h-3.5 w-3.5" />
                        </div>
                        <p className="text-sm text-[#374151]">Loan request approved for Meena</p>
                      </div>
                      <span className="text-xs text-[#9ca3af]">04:15 PM</span>
                    </div>

                    {/* Item 6 */}
                    <div className="relative flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-7 w-7 rounded-full bg-[#ecfdf5] border-2 border-white flex items-center justify-center z-10 shadow-sm text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                        <p className="text-sm text-[#374151]">Weekly meeting completed</p>
                      </div>
                      <span className="text-xs text-[#9ca3af]">03:00 PM</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button className="w-full py-3 border border-[#d1d5db] rounded-xl text-sm font-semibold text-[#374151] hover:bg-[#f3f4f6] transition-colors flex items-center justify-between px-4">
                  Go to Activity Center <ChevronRight className="h-4 w-4 text-[#9ca3af]" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Quick Actions */}
            <div className="bg-white rounded-3xl border border-[#e5e7eb] p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#111827] mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                
                {[
                  { label: "Mark\nAttendance", icon: Users, color: "text-[#2d5635]" },
                  { label: "Record\nSavings", icon: HandCoins, color: "text-[#2d5635]" },
                  { label: "Issue\nLoan", icon: IndianRupee, color: "text-[#2d5635]" },
                  { label: "Record\nRepayment", icon: Wallet, color: "text-[#2d5635]" },
                  { label: "Passbook", icon: BookOpen, color: "text-[#2d5635]" },
                  { label: "View\nReports", icon: BarChart2, color: "text-[#2d5635]" },
                ].map((action, idx) => (
                  <button key={idx} className="flex flex-col items-center justify-center p-4 rounded-2xl border border-[#e5e7eb] hover:border-[#2d5635] hover:shadow-md transition-all group h-28">
                    <action.icon className={`h-6 w-6 mb-3 group-hover:scale-110 transition-transform ${action.color}`} strokeWidth={1.5} />
                    <span className="text-xs font-semibold text-[#374151] text-center whitespace-pre-line leading-tight">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Our SHG Journey */}
            <div className="bg-white rounded-3xl border border-[#e5e7eb] p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#111827] mb-8">Our SHG Journey</h2>
              
              {/* Timeline graphic */}
              <div className="relative flex justify-between items-center px-4 md:px-8 mb-4">
                {/* Connecting Line */}
                <div className="absolute left-8 right-8 top-1/2 h-0.5 bg-[#e5e7eb] -z-10 -translate-y-1/2"></div>
                
                {/* Steps */}
                {[
                  { label: "Formation", status: "Completed", icon: Users, state: "done" },
                  { label: "Savings", status: "Completed", icon: IndianRupee, state: "done" },
                  { label: "Credit Ready", status: "Completed", icon: PiggyBank, state: "done" },
                  { label: "Bank Linkage", status: "In Progress", icon: Landmark, state: "active" },
                  { label: "Enterprise Growth", status: "Upcoming", icon: TrendingUp, state: "pending" },
                ].map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center bg-white">
                    <div className={`h-12 w-12 rounded-full border-2 flex items-center justify-center bg-white shadow-sm mb-3 z-10 ${
                      step.state === "done" ? "border-[#306e46] text-[#306e46]" :
                      step.state === "active" ? "border-[#f28c28] text-[#f28c28]" :
                      "border-[#d1d5db] text-[#9ca3af]"
                    }`}>
                      <step.icon className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div className="text-center w-20">
                      <div className="text-[11px] font-bold text-[#111827] leading-tight mb-1">{step.label}</div>
                      <div className={`text-[9px] uppercase font-bold tracking-wide ${
                        step.state === "done" ? "text-[#306e46]" :
                        step.state === "active" ? "text-[#f28c28]" :
                        "text-[#9ca3af]"
                      }`}>{step.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* From Our Community */}
            <div className="bg-white rounded-3xl border border-[#e5e7eb] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-[#111827]">From Our Community</h2>
                <button className="text-[#2d5635] text-sm font-semibold hover:underline">View all stories</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Story 1 */}
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#f9fafb] transition-colors border border-transparent hover:border-[#f3f4f6] cursor-pointer">
                  <div className="h-16 w-16 rounded-lg overflow-hidden shrink-0">
                    <img src="/shg_tailoring.png" alt="Tailoring" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111827] leading-tight mb-1">Sita started her tailoring business</h4>
                    <div className="text-xs text-[#6b7280]">Ishaan SHG</div>
                    <div className="text-[10px] text-[#9ca3af]">2 days ago</div>
                  </div>
                </div>

                {/* Story 2 */}
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#f9fafb] transition-colors border border-transparent hover:border-[#f3f4f6] cursor-pointer">
                  <div className="h-16 w-16 rounded-lg overflow-hidden shrink-0">
                    <img src="/shg_savings.png" alt="Savings" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111827] leading-tight mb-1">Rekha repaid her first loan</h4>
                    <div className="text-xs text-[#6b7280]">Ishaan SHG</div>
                    <div className="text-[10px] text-[#9ca3af]">5 days ago</div>
                  </div>
                </div>

                {/* Story 3 */}
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#f9fafb] transition-colors border border-transparent hover:border-[#f3f4f6] cursor-pointer">
                  <div className="h-16 w-16 rounded-lg overflow-hidden shrink-0">
                    <img src="/shg_group.png" alt="Group" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111827] leading-tight mb-1">Group crossed ₹2 lakh savings!</h4>
                    <div className="text-xs text-[#6b7280]">Ishaan SHG</div>
                    <div className="text-[10px] text-[#9ca3af]">1 week ago</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-6 bg-[#edf4e8] rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between border border-[#dce6d5]">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="h-10 w-10 bg-[#2d5635] rounded-full flex items-center justify-center">
              <span className="text-white text-xl">🌱</span>
            </div>
            <div>
              <h3 className="font-bold text-[#111827]">Keep growing, keep inspiring!</h3>
              <p className="text-sm text-[#4b5563]">You are making a difference in many lives.</p>
            </div>
          </div>
          <button className="bg-[#2d5635] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#1a4023] transition-colors flex items-center gap-2">
            Explore Opportunities <ChevronRight className="h-4 w-4" />
          </button>
        </div>

      </main>
    </div>
  );
}
