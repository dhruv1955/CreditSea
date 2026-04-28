"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { loginUser } from "@/lib/api";
import { getAuth, saveAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = getAuth();
    if (!session) {
      return;
    }

    if (session.user.role === "borrower") {
      router.replace("/borrower");
      return;
    }
    router.replace("/dashboard");
  }, [router]);

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
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#fef3c7_0%,_#fff7ed_45%,_#fffbeb_100%)] px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-amber-950">Login to CreditSea LMS</h1>
        <p className="mt-2 text-sm text-amber-800">Use your borrower or operations credentials.</p>

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
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-amber-900">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-amber-300 px-3 py-2 text-sm outline-none ring-amber-300 focus:ring"
              placeholder="Enter your password"
            />
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

        <p className="mt-4 text-sm text-amber-900">
          New borrower?{" "}
          <Link href="/signup" className="font-semibold text-amber-700 hover:text-amber-800">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
