interface SanctionQueueProps {
  sanctionQueue: Array<{
    _id: string;
    borrowerId: {
      name: string;
      email: string;
    } | string;
    amount: number;
    tenure: number;
    totalRepayment: number;
  }>;
  onApprove: (loanId: string) => void;
  onReject: (loanId: string) => void;
}

function money(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value);
}

function borrowerLabel(value: SanctionQueueProps["sanctionQueue"][0]["borrowerId"]) {
  if (typeof value === "string") {
    return value;
  }
  return `${value.name} (${value.email})`;
}

export default function SanctionQueue({
  sanctionQueue,
  onApprove,
  onReject
}: SanctionQueueProps) {
  return (
    <section className="rounded-2xl border border-amber-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-amber-950">Sanction queue</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-amber-200 text-left text-amber-900">
              <th className="px-2 py-2">Borrower</th>
              <th className="px-2 py-2">Amount</th>
              <th className="px-2 py-2">Tenure</th>
              <th className="px-2 py-2">Repayment</th>
              <th className="px-2 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sanctionQueue.map((loan) => (
              <tr key={loan._id} className="border-b border-amber-100 text-amber-800">
                <td className="px-2 py-2">{borrowerLabel(loan.borrowerId)}</td>
                <td className="px-2 py-2">Rs {money(loan.amount)}</td>
                <td className="px-2 py-2">{loan.tenure} days</td>
                <td className="px-2 py-2">Rs {money(loan.totalRepayment)}</td>
                <td className="px-2 py-2">
                  <div className="flex gap-2">
                    <button onClick={() => void onApprove(loan._id)} className="rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">
                      Approve
                    </button>
                    <button onClick={() => void onReject(loan._id)} className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white">
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!sanctionQueue.length ? <p className="pt-3 text-sm text-amber-800">No loans in sanction queue.</p> : null}
      </div>
    </section>
  );
}
