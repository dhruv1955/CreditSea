"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  applyForLoan,
  getBorrowerPaymentHistory,
  getBorrowerProfile,
  savePersonalDetails,
  uploadSalarySlip,
} from "@/lib/api";
import { clearAuth, getAuth } from "@/lib/auth";
import { BorrowerProfile, EmploymentMode, PaymentRecord } from "@/lib/types";

const MIN_AMOUNT = 50000;
const MAX_AMOUNT = 500000;
const MIN_TENURE = 30;
const MAX_TENURE = 365;
const RATE = 12;

function money(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value);
}

export default function BorrowerPage() {
  const router = useRouter();
  const [session] = useState(() => getAuth());
  const [token] = useState(() => session?.token || "");
  const [profile, setProfile] = useState<BorrowerProfile | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [pan, setPan] = useState("");
  const [dob, setDob] = useState("");
  const [monthlySalary, setMonthlySalary] = useState("");
  const [employmentMode, setEmploymentMode] = useState<EmploymentMode>("salaried");
  const [salarySlip, setSalarySlip] = useState<File | null>(null);

  const [amount, setAmount] = useState(150000);
  const [tenure, setTenure] = useState(120);

  const simpleInterest = useMemo(() => Number(((amount * RATE * tenure) / (365 * 100)).toFixed(2)), [amount, tenure]);
  const totalRepayment = useMemo(() => Number((amount + simpleInterest).toFixed(2)), [amount, simpleInterest]);

  const hydrateFromProfile = (nextProfile: BorrowerProfile) => {
    setName(nextProfile.name || "");
    if (nextProfile.personalDetails) {
      setPan(nextProfile.personalDetails.pan || "");
      setMonthlySalary(nextProfile.personalDetails.monthlySalary ? String(nextProfile.personalDetails.monthlySalary) : "");
      setEmploymentMode(nextProfile.personalDetails.employmentMode || "salaried");

      const parsedDob = nextProfile.personalDetails.dob
        ? new Date(nextProfile.personalDetails.dob).toISOString().slice(0, 10)
        : "";
      setDob(parsedDob);
    }
  };

  const loadProfile = async (authToken: string) => {
    setLoading(true);
    setError("");

    try {
      const nextProfile = await getBorrowerProfile(authToken);
      setProfile(nextProfile);
      hydrateFromProfile(nextProfile);

      if (nextProfile.loan?.id && ["disbursed", "closed"].includes(nextProfile.loan.status)) {
        const history = await getBorrowerPaymentHistory(authToken, nextProfile.loan.id);
        setPayments(history.payments || []);
      } else {
        setPayments([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load borrower profile");
    } finally {
      setLoading(false);
    }
  };

  // Initial data load on page mount for the authenticated borrower session.
  useEffect(() => {
    if (!session) {
      router.replace("/login");
      return;
    }

    if (session.user.role !== "borrower") {
      router.replace("/dashboard");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProfile(session.token);
  }, [router, session]);

  const onSubmitPersonal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const parsedMonthlySalary = Number(monthlySalary);
      if (!Number.isFinite(parsedMonthlySalary) || parsedMonthlySalary < 25000) {
        throw new Error("Monthly salary must be at least 25000.");
      }

      const result = await savePersonalDetails(token, {
        name: name.trim(),
        pan: pan.trim().toUpperCase(),
        dob,
        monthlySalary: parsedMonthlySalary,
        employmentMode,
      });
      setMessage(result.breStatus === "passed" ? "Personal details saved and BRE passed." : "BRE failed. Update details and retry.");
      await loadProfile(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save personal details");
    } finally {
      setLoading(false);
    }
  };

  const onUploadSalarySlip = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !salarySlip) {
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      await uploadSalarySlip(token, salarySlip);
      setMessage("Salary slip uploaded successfully.");
      setSalarySlip(null);
      await loadProfile(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload salary slip");
    } finally {
      setLoading(false);
    }
  };

  const onApplyLoan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      await applyForLoan(token, { amount, tenure });
      setMessage("Loan application submitted.");
      await loadProfile(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply for loan");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    router.push("/login");
  };

  const currentStep = profile?.currentStep || "welcome";
  const loan = profile?.loan;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fde68a_0%,_#fcd34d_15%,_#fff7ed_45%,_#fffbeb_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl rounded-3xl border border-amber-300/80 bg-white/95 p-6 shadow-[0_20px_80px_-35px_rgba(120,53,15,0.5)] sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">Borrower Portal</p>
            <h1 className="text-2xl font-bold text-amber-950 sm:text-3xl">Welcome, {profile?.name || "Borrower"}</h1>
            <p className="mt-1 text-sm text-amber-800">Complete each step to move your loan to disbursement.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => token && void loadProfile(token)}
              className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-50"
            >
              Refresh
            </button>
            <button
              onClick={logout}
              className="rounded-lg bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            `Current step: ${currentStep}`,
            `BRE status: ${profile?.breStatus || "pending"}`,
            `Loan status: ${loan?.status || "none"}`,
          ].map((item) => (
            <div key={item} className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-900">
              {item}
            </div>
          ))}
        </div>

        {profile?.breStatus === "failed" && profile.breFailReason ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">BRE failed: {profile.breFailReason}</p>
        ) : null}

        {message ? <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p> : null}
        {error ? <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-amber-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-amber-950">1. Personal details and BRE</h2>
            <form className="mt-4 space-y-3" onSubmit={onSubmitPersonal}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Full name"
                className="w-full rounded-lg border border-amber-300 px-3 py-2 text-sm"
              />
              <input
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                required
                maxLength={10}
                placeholder="PAN (ABCDE1234F)"
                className="w-full rounded-lg border border-amber-300 px-3 py-2 text-sm uppercase"
              />
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
                className="w-full rounded-lg border border-amber-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={monthlySalary}
                min={25000}
                onChange={(e) => setMonthlySalary(e.target.value)}
                required
                placeholder="Monthly salary"
                className="w-full rounded-lg border border-amber-300 px-3 py-2 text-sm text-amber-950"
              />
              <select
                value={employmentMode}
                onChange={(e) => setEmploymentMode(e.target.value as EmploymentMode)}
                className="w-full rounded-lg border border-amber-300 px-3 py-2 text-sm"
              >
                <option value="salaried">Salaried</option>
                <option value="self_employed">Self employed</option>
                <option value="unemployed">Unemployed</option>
              </select>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
              >
                Save and run BRE
              </button>
            </form>
          </article>

          <article className="rounded-2xl border border-amber-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-amber-950">2. Salary slip upload</h2>
            <p className="mt-1 text-sm text-amber-800">Allowed formats: PDF, JPG, JPEG, PNG up to 5 MB.</p>

            <form className="mt-4 space-y-3" onSubmit={onUploadSalarySlip}>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-amber-900">Choose salary slip</span>
                <div className="rounded-lg border border-dashed border-amber-400 bg-amber-50 px-3 py-3 text-sm text-amber-900">
                  {salarySlip ? `Selected: ${salarySlip.name}` : "Upload your latest salary slip (PDF/JPG/JPEG/PNG, max 5 MB)."}
                </div>
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setSalarySlip(e.target.files?.[0] || null)}
                className="w-full rounded-lg border border-amber-300 px-3 py-2 text-sm text-amber-950 file:mr-3 file:rounded file:border-0 file:bg-amber-700 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-amber-800"
              />
              <button
                type="submit"
                disabled={loading || !salarySlip || profile?.breStatus !== "passed"}
                className="w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
              >
                Upload salary slip
              </button>
            </form>

            {profile?.salarySlipUrl ? (
              <p className="mt-3 text-sm font-medium text-emerald-700">Salary slip available: {profile.salarySlipUrl}</p>
            ) : null}
          </article>

          <article className="rounded-2xl border border-amber-200 bg-white p-5 lg:col-span-2">
            <h2 className="text-lg font-semibold text-amber-950">3. Loan configuration and apply</h2>

            <form className="mt-4 grid gap-6 lg:grid-cols-2" onSubmit={onApplyLoan}>
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
                  disabled={loading || profile?.breStatus !== "passed" || !profile?.salarySlipUrl || !!loan}
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
        </section>

        {loan ? (
          <section className="mt-8 rounded-2xl border border-amber-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-amber-950">Loan status tracking</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">Status: {loan.status}</div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">Amount: Rs {money(loan.amount)}</div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">Tenure: {loan.tenure} days</div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">Repayment: Rs {money(loan.totalRepayment)}</div>
            </div>

            {payments.length ? (
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-amber-200 text-left text-amber-900">
                      <th className="px-2 py-2">Payment date</th>
                      <th className="px-2 py-2">UTR</th>
                      <th className="px-2 py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment._id} className="border-b border-amber-100 text-amber-800">
                        <td className="px-2 py-2">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                        <td className="px-2 py-2">{payment.utr}</td>
                        <td className="px-2 py-2">Rs {money(payment.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : loan.status === "disbursed" || loan.status === "closed" ? (
              <p className="mt-4 text-sm text-amber-800">No payments recorded yet.</p>
            ) : null}
          </section>
        ) : null}

        {loading ? <p className="mt-4 text-sm text-amber-800">Syncing with server...</p> : null}
      </div>
    </main>
  );
}
