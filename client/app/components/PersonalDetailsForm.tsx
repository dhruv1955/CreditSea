interface PersonalDetailsFormProps {
  name: string;
  setName: (name: string) => void;
  pan: string;
  setPan: (pan: string) => void;
  dob: string;
  setDob: (dob: string) => void;
  monthlySalary: string;
  setMonthlySalary: (salary: string) => void;
  employmentMode: "salaried" | "self_employed" | "unemployed";
  setEmploymentMode: (mode: "salaried" | "self_employed" | "unemployed") => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
}

export default function PersonalDetailsForm({
  name,
  setName,
  pan,
  setPan,
  dob,
  setDob,
  monthlySalary,
  setMonthlySalary,
  employmentMode,
  setEmploymentMode,
  onSubmit,
  loading
}: PersonalDetailsFormProps) {
  return (
    <article className="rounded-2xl border border-amber-200 bg-white p-4 sm:p-5">
      <h2 className="text-base sm:text-lg font-semibold text-amber-950">1. Personal details and BRE</h2>
      <form className="mt-3 sm:mt-4 space-y-3" onSubmit={onSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Full name"
          className="w-full rounded-lg border border-amber-300 px-3 py-2 text-xs sm:text-sm"
          style={{ color: '#1f2937' }}
        />
        <input
          value={pan}
          onChange={(e) => setPan(e.target.value.toUpperCase())}
          required
          maxLength={10}
          placeholder="PAN (ABCDE1234F)"
          className="w-full rounded-lg border border-amber-300 px-3 py-2 text-xs sm:text-sm uppercase"
          style={{ color: '#1f2937' }}
        />
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          required
          className="w-full rounded-lg border border-amber-300 px-3 py-2 text-xs sm:text-sm"
          style={{ color: '#1f2937' }}
        />
        <input
          type="number"
          value={monthlySalary}
          min={25000}
          onChange={(e) => setMonthlySalary(e.target.value)}
          required
          placeholder="Monthly salary"
          className="w-full rounded-lg border border-amber-300 px-3 py-2 text-xs sm:text-sm"
          style={{ color: '#1f2937' }}
        />
        <select
          value={employmentMode}
          onChange={(e) => setEmploymentMode(e.target.value as "salaried" | "self_employed" | "unemployed")}
          className="w-full rounded-lg border border-amber-300 px-3 py-2 text-xs sm:text-sm"
          style={{ color: '#1f2937' }}
        >
          <option value="salaried">Salaried</option>
          <option value="self_employed">Self employed</option>
          <option value="unemployed">Unemployed</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-amber-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
        >
          Save and run BRE
        </button>
      </form>
    </article>
  );
}
