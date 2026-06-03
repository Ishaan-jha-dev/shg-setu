import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react";
import GrantActionButtons from "@/components/GrantActionButtons";

export default async function AuthorityGrantsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch all grant applications with related SHG and Scheme details
  const { data: applications, error } = await supabase
    .from("grant_applications")
    .select(`
      *,
      shgs (name, district, state),
      grant_schemes (name, provider, max_amount),
      profiles (full_name)
    `)
    .order("applied_at", { ascending: false });

  if (error) {
    console.error(error);
  }

  const apps = applications || [];
  const pending = apps.filter(a => a.status === "APPLIED" || a.status === "UNDER_REVIEW");
  const processed = apps.filter(a => a.status === "APPROVED" || a.status === "REJECTED");

  return (
    <div className="min-h-screen bg-[#f4f6f8] pb-20">
      {/* Header */}
      <div className="bg-slate-900 text-white py-8 px-6 shadow-md">
        <div className="max-w-5xl mx-auto">
          <Link href="/authority" className="flex items-center gap-2 text-indigo-400 hover:text-white mb-4 text-sm font-semibold transition-colors w-fit">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold mb-2">Grants Pipeline</h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Review and process grant applications from SHGs across the platform.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-12">
        
        {/* Pending Review Section */}
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" /> Pending Review ({pending.length})
          </h2>
          
          {pending.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 border-dashed p-12 text-center text-slate-500">
              No pending grant applications at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pending.map((app: any) => (
                <div key={app.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {app.status.replace("_", " ")}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(app.applied_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-lg text-slate-900">{app.grant_schemes?.name}</h3>
                    <p className="text-sm text-slate-500 mb-3">{app.shgs?.name} • {app.shgs?.district}, {app.shgs?.state}</p>
                    
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Requested Amount</p>
                          <p className="font-semibold text-slate-800">₹{Number(app.amount_requested).toLocaleString("en-IN")}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Applied By</p>
                          <p className="font-semibold text-slate-800">{app.profiles?.full_name}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Application Notes</p>
                        <p className="text-xs text-slate-600 mt-1">{app.notes || "No additional notes provided."}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons (Client Component) */}
                  <div className="md:w-64 flex-shrink-0">
                    <GrantActionButtons applicationId={app.id} requestedAmount={app.amount_requested} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Processed Section */}
        {processed.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" /> Processed Applications
            </h2>
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-bold">SHG & Location</th>
                      <th className="px-6 py-4 font-bold">Scheme</th>
                      <th className="px-6 py-4 font-bold">Amount</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {processed.map((app: any) => (
                      <tr key={app.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">{app.shgs?.name}</div>
                          <div className="text-xs text-slate-400">{app.shgs?.district}, {app.shgs?.state}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">
                          {app.grant_schemes?.name}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-700">
                          {app.amount_approved ? `₹${Number(app.amount_approved).toLocaleString("en-IN")}` : "—"}
                        </td>
                        <td className="px-6 py-4">
                          {app.status === "APPROVED" ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                              <CheckCircle className="h-3 w-3" /> Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                              <XCircle className="h-3 w-3" /> Rejected
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
