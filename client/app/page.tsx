export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#fef3c7_0%,_#fff7ed_45%,_#fffbeb_100%)] px-6 py-16">
      <main className="w-full max-w-5xl rounded-3xl border border-amber-200/60 bg-white/90 p-8 shadow-[0_25px_90px_-30px_rgba(146,64,14,0.35)] backdrop-blur md:p-12">
        <p className="mb-4 inline-flex rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-900">
          CreditSea Loan Management System
        </p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight text-amber-950 md:text-6xl">
          End-to-end loan workflows for borrowers and ops teams.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-amber-800 md:text-lg">
          Borrowers can submit profiles, upload salary slips, and apply for loans. Internal teams can review,
          sanction, disburse, and collect payments with role-based access control.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            Login
          </a>
          <a
            href="/signup"
            className="inline-flex items-center justify-center rounded-xl border border-amber-300 px-6 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-50"
          >
            Create Borrower Account
          </a>
        </div>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Borrower self-service flow",
            "Sales and sanction pipeline",
            "Disbursement and collection tracking",
            "BRE and validation gates",
            "Status transition controls",
            "Payment history and closure",
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm font-medium text-amber-900">
              {item}
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
