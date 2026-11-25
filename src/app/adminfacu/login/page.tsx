"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("facu@marvelousgaming.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo iniciar sesión.");
        return;
      }
      router.push("/adminfacu");
      router.refresh();
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-obsidian-950 bg-obsidian-radial px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-obsidian-850 p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <img
            src="/images/marvelous-logo.jpg"
            alt="Marvelous Gaming"
            className="h-24 w-24 rounded-2xl object-cover ring-1 ring-white/15 shadow-xl"
          />
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-crimson-950/60 px-3 py-1 text-xs font-semibold text-crimson-300 ring-1 ring-crimson-500/40">
            <Lock className="h-3.5 w-3.5" />
            Acceso Privado de Administración
          </div>
          <h1 className="mt-3 font-display text-2xl font-black text-white">
            Marvelous Gaming Studio
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Ingresá con tu cuenta autorizada para gestionar cartas, productos y
            ventas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Email autorizado
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="facu@marvelousgaming.com"
              className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-4 py-3 text-sm text-white outline-none focus:border-crimson-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Contraseña
            </label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/10 bg-obsidian-950 px-4 py-3 text-sm text-white outline-none focus:border-crimson-500"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-crimson-500/40 bg-crimson-950/40 p-3 text-xs text-crimson-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-crimson-scale py-3 text-sm font-bold text-white shadow-crimson transition hover:brightness-110 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Ingresar al Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
