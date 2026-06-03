import { createClient } from "@/utils/supabase/server";
import { Landmark, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function LoansLedgerPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  const { data: loans, error } = await supabase
    .from("loans")
    .select("*, shg_members(users(full_name, phone)), loan_repayments(*)")
    .eq("shg_id", params.id)
    .order("created_at", { ascending: false });

  if (error) {
    return <div className="p-4 rounded-lg bg-destructive/10 text-destructive">Failed to load loans.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/shgs/${params.id}`} className="text-primary hover:underline font-medium">
          &larr; Back to SHG
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Landmark className="text-red-500 w-8 h-8" />
          Internal Loans
        </h1>
        <p className="text-muted-foreground mt-2">Manage active debt, requests, and repayment history.</p>
      </div>

      <div className="grid gap-4">
        {loans?.map((loan: any) => {
          const isClosed = loan.status === "CLOSED";
          const isActive = loan.status === "ACTIVE";
          const isRequested = loan.status === "REQUESTED";

          return (
            <div key={loan.id} className={`glass-card p-6 rounded-2xl border-l-4 transition-all ${
              isActive ? "border-green-500" : isClosed ? "border-blue-500" : isRequested ? "border-orange-500" : "border-gray-500"
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {loan.shg_members?.users?.full_name || "Unknown Member"}
                  </h3>
                  <p className="text-gray-400 mt-1">Purpose: {loan.purpose || "N/A"}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 ${
                  isActive ? "bg-green-500/20 text-green-400" : 
                  isClosed ? "bg-blue-500/20 text-blue-400" : 
                  "bg-orange-500/20 text-orange-400"
                }`}>
                  {isActive && <CheckCircle className="w-4 h-4" />}
                  {isRequested && <Clock className="w-4 h-4" />}
                  {loan.status}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="text-sm text-gray-500">Principal</p>
                  <p className="text-lg font-bold text-white">₹{Number(loan.principal_amount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Interest</p>
                  <p className="text-lg font-bold text-white">{loan.interest_rate}% / mo</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Outstanding</p>
                  <p className={`text-lg font-bold ${loan.outstanding_principal > 0 ? "text-red-400" : "text-green-400"}`}>
                    ₹{Number(loan.outstanding_principal).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Repayments</p>
                  <p className="text-lg font-bold text-white">{loan.loan_repayments?.length || 0} Trxn</p>
                </div>
              </div>
            </div>
          );
        })}

        {(!loans || loans.length === 0) && (
          <div className="glass-card p-12 text-center rounded-2xl border border-white/5">
            <Landmark className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white">No Loans Found</h3>
            <p className="text-gray-400 mt-2">This group has no active or past loans.</p>
          </div>
        )}
      </div>
    </div>
  );
}
