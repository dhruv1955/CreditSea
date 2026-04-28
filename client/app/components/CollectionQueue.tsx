interface CollectionQueueProps {
  collectionQueue: Array<{
    _id: string;
    borrowerId: {
      name: string;
      email: string;
    } | string;
    totalRepayment: number;
    totalPaid: number;
    outstanding: number;
  }>;
  paymentForms: Record<string, {
    utr: string;
    amount: string;
    paymentDate: string;
  }>;
  collectionHistory: Record<string, Array<{
    _id: string;
    paymentDate: string;
    utr: string;
    amount: number;
  }>>;
  onChangePaymentForm: (loanId: string, key: keyof CollectionQueueProps["paymentForms"][0], value: string) => void;
  onRecordPayment: (loanId: string) => void;
  onLoadCollectionHistory: (loanId: string) => void;
}

function money(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value);
}

function borrowerLabel(value: CollectionQueueProps["collectionQueue"][0]["borrowerId"]) {
  if (typeof value === "string") {
    return value;
  }
  return `${value.name} (${value.email})`;
}

const defaultPaymentForm = (): CollectionQueueProps["paymentForms"][0] => ({
  utr: "",
  amount: "",
  paymentDate: new Date().toISOString().slice(0, 10),
});

export default function CollectionQueue({
  collectionQueue,
  paymentForms,
  collectionHistory,
  onChangePaymentForm,
  onRecordPayment,
  onLoadCollectionHistory
}: CollectionQueueProps) {
  return (
    <section className="rounded-2xl border border-amber-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-amber-950">Collection queue</h2>
      <div className="mt-4 space-y-4">
        {collectionQueue.map((loan) => {
          const form = paymentForms[loan._id] || defaultPaymentForm();
          const history = collectionHistory[loan._id] || [];
          return (
            <article key={loan._id} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="grid gap-2 text-sm text-amber-900 sm:grid-cols-2 lg:grid-cols-4">
                <p>Borrower: {borrowerLabel(loan.borrowerId)}</p>
                <p>Repayment: Rs {money(loan.totalRepayment)}</p>
                <p>Total paid: Rs {money(loan.totalPaid)}</p>
                <p>Outstanding: Rs {money(loan.outstanding)}</p>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-4">
                <input
                  placeholder="UTR"
                  value={form.utr}
                  onChange={(e) => onChangePaymentForm(loan._id, "utr", e.target.value)}
                  className="rounded border border-amber-300 px-2 py-1 text-sm"
                  style={{ color: '#1f2937' }}
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={form.amount}
                  onChange={(e) => onChangePaymentForm(loan._id, "amount", e.target.value)}
                  className="rounded border border-amber-300 px-2 py-1 text-sm"
                  style={{ color: '#1f2937' }}
                />
                <input
                  type="date"
                  value={form.paymentDate}
                  onChange={(e) => onChangePaymentForm(loan._id, "paymentDate", e.target.value)}
                  className="rounded border border-amber-300 px-2 py-1 text-sm"
                  style={{ color: '#1f2937' }}
                />
                <button
                  onClick={() => void onRecordPayment(loan._id)}
                  className="rounded bg-amber-700 px-3 py-1 text-sm font-semibold text-white"
                >
                  Record payment
                </button>
              </div>

              <button
                onClick={() => void onLoadCollectionHistory(loan._id)}
                className="mt-3 rounded border border-amber-400 px-3 py-1 text-xs font-semibold text-amber-900"
              >
                Load payment history
              </button>

              {history.length ? (
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-amber-200 text-left text-amber-900">
                        <th className="px-2 py-2">Date</th>
                        <th className="px-2 py-2">UTR</th>
                        <th className="px-2 py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((payment) => (
                        <tr key={payment._id} className="border-b border-amber-100 text-amber-800">
                          <td className="px-2 py-2">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                          <td className="px-2 py-2">{payment.utr}</td>
                          <td className="px-2 py-2">Rs {money(payment.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </article>
          );
        })}
        {!collectionQueue.length ? <p className="text-sm text-amber-800">No loans in collection queue.</p> : null}
      </div>
    </section>
  );
}
