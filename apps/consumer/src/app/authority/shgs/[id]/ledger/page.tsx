import { createClient } from "@/utils/supabase/server";
import { PiggyBank, ArrowUpRight, ArrowDownRight, FileText } from "lucide-react";
import Link from "next/link";

export default async function SavingsLedgerPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  const { data: accounts, error } = await supabase
    .from("savings_accounts")
    .select("*, shg_members(users(full_name, phone)), savings_transactions(*)")
    .eq("shg_id", params.id);

  if (error) {
    return <div className="p-4 rounded-lg bg-destructive/10 text-destructive">Failed to load savings ledger.</div>;
  }

  const totalSavings = accounts?.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0) || 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/shgs/${params.id}`} className="text-primary hover:underline font-medium">
          &larr; Back to SHG
        </Link>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <PiggyBank className="text-purple-500 w-8 h-8" />
            Savings Ledger
          </h1>
          <p className="text-muted-foreground mt-2">Group pool and individual member passbooks.</p>
        </div>
        <div className="glass-card px-6 py-4 rounded-xl border-t-4 border-purple-500">
          <p className="text-sm text-gray-400">Total Group Savings</p>
          <p className="text-3xl font-bold text-white mt-1">₹{totalSavings.toLocaleString()}</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 text-gray-400 border-b border-white/10">
              <th className="p-4 font-medium">Member Name</th>
              <th className="p-4 font-medium">Phone Number</th>
              <th className="p-4 font-medium text-right">Current Balance</th>
              <th className="p-4 font-medium text-center">Transactions</th>
              <th className="p-4 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {accounts?.map((acc: any) => (
              <tr key={acc.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 text-white font-medium">{acc.shg_members?.users?.full_name || "Unknown"}</td>
                <td className="p-4 text-gray-400">{acc.shg_members?.users?.phone}</td>
                <td className="p-4 text-right font-bold text-green-500">₹{Number(acc.balance).toLocaleString()}</td>
                <td className="p-4 text-center">
                  <span className="bg-white/10 px-3 py-1 rounded-full text-sm">
                    {acc.savings_transactions?.length || 0} entries
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button className="text-primary hover:text-blue-400 font-medium flex items-center justify-center gap-2 mx-auto">
                    <FileText className="w-4 h-4" />
                    Passbook
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {(!accounts || accounts.length === 0) && (
          <div className="p-12 text-center">
            <PiggyBank className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white">No Savings Data</h3>
            <p className="text-gray-400 mt-2">No accounts exist for this group yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
