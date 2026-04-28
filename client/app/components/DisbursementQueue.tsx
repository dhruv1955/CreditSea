interface DisbursementQueueProps {
  disbursementQueue: Array<{
    _id: string;
    borrowerId: {
      name: string;
      email: string;
    } | string;
    amount: number;
    tenure: number;
    totalRepayment: number;
    sanctionedAt?: string;
  }>;
  onDisburse: (loanId: string) => void;
}

function money(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value);
}

function borrowerLabel(value: DisbursementQueueProps["disbursementQueue"][0]["borrowerId"]) {
  if (typeof value === "string") {
    return value;
  }
  return `${value.name} (${value.email})`;
}

export default function DisbursementQueue({
  disbursementQueue,
  onDisburse
}: DisbursementQueueProps) {
  return (
    <section className="rounded-2xl border border-amber-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-amber-950">Disbursement queue</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-amber-200 text-left text-amber-900">
              <th className="px-2 py-2">Borrower</th>
              <th className="px-2 py-2">Amount</th>
              <th className="px-2 py-2">Sanctioned at</th>
              <th className="px-2 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {disbursementQueue.map((loan) => (
              <tr key={loan._id} className="border-b border-amber-100 text-amber-800">
                <td className="px-2 py-2">{borrowerLabel(loan.borrowerId)}</td>
                <td className="px-2 py-2">Rs {money(loan.amount)}</td>
                <td className="px-2 py-2">{loan.sanctionedAt ? new Date(loan.sanctionedAt).toLocaleDateString() : "-"}</td>
                <td className="px-2 py-2">
                  <button
                    onClick={() => void onDisburse(loan._id)}
                    className="rounded bg-amber-700 px-2 py-1 text-xs font-semibold text-white"
                  >
                    Disburse
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!disbursementQueue.length ? <p className="pt-3 text-sm text-amber-800">No loans in disbursement queue.</p> : null}
      </div>
    </section>
  );
}
