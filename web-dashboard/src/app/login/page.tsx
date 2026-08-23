"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { apiLogin } from "@/stores/useAuthStore";
import { useAuthStore } from "@/stores/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const { setSession } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter your email address and password.");
      return;
    }

    setLoading(true);
    try {
      const result = await apiLogin({ email, password });
      setSession(result.user, result.access_token);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
    >
      {/* Background gradient orbs */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(7,102,83,0.25) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(227,239,38,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Login Card */}
      <div
        className="relative z-10 w-full max-w-md mx-4 p-8 glass-panel rounded-2xl hover:border-border-highlight transition-all duration-300 gradient-border-top group hover:-translate-y-1 shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #E3EF26 0%, #076653 100%)",
              boxShadow: "0 0 24px rgba(227,239,38,0.3)",
            }}
          >
            <ShieldCheck className="w-8 h-8 text-[#061F1A]" />
          </div>
          <h1 className="text-3xl font-philosopher font-bold text-accent-lime mb-1">
            Ellipse
          </h1>
          <p className="text-sm font-inter text-muted-foreground tracking-widest uppercase">
            Authority Command Center
          </p>
        </div>

        <div className="mb-6">
          <p className="text-sm font-inter text-center" style={{ color: "#B0B0B0" }}>
            Sign in with your government credentials
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-inter font-semibold uppercase tracking-wider" style={{ color: "#B0B0B0" }}>
              Official Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@bbmc.gov.in"
              className="w-full rounded-xl px-4 py-3.5 text-sm font-inter text-white placeholder-[#B0B0B0] outline-none transition-all"
              style={{
                background: "#061F1A",
                border: "1.5px solid #076653",
                caretColor: "#E3EF26",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#E3EF26";
                e.target.style.boxShadow = "0 0 0 3px rgba(227,239,38,0.12)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#076653";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-inter font-semibold uppercase tracking-wider" style={{ color: "#B0B0B0" }}>
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl px-4 py-3.5 pr-12 text-sm font-inter text-white placeholder-[#B0B0B0] outline-none transition-all"
                style={{
                  background: "#061F1A",
                  border: "1.5px solid #076653",
                  caretColor: "#E3EF26",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#E3EF26";
                  e.target.style.boxShadow = "0 0 0 3px rgba(227,239,38,0.12)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#076653";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
                style={{ color: "#B0B0B0" }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-inter"
              style={{ background: "rgba(255,77,77,0.12)", border: "1px solid rgba(255,77,77,0.3)", color: "#FF4D4D" }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-inter font-bold text-sm transition-all flex items-center justify-center gap-2 mt-2"
            style={{
              background: loading ? "rgba(227,239,38,0.5)" : "#E3EF26",
              color: "#061F1A",
              boxShadow: loading ? "none" : "0 4px 20px rgba(227,239,38,0.25)",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing In…
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer note */}
        <p className="mt-6 text-xs font-inter text-center" style={{ color: "#B0B0B0" }}>
          Access is restricted to authorised government personnel only.
          <br />
          Contact your system administrator for credentials.
        </p>

        {/* Dev-only hint (remove in production) */}
        {process.env.NODE_ENV === "development" && (
          <div
            className="mt-4 p-3 rounded-lg text-xs font-jetbrains-mono space-y-1"
            style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", color: "#B0B0B0" }}
          >
            <div className="font-bold text-[#E3EF26] mb-1">DEV CREDENTIALS</div>
            <div>dispatcher@bbmc.gov.in / dispatch123</div>
            <div>officer@bbmc.gov.in / officer123</div>
            <div>admin@bbmc.gov.in / admin123</div>
          </div>
        )}
      </div>
    </div>
  );
}
