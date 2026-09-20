"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        setError("Password incorreta.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Ocorreu um erro. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0d0a09] px-6 text-white">
      <section className="flex min-h-screen flex-col items-center justify-center text-center">
        <p className="mb-4 text-xs tracking-[0.45em] text-white/40">
          CARDOSO · 18 ANOS
        </p>

        <h1 className="text-4xl font-light tracking-[0.12em]">
          ADMIN
        </h1>

        <p className="mt-4 text-sm text-white/40">
          Área reservada
        </p>

        <form
          onSubmit={handleLogin}
          className="mt-10 w-full max-w-sm"
        >
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="PASSWORD"
            autoComplete="current-password"
            className="w-full rounded-full border border-white/20 bg-transparent px-6 py-4 text-center text-sm tracking-[0.2em] outline-none transition placeholder:text-white/30 focus:border-white/50"
          />

          <button
            type="submit"
            disabled={loading || !password}
            className="mt-4 w-full rounded-full border border-white/40 px-8 py-4 text-sm tracking-[0.25em] transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "A ENTRAR..." : "ENTRAR"}
          </button>

          {error && (
            <p className="mt-5 text-sm text-red-300">
              {error}
            </p>
          )}
        </form>

        <p className="mt-12 text-xs tracking-[0.2em] text-white/30">
          25 · 09 · 2026
        </p>
      </section>
    </main>
  );
}