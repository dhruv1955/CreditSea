interface SalesLeadsProps {
  salesLeads: Array<{
    _id: string;
    name: string;
    email: string;
    monthlySalary?: number;
    employmentMode?: string;
  }>;
}

function money(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value);
}

export default function SalesLeads({
  salesLeads
}: SalesLeadsProps) {
  return (
    <section className="rounded-2xl border border-amber-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-amber-950">Sales leads</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-amber-200 text-left text-amber-900">
              <th className="px-2 py-2">Name</th>
              <th className="px-2 py-2">Email</th>
              <th className="px-2 py-2">Monthly salary</th>
              <th className="px-2 py-2">Employment</th>
            </tr>
          </thead>
          <tbody>
            {salesLeads.map((lead) => (
              <tr key={lead._id} className="border-b border-amber-100 text-amber-800">
                <td className="px-2 py-2">{lead.name}</td>
                <td className="px-2 py-2">{lead.email}</td>
                <td className="px-2 py-2">{lead.monthlySalary ? `Rs ${money(lead.monthlySalary)}` : "-"}</td>
                <td className="px-2 py-2">{lead.employmentMode || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!salesLeads.length ? <p className="pt-3 text-sm text-amber-800">No sales leads available.</p> : null}
      </div>
    </section>
  );
}
