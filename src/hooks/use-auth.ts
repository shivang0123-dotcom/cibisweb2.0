"use client";

import { useState } from "react";

/**
 * Email + password admin login backed by Supabase Auth. Posts to the given
 * endpoint (`/api/admin/login`), which signs in and sets the auth cookies.
 */
export function useAdminLogin(endpoint: string) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return false;
    }

    setLoading(true);
    setError("");
    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
      return false;
    }
    setLoading(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error || "Could not sign in.");
      return false;
    }

    setPassword("");
    return true;
  }

  return { email, setEmail, password, setPassword, error, loading, submit };
}
