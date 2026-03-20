"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { REQUEST_PASSWORD_RESET } from "@/graphql/passwordReset";
import { RequestPasswordResetResponse } from "@/graphql/types";
import PublicRoute from "@/components/PublicRoute";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [requestReset, { loading }] = useMutation<RequestPasswordResetResponse>(
    REQUEST_PASSWORD_RESET,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await requestReset({ variables: { email } });
      setSubmitted(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <PublicRoute>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          {submitted ? (
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Check Your Email</h1>
              <p className="text-gray-600 mb-6">
                If an account exists with that email, we&apos;ve sent a password
                reset link. It expires in 1 hour.
              </p>
              <button
                onClick={() => router.push("/auth")}
                className="text-blue-600 hover:underline"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-center mb-2">
                Forgot Password
              </h1>
              <p className="text-gray-500 text-center text-sm mb-6">
                Enter your email and we&apos;ll send you a reset link.
              </p>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-600 mt-4">
                <button
                  onClick={() => router.push("/auth")}
                  className="text-blue-600 hover:underline"
                >
                  Back to Login
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </PublicRoute>
  );
}
