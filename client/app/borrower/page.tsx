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
import PersonalDetailsForm from "../components/PersonalDetailsForm";
import SalarySlipUpload from "../components/SalarySlipUpload";
import LoanCalculator from "../components/LoanCalculator";
import LoanStatusTracking from "../components/LoanStatusTracking";

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fde68a_0%,_#fcd34d_15%,_#fff7ed_45%,_#fffbeb_100%)] px-3 py-6 sm:px-4 sm:py-8">
      <div className="mx-auto max-w-5xl rounded-3xl border border-amber-300/80 bg-white/95 p-4 sm:p-6 shadow-[0_20px_80px_-35px_rgba(120,53,15,0.5)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">Borrower Portal</p>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-amber-950">Welcome, {profile?.name || "Borrower"}</h1>
            <p className="mt-1 text-xs sm:text-sm text-amber-800">Complete each step to move your loan to disbursement.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => token && void loadProfile(token)}
              className="rounded-lg border border-amber-300 px-3 py-2 text-xs sm:text-sm sm:px-4 font-medium text-amber-900 hover:bg-amber-50"
            >
              Refresh
            </button>
            <button
              onClick={logout}
              className="rounded-lg bg-amber-800 px-3 py-2 text-xs sm:text-sm sm:px-4 font-medium text-white hover:bg-amber-900"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 grid gap-2 sm:grid-cols-3">
          {[
            `Current step: ${currentStep}`,
            `BRE status: ${profile?.breStatus || "pending"}`,
            `Loan status: ${loan?.status || "none"}`,
          ].map((item) => (
            <div key={item} className="rounded-xl border border-amber-200 bg-amber-50 p-2 sm:p-3 text-xs sm:text-sm font-medium text-amber-900">
              {item}
            </div>
          ))}
        </div>

        {profile?.breStatus === "failed" && profile.breFailReason ? (
          <p className="mt-3 sm:mt-4 rounded-lg border border-red-200 bg-red-50 px-2 py-2 sm:px-3 text-xs sm:text-sm text-red-800">BRE failed: {profile.breFailReason}</p>
        ) : null}

        {message ? <p className="mt-3 sm:mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-2 sm:px-3 text-xs sm:text-sm text-emerald-800">{message}</p> : null}
        {error ? <p className="mt-3 sm:mt-4 rounded-lg border border-red-200 bg-red-50 px-2 py-2 sm:px-3 text-xs sm:text-sm text-red-800">{error}</p> : null}

        <section className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 lg:grid-cols-2">
          <PersonalDetailsForm
            name={name}
            setName={setName}
            pan={pan}
            setPan={setPan}
            dob={dob}
            setDob={setDob}
            monthlySalary={monthlySalary}
            setMonthlySalary={setMonthlySalary}
            employmentMode={employmentMode}
            setEmploymentMode={setEmploymentMode}
            onSubmit={onSubmitPersonal}
            loading={loading}
          />

          <SalarySlipUpload
            salarySlip={salarySlip}
            setSalarySlip={setSalarySlip}
            onSubmit={onUploadSalarySlip}
            loading={loading}
            salarySlipUrl={profile?.salarySlipUrl}
            breStatus={profile?.breStatus}
          />

          <LoanCalculator
            amount={amount}
            setAmount={setAmount}
            tenure={tenure}
            setTenure={setTenure}
            onSubmit={onApplyLoan}
            loading={loading}
            simpleInterest={simpleInterest}
            totalRepayment={totalRepayment}
          />
        </section>

        {loan ? (
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
        ) : null}

        {loading ? <p className="mt-3 text-xs sm:text-sm text-amber-800">Syncing with server...</p> : null}
      </div>
    </main>
  );
}
