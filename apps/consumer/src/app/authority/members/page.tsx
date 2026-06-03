import { Plus, Phone, MoreHorizontal, Crown, ShieldCheck, User } from "lucide-react";

const MEMBERS = [
  { id: "1", name: "Anita Devi", phone: "+91 9876543210", role: "PRESIDENT", joinedAt: "Jan 2023", savings: 12500, status: "ACTIVE" },
  { id: "2", name: "Sunita Sharma", phone: "+91 9876543211", role: "SECRETARY", joinedAt: "Jan 2023", savings: 11200, status: "ACTIVE" },
  { id: "3", name: "Meena Kumari", phone: "+91 9876543212", role: "TREASURER", joinedAt: "Feb 2023", savings: 10800, status: "ACTIVE" },
  { id: "4", name: "Radha Devi", phone: "+91 9876543213", role: "MEMBER", joinedAt: "Mar 2023", savings: 9400, status: "ACTIVE" },
  { id: "5", name: "Geeta Singh", phone: "+91 9876543214", role: "MEMBER", joinedAt: "Apr 2023", savings: 8200, status: "ACTIVE" },
  { id: "6", name: "Kamla Yadav", phone: "+91 9876543215", role: "MEMBER", joinedAt: "Apr 2023", savings: 7800, status: "ACTIVE" },
  { id: "7", name: "Savita Tiwari", phone: "+91 9876543216", role: "MEMBER", joinedAt: "May 2023", savings: 6900, status: "ACTIVE" },
  { id: "8", name: "Pushpa Gupta", phone: "+91 9876543217", role: "MEMBER", joinedAt: "Jun 2023", savings: 5400, status: "INACTIVE" },
];

function RoleBadge({ role }: { role: string }) {
  if (role === "PRESIDENT") return <span className="badge badge-orange flex items-center gap-1"><Crown className="w-3 h-3" />President</span>;
  if (role === "SECRETARY") return <span className="badge badge-blue flex items-center gap-1"><ShieldCheck className="w-3 h-3" />Secretary</span>;
  if (role === "TREASURER") return <span className="badge badge-green">Treasurer</span>;
  return <span className="badge badge-gray flex items-center gap-1"><User className="w-3 h-3" />Member</span>;
}

export default function MembersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[13px] text-[#636366] font-medium uppercase tracking-wider">Saraswati Mahila Samiti</p>
          <h1 className="text-[26px] font-bold text-[#F5F5F7] tracking-tight mt-1">Members</h1>
        </div>
        <button className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Members", value: MEMBERS.length, color: "#0A84FF" },
          { label: "Active", value: MEMBERS.filter(m => m.status === "ACTIVE").length, color: "#30D158" },
          { label: "Inactive", value: MEMBERS.filter(m => m.status === "INACTIVE").length, color: "#FF9F0A" },
        ].map(stat => (
          <div key={stat.label} className="card p-4">
            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Member Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-[#F5F5F7]">Member Directory</h2>
          <input className="input w-[220px]" placeholder="Search members..." />
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Total Savings</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {MEMBERS.map((member) => (
              <tr key={member.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.08)] flex items-center justify-center text-[13px] font-semibold text-[#98989F]">
                      {member.name.charAt(0)}
                    </div>
                    <span className="font-medium text-[#F5F5F7]">{member.name}</span>
                  </div>
                </td>
                <td>
                  <span className="flex items-center gap-1.5 text-[#98989F]">
                    <Phone className="w-3.5 h-3.5" />
                    {member.phone}
                  </span>
                </td>
                <td><RoleBadge role={member.role} /></td>
                <td><span className="text-[#636366]">{member.joinedAt}</span></td>
                <td><span className="font-semibold text-[#30D158]">₹{member.savings.toLocaleString()}</span></td>
                <td>
                  <span className={`badge ${member.status === "ACTIVE" ? "badge-green" : "badge-gray"}`}>
                    {member.status}
                  </span>
                </td>
                <td>
                  <button className="btn btn-ghost p-2">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
