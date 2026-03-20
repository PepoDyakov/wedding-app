"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useRouter, useParams } from "next/navigation";
import { RESET_PASSWORD } from "@/graphql/passwordReset";
import { ResetPasswordResponse } from "@/graphql/types";

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [resetPassword, { loading }] =
    useMutation<ResetPasswordResponse>(RESET_PASSWORD);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      await resetPassword({
        variables: { token, newPassword: password },
      });
      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FEFCFA]">
      <div className="w-full max-w-sm px-6">
        {success ? (
          <div className="text-center">
            <div className="w-8 h-px bg-[#D0C8BE] mx-auto mb-6" />
            <h1 className="font-serif text-2xl text-[#2D2D2D] mb-4">
              Password reset
            </h1>
            <p className="text-sm text-[#A09890] mb-8 leading-relaxed">
              Your password has been updated. You can now sign in with your new
              password.
            </p>
            <button
              onClick={() => router.push("/auth")}
              className="px-9 py-3 bg-[#2D2D2D] text-[#FEFCFA] text-[13px] uppercase tracking-[2px] hover:bg-[#B89B7A] transition-colors duration-300"
            >
              Go to sign in
            </button>
          </div>
        ) : (
          <>
            <h1 className="font-serif text-2xl text-[#2D2D2D] text-center mb-1">
              Reset password
            </h1>
            <p className="text-sm text-[#A09890] text-center mb-8">
              Enter your new password below
            </p>

            {error && (
              <div className="bg-[#FDF0EF] text-[#A04040] px-4 py-3 text-sm mb-6 border border-[#F5D5D5]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] text-[#A09890] uppercase tracking-[1px] mb-2">
                  New password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-2 bg-transparent border-b border-[#E0D5C8] text-sm text-[#2D2D2D] focus:outline-none focus:border-[#B89B7A] transition-colors"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#A09890] uppercase tracking-[1px] mb-2">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full py-2 bg-transparent border-b border-[#E0D5C8] text-sm text-[#2D2D2D] focus:outline-none focus:border-[#B89B7A] transition-colors"
                  required
                  minLength={8}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#2D2D2D] text-[#FEFCFA] text-[13px] uppercase tracking-[2px] hover:bg-[#B89B7A] disabled:bg-[#D0C8BE] transition-colors duration-300"
              >
                {loading ? "Resetting..." : "Reset password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
