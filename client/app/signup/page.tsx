"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { loginUser, signupUser } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signupUser({ name: name.trim(), email: email.trim(), password });
      const session = await loginUser({ email: email.trim(), password });
      saveAuth(session);
      router.push("/borrower");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#fde68a_0%,_#fcd34d_15%,_#fff7ed_45%,_#fffbeb_100%)] px-4 py-8 sm:px-6 sm:py-12">
      <div className="w-full max-w-md rounded-2xl border border-amber-300 bg-white p-6 sm:p-8 shadow-md">
        <h1 className="text-xl sm:text-2xl font-bold text-amber-950">Create borrower account</h1>
        <p className="mt-2 text-xs sm:text-sm text-amber-800">Start your loan journey in three quick steps.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-amber-900">Full name</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-amber-300 px-3 py-2 text-sm outline-none ring-amber-300 focus:ring"
              placeholder="Enter your name"
              style={{ color: '#1f2937' }}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-amber-900">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-amber-300 px-3 py-2 text-sm outline-none ring-amber-300 focus:ring"
              placeholder="you@example.com"
              style={{ color: '#1f2937' }}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-amber-900">Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-amber-300 px-3 py-2 pr-20 text-sm outline-none ring-amber-300 focus:ring"
                placeholder="Set a password"
                style={{ color: '#1f2937' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-xs sm:text-sm text-amber-900">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-amber-700 hover:text-amber-800">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
