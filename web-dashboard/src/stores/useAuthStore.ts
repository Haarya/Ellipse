import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "DISPATCHER" | "OFFICER" | "ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  ward?: string;
}

// ---------------------------------------------------------------------------
// Cookie helpers — the Next.js Edge middleware can't read localStorage,
// so we mirror the token into a cookie on every login/logout.
// ---------------------------------------------------------------------------
function setCookie(name: string, value: string, days = 30) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function clearCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setSession: (user: AuthUser, token: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setSession: (user, token) => {
        setCookie("ellipse-auth-token", token);
        set({ user, token, isAuthenticated: true });
      },
      clearSession: () => {
        clearCookie("ellipse-auth-token");
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "ellipse-auth", // localStorage key
    }
  )
);

// ---------------------------------------------------------------------------
// Mock login function
// Structured IDENTICALLY to what the real NestJS endpoint will return:
//   POST /api/v1/auth/login → { access_token: string, user: AuthUser }
// When the backend is ready, replace this function body with:
//   const res = await fetch(`${API_BASE}/auth/login`, { method: "POST", body: ... })
//   return res.json()
// ---------------------------------------------------------------------------
const MOCK_USERS: { email: string; user: AuthUser; token: string }[] = [
  {
    email: "dispatcher@bbmc.gov.in",
    token: "mock.jwt.dispatcher",
    user: {
      id: "user-001",
      name: "Rajesh Patil",
      email: "dispatcher@bbmc.gov.in",
      role: "DISPATCHER",
      ward: "Ward 42 — Andheri West",
    },
  },
  {
    email: "officer@bbmc.gov.in",
    token: "mock.jwt.officer",
    user: {
      id: "user-002",
      name: "Priya Sharma",
      email: "officer@bbmc.gov.in",
      role: "OFFICER",
      ward: "Ward 31 — Bandra East",
    },
  },
  {
    email: "admin@bbmc.gov.in",
    token: "mock.jwt.admin",
    user: {
      id: "user-003",
      name: "Suresh Mehta",
      email: "admin@bbmc.gov.in",
      role: "ADMIN",
      ward: "Central Operations",
    },
  },
];

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResult {
  access_token: string;
  user: AuthUser;
}

export async function apiLogin(payload: LoginPayload): Promise<LoginResult> {
  // ------------------------------------------------------------------
  // TODO: Replace with real API call when backend is ready:
  // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(payload),
  // });
  // if (!res.ok) throw new Error("Invalid credentials");
  // return res.json();
  // ------------------------------------------------------------------

  // Simulate network latency
  await new Promise((r) => setTimeout(r, 800));

  const match = MOCK_USERS.find(
    (u) => u.email === payload.email
  );

  if (!match) {
    throw new Error("Invalid email or password.");
  }

  return {
    access_token: match.token,
    user: match.user,
  };
}
