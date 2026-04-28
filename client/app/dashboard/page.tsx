"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  approveLoan,
  disburseLoan,
  getCollectionPaymentHistory,
  getCollectionQueue,
  getDisbursementQueue,
  getSalesLeads,
  getSanctionQueue,
  recordPayment,
  rejectLoan,
} from "@/lib/api";
import { clearAuth, getAuth } from "@/lib/auth";
import { CollectionQueueItem, LoanQueueItem, PaymentRecord, Role, SalesLead } from "@/lib/types";
import SalesLeads from "../components/SalesLeads";
import SanctionQueue from "../components/SanctionQueue";
import DisbursementQueue from "../components/DisbursementQueue";
import CollectionQueue from "../components/CollectionQueue";

function money(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value);
}

function borrowerLabel(value: LoanQueueItem["borrowerId"] | CollectionQueueItem["borrowerId"]) {
  if (typeof value === "string") {
    return value;
  }
  return `${value.name} (${value.email})`;
}

type PaymentFormState = {
  utr: string;
  amount: string;
  paymentDate: string;
};

const defaultPaymentForm = (): PaymentFormState => ({
  utr: "",
  amount: "",
  paymentDate: new Date().toISOString().slice(0, 10),
});

export default function DashboardPage() {
  const router = useRouter();
  const [session] = useState(() => getAuth());
  const [token] = useState(() => session?.token || "");
  const [role] = useState<Role | null>(() => session?.user.role || null);

  const [salesLeads, setSalesLeads] = useState<SalesLead[]>([]);
  const [sanctionQueue, setSanctionQueue] = useState<LoanQueueItem[]>([]);
  const [disbursementQueue, setDisbursementQueue] = useState<LoanQueueItem[]>([]);
  const [collectionQueue, setCollectionQueue] = useState<CollectionQueueItem[]>([]);

  const [collectionHistory, setCollectionHistory] = useState<Record<string, PaymentRecord[]>>({});
  const [paymentForms, setPaymentForms] = useState<Record<string, PaymentFormState>>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const canSeeSales = role === "sales" || role === "admin";
  const canSeeSanction = role === "sanction" || role === "admin";
  const canSeeDisbursement = role === "disbursement" || role === "admin";
  const canSeeCollection = role === "collection" || role === "admin";

  const activeModules = useMemo(() => {
    const items: string[] = [];
    if (canSeeSales) items.push("Sales");
    if (canSeeSanction) items.push("Sanction");
    if (canSeeDisbursement) items.push("Disbursement");
    if (canSeeCollection) items.push("Collection");
    return items;
  }, [canSeeCollection, canSeeDisbursement, canSeeSales, canSeeSanction]);

  const loadDashboard = async (authToken: string, authRole: Role) => {
    setLoading(true);
    setError("");

    try {
      const tasks: Promise<void>[] = [];

      if (authRole === "sales" || authRole === "admin") {
        tasks.push(
          getSalesLeads(authToken).then((data) => {
            setSalesLeads(data);
          })
        );
      }
      if (authRole === "sanction" || authRole === "admin") {
        tasks.push(
          getSanctionQueue(authToken).then((data) => {
            setSanctionQueue(data);
          })
        );
      }
      if (authRole === "disbursement" || authRole === "admin") {
        tasks.push(
          getDisbursementQueue(authToken).then((data) => {
            setDisbursementQueue(data);
          })
        );
      }
      if (authRole === "collection" || authRole === "admin") {
        tasks.push(
          getCollectionQueue(authToken).then((data) => {
            setCollectionQueue(data);
            const nextForms: Record<string, PaymentFormState> = {};
            data.forEach((item) => {
              nextForms[item._id] = paymentForms[item._id] || defaultPaymentForm();
            });
            setPaymentForms(nextForms);
          })
        );
      }

      await Promise.all(tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Initial data load on page mount for the authenticated dashboard session.
  useEffect(() => {
    if (!session) {
      router.replace("/login");
      return;
    }

    if (session.user.role === "borrower") {
      router.replace("/borrower");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDashboard(session.token, session.user.role);
  }, [router, session]);

  const refresh = async () => {
    if (!token || !role) {
      return;
    }
    await loadDashboard(token, role);
  };

  const onApprove = async (loanId: string) => {
    if (!token) {
      return;
    }
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await approveLoan(token, loanId);
      setMessage("Loan approved.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve loan");
    } finally {
      setLoading(false);
    }
  };

  const onReject = async (loanId: string) => {
    if (!token) {
      return;
    }
    const reason = window.prompt("Enter rejection reason:");
    if (!reason) {
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);
    try {
      await rejectLoan(token, loanId, reason);
      setMessage("Loan rejected.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject loan");
    } finally {
      setLoading(false);
    }
  };

  const onDisburse = async (loanId: string) => {
    if (!token) {
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);
    try {
      await disburseLoan(token, loanId);
      setMessage("Loan disbursed.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disburse loan");
    } finally {
      setLoading(false);
    }
  };

  const onChangePaymentForm = (loanId: string, key: keyof PaymentFormState, value: string) => {
    setPaymentForms((prev) => ({
      ...prev,
      [loanId]: {
        ...(prev[loanId] || defaultPaymentForm()),
        [key]: value,
      },
    }));
  };

  const onRecordPayment = async (loanId: string) => {
    if (!token) {
      return;
    }

    const form = paymentForms[loanId] || defaultPaymentForm();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await recordPayment(token, loanId, {
        utr: form.utr.trim(),
        amount: Number(form.amount),
        paymentDate: form.paymentDate,
      });
      setMessage("Payment recorded.");
      setPaymentForms((prev) => ({ ...prev, [loanId]: defaultPaymentForm() }));
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  const onLoadCollectionHistory = async (loanId: string) => {
    if (!token) {
      return;
    }

    setError("");
    try {
      const history = await getCollectionPaymentHistory(token, loanId);
      setCollectionHistory((prev) => ({ ...prev, [loanId]: history.payments || [] }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch payment history");
    }
  };

  const logout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fde68a_0%,_#fcd34d_15%,_#fff7ed_45%,_#fffbeb_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl rounded-3xl border border-amber-300/80 bg-white/95 p-6 shadow-[0_20px_80px_-35px_rgba(120,53,15,0.5)] sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">Operations Dashboard</p>
            <h1 className="text-2xl font-bold text-amber-950 sm:text-3xl">Role: {role || "loading"}</h1>
            <p className="mt-1 text-sm text-amber-800">Modules enabled: {activeModules.join(", ") || "none"}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={refresh}
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

        {message ? <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p> : null}
        {error ? <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
        {loading ? <p className="mt-3 text-sm text-amber-800">Syncing with server...</p> : null}

        <div className="mt-6 space-y-6">
          {canSeeSales ? (
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
          ) : null}

          {canSeeSanction ? (
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
          ) : null}

          {canSeeDisbursement ? (
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
          ) : null}

          {canSeeCollection ? (
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
          ) : null}
        </div>
      </div>
    </main>
  );
}
