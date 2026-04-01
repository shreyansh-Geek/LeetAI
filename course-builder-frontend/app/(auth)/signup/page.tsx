"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Sign up
      const signupRes = await fetch("http://localhost:8001/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!signupRes.ok) {
        const data = await signupRes.json();
        throw new Error(data.detail || "Signup failed");
      }

      // 2. Log in automatically
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const loginRes = await fetch("http://localhost:8001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      if (!loginRes.ok) throw new Error("Could not log in after signup");

      const { access_token } = await loginRes.json();
      setToken(access_token);

      // 3. Get profile
      const meRes = await fetch("http://localhost:8001/auth/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (meRes.ok) {
        const userData = await meRes.json();
        setUser(userData);
      }

      router.push("/chat");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-slate-200">
      <div className="w-full max-w-md bg-neutral-900/50 p-8 rounded-2xl border border-neutral-800/50 shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1 mb-6">
            <span className="text-[#24CFA6] font-bold text-2xl">Leet</span>
            <span className="text-white font-bold text-2xl">AI</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Create an Account</h1>
          <p className="text-slate-400">Join LeetAI and start learning faster</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#24CFA6] focus:ring-1 focus:ring-[#24CFA6] transition-all"
              placeholder="Your Name"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#24CFA6] focus:ring-1 focus:ring-[#24CFA6] transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#24CFA6] focus:ring-1 focus:ring-[#24CFA6] transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#24CFA6] text-black font-semibold py-2.5 rounded-lg hover:bg-[#20ba95] transition-all flex items-center justify-center disabled:opacity-70 mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-[#24CFA6] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
