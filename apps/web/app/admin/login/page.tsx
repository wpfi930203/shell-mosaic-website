"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@lansictiles.com");
  const [password, setPassword] = useState("LansicAdmin123!");
  const [message, setMessage] = useState("");

  async function submit() {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      setMessage("Login failed.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f0e8] px-4">
      <div className="w-full max-w-md rounded-[30px] border border-stone-200 bg-white p-8 shadow-lg">
        <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Admin Login</p>
        <h1 className="mt-2 text-4xl font-semibold text-stone-900">Lansic Admin</h1>
        <div className="mt-6 space-y-4">
          <input
            className="min-h-11 w-full rounded-2xl border border-stone-200 px-4 py-3"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            type="password"
            className="min-h-11 w-full rounded-2xl border border-stone-200 px-4 py-3"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            type="button"
            onClick={submit}
            className="min-h-11 w-full rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white"
          >
            Sign in
          </button>
          {message ? <p className="text-sm text-red-600">{message}</p> : null}
        </div>
      </div>
    </div>
  );
}
