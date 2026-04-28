"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { loginUser } from "@/lib/api";
import { clearAuth, getAuth, saveAuth } from "@/lib/auth";
import { AuthSession } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [existingSession, setExistingSession] = useState<AuthSession | null>(null);

  // Hydrate existing session on client side
  useEffect(() => {
    setExistingSession(getAuth());
  }, []);

  const continueAsCurrentUser = () => {
    if (!existingSession) return;
    if (existingSession.user.role === "borrower") {
      router.push("/borrower");
      return;
    }
    router.push("/dashboard");
  };

  const useDifferentAccount = () => {
    clearAuth();
    setExistingSession(null);
    setEmail("");
    setPassword("");
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const session = await loginUser({ email: email.trim(), password });
      saveAuth(session);
      if (session.user.role === "borrower") {
        router.push("/borrower");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#fde68a_0%,_#fcd34d_15%,_#fff7ed_45%,_#fffbeb_100%)] px-4 py-8 sm:px-6 sm:py-12">
      <div className="w-full max-w-md rounded-2xl border border-amber-300 bg-white p-6 sm:p-8 shadow-md">
        <h1 className="text-xl sm:text-2xl font-bold text-amber-950">Login to CreditSea LMS</h1>
        <p className="mt-2 text-xs sm:text-sm text-amber-800">Use your borrower or operations credentials.</p>

        {existingSession ? (
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs sm:text-sm text-amber-900">
            <p>
              Signed in as <span className="font-semibold">{existingSession.user.email}</span>.
            </p>
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={continueAsCurrentUser}
                className="rounded-md bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-800 w-full sm:w-auto"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={useDifferentAccount}
                className="rounded-md border border-amber-400 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 w-full sm:w-auto"
              >
                Sign in with different account
              </button>
            </div>
          </div>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-amber-900">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-amber-300 px-3 py-2 pr-20 text-sm outline-none ring-amber-300 focus:ring"
                placeholder="Enter your password"
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
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-xs sm:text-sm text-amber-900">
          New borrower?{" "}
          <Link href="/signup" className="font-semibold text-amber-700 hover:text-amber-800">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
