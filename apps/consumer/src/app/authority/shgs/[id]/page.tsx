import { createClient } from "@/utils/supabase/server";
import { Users, PiggyBank, Landmark, CalendarCheck, MapPin, Database } from "lucide-react";
import Link from "next/link";

const MOCK_SHG = {
  id: "mock-1",
  name: "Saraswati Mahila Samiti",
  village: "Rampur",
  panchayat: "Gola",
  district: "Gorakhpur",
  shg_members: [
    { role: 'SECRETARY', users: { id: "u1", full_name: "Anita Devi", phone: "+91 9876543210" } },
    { role: 'MEMBER', users: { id: "u2", full_name: "Sunita Sharma", phone: "+91 9876543211" } },
    { role: 'MEMBER', users: { id: "u3", full_name: "Meena Kumari", phone: "+91 9876543212" } }
  ]
};

export default async function ShgDetailsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  let shg = null;
  let dbError = false;

  try {
    const { data, error } = await supabase
      .from("shgs")
      .select("*, shg_members(users(full_name, phone, id), role)")
      .eq("id", params.id)
      .single();

    if (error) throw error;
    shg = data;
  } catch (err) {
    dbError = true;
    shg = MOCK_SHG;
  }

  return (
    <div className="space-y-8 max-w-6xl">
      
      {dbError && (
        <div className="glass-card border border-white/10 bg-black/30 p-3 rounded-xl flex items-center gap-3">
          <Database className="w-4 h-4 text-gray-400" />
          <p className="text-gray-300 text-[13px] font-medium">
            Database Uninitialized. Viewing Demo Data.
          </p>
        </div>
      )}

      {/* Hero Header Minimal */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        <div className="w-20 h-20 rounded-2xl glass-card flex items-center justify-center text-white font-semibold text-3xl">
          {shg.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">{shg.name}</h1>
          <div className="flex items-center gap-4 mt-2 text-gray-400 text-sm">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> {shg.village}, {shg.panchayat}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" /> {shg.shg_members?.length || 0} Members
            </span>
          </div>
        </div>
      </div>

      {/* Module Grid Minimal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link href={`/dashboard/shgs/${shg.id}/ledger`} className="glass-card-hover group p-5 rounded-2xl glass-card flex flex-col justify-between min-h-[140px]">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 text-gray-300 flex items-center justify-center mb-4">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Savings Ledger</h3>
            <p className="text-gray-500 text-[13px]">Manage passbooks and deposits.</p>
          </div>
        </Link>

        <Link href={`/dashboard/shgs/${shg.id}/loans`} className="glass-card-hover group p-5 rounded-2xl glass-card flex flex-col justify-between min-h-[140px]">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 text-gray-300 flex items-center justify-center mb-4">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Internal Loans</h3>
            <p className="text-gray-500 text-[13px]">Track debts and repayments.</p>
          </div>
        </Link>

        <Link href={`/dashboard/shgs/${shg.id}/attendance`} className="glass-card-hover group p-5 rounded-2xl glass-card flex flex-col justify-between min-h-[140px]">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 text-gray-300 flex items-center justify-center mb-4">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Attendance</h3>
            <p className="text-gray-500 text-[13px]">Review historical meeting presence.</p>
          </div>
        </Link>
      </div>

      {/* Directory Table Minimal */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          Member Directory
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-gray-500">
                <th className="pb-3 font-medium text-[13px]">Name</th>
                <th className="pb-3 font-medium text-[13px]">Phone Number</th>
                <th className="pb-3 font-medium text-[13px]">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {shg.shg_members?.map((member: any) => (
                <tr key={member.users.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 text-white text-[14px] font-medium flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-semibold text-gray-300">
                      {member.users.full_name?.charAt(0) || "M"}
                    </div>
                    {member.users.full_name || "Unknown Member"}
                  </td>
                  <td className="py-3 text-gray-400 text-[14px]">{member.users.phone}</td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${
                      member.role === 'SECRETARY' 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-white/5 text-gray-400'
                    }`}>
                      {member.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
