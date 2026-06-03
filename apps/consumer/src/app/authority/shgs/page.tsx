import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Buildings, MapPin, Users, PiggyBank, Search } from "lucide-react";

export default async function SHGDirectoryPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams;
  const q = sp?.q || "";
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let query = supabase.from("shgs").select(`
    *,
    members (id),
    savings_accounts (balance)
  `).order("created_at", { ascending: false });

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data: shgs, error } = await query;

  if (error) {
    console.error(error);
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] pb-20">
      {/* Header */}
      <div className="bg-slate-900 text-white py-8 px-6 shadow-md">
        <div className="max-w-5xl mx-auto">
          <Link href="/authority" className="flex items-center gap-2 text-indigo-400 hover:text-white mb-4 text-sm font-semibold transition-colors w-fit">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold mb-2">SHG Directory</h1>
              <p className="text-slate-400 text-sm max-w-xl">
                View all Self Help Groups, their members, and financial standing.
              </p>
            </div>
            {/* Simple Search Form */}
            <form action="/authority/shgs" method="GET" className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search SHGs..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/10 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8">
        {shgs?.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 border-dashed p-12 text-center text-slate-500">
            <Buildings className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p>No SHGs found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {shgs?.map((shg: any) => {
              const groupPool = shg.savings_accounts?.find((acc: any) => acc.member_id === null)?.balance || 0;
              const memberCount = shg.members?.length || 0;

              return (
                <div key={shg.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 flex-shrink-0">
                      <Buildings className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 leading-tight">{shg.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" /> {shg.village}, {shg.district}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5 mt-auto">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        <Users className="h-3 w-3" /> Members
                      </div>
                      <div className="font-extrabold text-slate-800">{memberCount}</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        <PiggyBank className="h-3 w-3" /> Group Pool
                      </div>
                      <div className="font-extrabold text-emerald-600">₹{(Number(groupPool)/1000).toFixed(1)}K</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Grade: A (Healthy)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
