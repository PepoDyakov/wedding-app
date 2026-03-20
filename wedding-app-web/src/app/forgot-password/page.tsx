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
      <div className="min-h-screen flex items-center justify-center bg-[#FEFCFA]">
        <div className="w-full max-w-sm px-6">
          {submitted ? (
            <div className="text-center">
              <h1 className="font-serif text-2xl text-[#2D2D2D] mb-4">
                Check your email
              </h1>
              <p className="text-sm text-[#A09890] mb-8 leading-relaxed">
                If an account exists with that email, we&apos;ve sent a password
                reset link. It expires in 1 hour.
              </p>
              <button
                onClick={() => router.push("/auth")}
                className="text-sm text-[#B89B7A] hover:text-[#2D2D2D] transition-colors duration-300"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <h1 className="font-serif text-2xl text-[#2D2D2D] text-center mb-1">
                Forgot password
              </h1>
              <p className="text-sm text-[#A09890] text-center mb-8">
                Enter your email and we&apos;ll send you a reset link
              </p>

              {error && (
                <div className="bg-[#FDF0EF] text-[#A04040] px-4 py-3 text-sm mb-6 border border-[#F5D5D5]">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] text-[#A09890] uppercase tracking-[1px] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-2 bg-transparent border-b border-[#E0D5C8] text-sm text-[#2D2D2D] focus:outline-none focus:border-[#B89B7A] transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#2D2D2D] text-[#FEFCFA] text-[13px] uppercase tracking-[2px] hover:bg-[#B89B7A] disabled:bg-[#D0C8BE] transition-colors duration-300"
                >
                  {loading ? "Sending..." : "Send reset link"}
                </button>
              </form>

              <p className="text-center text-sm text-[#A09890] mt-6">
                <button
                  onClick={() => router.push("/auth")}
                  className="text-[#B89B7A] hover:text-[#2D2D2D] transition-colors duration-300"
                >
                  Back to sign in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </PublicRoute>
  );
}
