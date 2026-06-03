import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CreditCard, Plus, AlertCircle, CheckCircle2, Clock, TrendingDown, LogOut, ChevronRight, Calendar, XCircle } from "lucide-react";
import LoanApplyModal from "@/components/LoanApplyModal";
import LoanApprovalActions, { LoanDisburseButton } from "@/components/LoanApprovalActions";

export default async function LoansPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("members")
    .select("*, shgs(*)")
    .eq("profile_id", user.id)
    .single();

  if (!member) redirect("/join");

  // All loans for this SHG
  const { data: loans } = await supabase
    .from("loans")
    .select("*, loan_products(name, interest_rate_per_period)")
    .eq("shg_id", member.shg_id)
    .order("created_at", { ascending: false });

  // All loan products
  const { data: products } = await supabase
    .from("loan_products")
    .select("*")
    .eq("is_active", true);

  const allLoans = loans || [];
  const activeLoans = allLoans.filter(l => l.status === "ACTIVE");
  const pendingLoans = allLoans.filter(l => l.status === "PENDING");
  const closedLoans = allLoans.filter(l => l.status === "CLOSED");
  const totalOutstanding = activeLoans.reduce((s, l) => s + Number(l.outstanding_principal), 0);
  const shg = member.shgs as any;

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    PENDING: { label: "Pending Approval", color: "text-amber-600 bg-amber-50 border-amber-200", icon: Clock },
    ACTIVE: { label: "Active", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
    CLOSED: { label: "Closed", color: "text-gray-500 bg-gray-50 border-gray-200", icon: CheckCircle2 },
    OVERDUE: { label: "Overdue", color: "text-red-600 bg-red-50 border-red-200", icon: AlertCircle },
    APPROVED: { label: "Approved", color: "text-blue-600 bg-blue-50 border-blue-200", icon: CheckCircle2 },
    REJECTED: { label: "Rejected", color: "text-red-600 bg-red-50 border-red-200", icon: XCircle },
  };

  return (
    <div className="min-h-screen bg-[#fcf9f2]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="Setu" className="h-8 w-8 rounded-full border border-[#306e46]/20" />
            <span className="font-bold text-[#306e46]">Loan Portfolio</span>
          </Link>
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors bg-gray-50 px-4 py-2 rounded-full">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
        <div className="mb-8">
          <p className="text-sm text-gray-500 font-medium">{shg.name}</p>
          <h1 className="text-3xl font-bold text-[#1a1a1a]">Loan Portfolio</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Loans", value: activeLoans.length.toString(), color: "emerald" },
            { label: "Pending", value: pendingLoans.length.toString(), color: "amber" },
            { label: "Closed", value: closedLoans.length.toString(), color: "gray" },
            { label: "Total Outstanding", value: `₹${totalOutstanding.toLocaleString("en-IN")}`, color: "red" },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="text-xl font-bold text-[#1a1a1a]">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Apply Button */}
        <div className="mb-6">
          <LoanApplyModal shgId={member.shg_id} memberId={member.id} products={products || []} />
        </div>

        {/* Loans List */}
        <div className="space-y-4">
          {allLoans.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-6 py-16 text-center">
              <CreditCard className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No loans yet</p>
              <p className="text-gray-400 text-sm mt-1">Apply for your first loan to get started</p>
            </div>
          ) : (
            allLoans.map(loan => {
              const cfg = statusConfig[loan.status] || statusConfig["PENDING"];
              const StatusIcon = cfg.icon;
              const progress = loan.status === "CLOSED" ? 100 :
                Math.round(((Number(loan.principal_amount) - Number(loan.outstanding_principal)) / Number(loan.principal_amount)) * 100);

              return (
                <div key={loan.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-bold text-[#1a1a1a]">{(loan.loan_products as any)?.name ?? "Loan"}</span>
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">A/C: {loan.loan_account_number ?? "Pending"} · {loan.interest_rate}% / month</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-[#1a1a1a]">₹{Number(loan.outstanding_principal).toLocaleString("en-IN")}</div>
                      <div className="text-xs text-gray-400">of ₹{Number(loan.principal_amount).toLocaleString("en-IN")}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 bg-gray-100 rounded-full mb-3">
                    <div
                      className="h-2 bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{progress}% repaid</span>
                    {loan.expected_closure_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due: {new Date(loan.expected_closure_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    )}
                  </div>

                  {loan.purpose && (
                    <p className="mt-3 text-xs text-gray-500 border-t border-gray-50 pt-3">📝 {loan.purpose}</p>
                  )}

                  {loan.status === "ACTIVE" && (
                    <Link
                      href={`/loans/${loan.id}`}
                      className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-[#306e46]/5 text-[#306e46] text-sm font-semibold hover:bg-[#306e46]/10 transition-colors border border-[#306e46]/10"
                    >
                      View Repayment Schedule <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}

                  {/* Leader approval actions for PENDING loans */}
                  {member.is_leader && loan.status === "PENDING" && (
                    <LoanApprovalActions
                      loanId={loan.id}
                      shgId={member.shg_id}
                      principalAmount={Number(loan.principal_amount)}
                    />
                  )}

                  {/* Disburse button for APPROVED loans */}
                  {member.is_leader && loan.status === "APPROVED" && (
                    <LoanDisburseButton
                      loanId={loan.id}
                      shgId={member.shg_id}
                      principalAmount={Number(loan.principal_amount)}
                    />
                  )}

                  {loan.status === "REJECTED" && loan.rejection_reason && (
                    <p className="mt-3 text-xs text-red-500 border-t border-red-50 pt-3">❌ Rejected: {loan.rejection_reason}</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
