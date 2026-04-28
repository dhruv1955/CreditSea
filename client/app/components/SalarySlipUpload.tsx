interface SalarySlipUploadProps {
  salarySlip: File | null;
  setSalarySlip: (file: File | null) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  salarySlipUrl?: string;
  breStatus?: string;
}

export default function SalarySlipUpload({
  salarySlip,
  setSalarySlip,
  onSubmit,
  loading,
  salarySlipUrl,
  breStatus
}: SalarySlipUploadProps) {
  return (
    <article className="rounded-2xl border border-amber-200 bg-white p-4 sm:p-5">
      <h2 className="text-base sm:text-lg font-semibold text-amber-950">2. Salary slip upload</h2>
      <p className="mt-1 text-xs sm:text-sm text-amber-800">Allowed formats: PDF, JPG, JPEG, PNG up to 5 MB.</p>

      <form className="mt-3 sm:mt-4 space-y-3" onSubmit={onSubmit}>
        <label className="block">
          <span className="mb-1 block text-xs sm:text-sm font-medium text-amber-900">Choose salary slip</span>
          <div className="rounded-lg border border-dashed border-amber-400 bg-amber-50 px-3 py-2 sm:py-3 text-xs sm:text-sm text-amber-900">
            {salarySlip ? `Selected: ${salarySlip.name}` : "Upload your latest salary slip (PDF/JPG/JPEG/PNG, max 5 MB)."}
          </div>
        </label>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => setSalarySlip(e.target.files?.[0] || null)}
          className="w-full rounded-lg border border-amber-300 px-3 py-2 text-xs sm:text-sm file:mr-2 sm:file:mr-3 file:rounded file:border-0 file:bg-amber-700 file:px-2 sm:file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-amber-800"
          style={{ color: '#1f2937' }}
        />
        <button
          type="submit"
          disabled={loading || !salarySlip || breStatus !== "passed"}
          className="w-full rounded-lg bg-amber-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
        >
          Upload salary slip
        </button>
      </form>

      {salarySlipUrl ? (
        <p className="mt-3 text-xs sm:text-sm font-medium text-emerald-700">Salary slip available: {salarySlipUrl}</p>
      ) : null}
    </article>
  );
}
