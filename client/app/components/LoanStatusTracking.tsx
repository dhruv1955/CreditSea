interface LoanStatusTrackingProps {
  loan: {
    status: string;
    amount: number;
    tenure: number;
    totalRepayment: number;
  };
  payments: Array<{
    _id: string;
    paymentDate: string;
    utr: string;
    amount: number;
  }>;
}

function money(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value);
}

export default function LoanStatusTracking({
  loan,
  payments
}: LoanStatusTrackingProps) {
  return (
    <section className="mt-6 sm:mt-8 rounded-2xl border border-amber-200 bg-white p-3 sm:p-5">
      <h2 className="text-base sm:text-lg font-semibold text-amber-950">Loan status tracking</h2>
      <div className="mt-2 sm:mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 sm:p-3 text-xs sm:text-sm" style={{ color: '#1f2937' }}>Status: {loan.status}</div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 sm:p-3 text-xs sm:text-sm" style={{ color: '#1f2937' }}>Amount: Rs {money(loan.amount)}</div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 sm:p-3 text-xs sm:text-sm" style={{ color: '#1f2937' }}>Tenure: {loan.tenure} days</div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 sm:p-3 text-xs sm:text-sm" style={{ color: '#1f2937' }}>Repayment: Rs {money(loan.totalRepayment)}</div>
      </div>

      {payments.length ? (
        <div className="mt-3 sm:mt-5 overflow-x-auto">
          <table className="min-w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-amber-200 text-left text-amber-900">
                <th className="px-1 sm:px-2 py-1 sm:py-2">Payment date</th>
                <th className="px-1 sm:px-2 py-1 sm:py-2">UTR</th>
                <th className="px-1 sm:px-2 py-1 sm:py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id} className="border-b border-amber-100 text-amber-800">
                  <td className="px-1 sm:px-2 py-1 sm:py-2">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                  <td className="px-1 sm:px-2 py-1 sm:py-2">{payment.utr}</td>
                  <td className="px-1 sm:px-2 py-1 sm:py-2">Rs {money(payment.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : loan.status === "disbursed" || loan.status === "closed" ? (
        <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-amber-800">No payments recorded yet.</p>
      ) : null}
    </section>
  );
}
