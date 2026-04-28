interface LoanCalculatorProps {
  amount: number;
  setAmount: (amount: number) => void;
  tenure: number;
  setTenure: (tenure: number) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  simpleInterest: number;
  totalRepayment: number;
}

const MIN_AMOUNT = 50000;
const MAX_AMOUNT = 500000;
const MIN_TENURE = 30;
const MAX_TENURE = 365;
const RATE = 12;

function money(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value);
}

export default function LoanCalculator({
  amount,
  setAmount,
  tenure,
  setTenure,
  onSubmit,
  loading,
  simpleInterest,
  totalRepayment
}: LoanCalculatorProps) {
  return (
    <article className="rounded-2xl border border-amber-200 bg-white p-5 lg:col-span-2">
      <h2 className="text-lg font-semibold text-amber-950">3. Loan configuration and apply</h2>

      <form className="mt-4 grid gap-6 lg:grid-cols-2" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm font-medium text-amber-900">Loan amount: Rs {money(amount)}</label>
          <input
            type="range"
            min={MIN_AMOUNT}
            max={MAX_AMOUNT}
            step={1000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-2 w-full"
          />

          <label className="mt-5 block text-sm font-medium text-amber-900">Tenure: {tenure} days</label>
          <input
            type="range"
            min={MIN_TENURE}
            max={MAX_TENURE}
            step={1}
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="mt-2 w-full"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-60"
          >
            Apply for loan
          </button>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">Live repayment calculation</p>
          <p className="mt-2 text-sm text-amber-800">Formula: (P x R x T) / (365 x 100)</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-amber-700">Principal</dt>
              <dd className="font-semibold text-amber-950">Rs {money(amount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-amber-700">Interest rate</dt>
              <dd className="font-semibold text-amber-950">{RATE}%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-amber-700">Tenure</dt>
              <dd className="font-semibold text-amber-950">{tenure} days</dd>
            </div>
            <div className="flex justify-between border-t border-amber-200 pt-2">
              <dt className="text-amber-900">Simple interest</dt>
              <dd className="font-semibold text-amber-950">Rs {money(simpleInterest)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-amber-900">Total repayment</dt>
              <dd className="font-semibold text-amber-950">Rs {money(totalRepayment)}</dd>
            </div>
          </dl>
        </div>
      </form>
    </article>
  );
}
