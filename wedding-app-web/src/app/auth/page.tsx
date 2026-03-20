"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { LOGIN_USER, REGISTER_USER } from "@/graphql/auth";
import {
  LoginUserResponse,
  RegisterUserResponse,
  LoginUserInput,
  RegisterUserInput,
} from "@/graphql/types";
import PublicRoute from "@/components/PublicRoute";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();
  const { login } = useAuth();

  const [loginUser, { loading: loginLoading }] = useMutation<
    LoginUserResponse,
    { input: LoginUserInput }
  >(LOGIN_USER);
  const [registerUser, { loading: registerLoading }] = useMutation<
    RegisterUserResponse,
    { input: RegisterUserInput }
  >(REGISTER_USER);

  const loading = loginLoading || registerLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        const { data } = await loginUser({
          variables: { input: { email, password } },
        });

        if (!data) {
          setError("No response from server. Please try again.");
          return;
        }

        login(data.loginUser.token, data.loginUser.user);
      } else {
        const { data } = await registerUser({
          variables: { input: { firstName, lastName, email, password } },
        });

        if (!data) {
          setError("No response from server. Please try again.");
          return;
        }

        login(data.registerUser.token, data.registerUser.user);
      }
      router.push("/dashboard");
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
      <div className="min-h-screen flex bg-[#FEFCFA]">
        <div className="hidden md:flex flex-1 bg-[#F7F3EE] items-center justify-center">
          <div className="border border-[#E0D5C8] px-12 py-14 text-center max-w-[260px]">
            <p className="text-[10px] text-[#B89B7A] uppercase tracking-[3px] mb-5">
              TheWeddingApp
            </p>
            <p className="font-serif text-xl text-[#2D2D2D] leading-snug">
              A beautiful beginning deserves a beautiful plan
            </p>
            <div className="w-8 h-px bg-[#D0C8BE] mx-auto mt-5" />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-sm">
            <h1 className="font-serif text-2xl text-[#2D2D2D] mb-1">
              {isLogin ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-sm text-[#A09890] mb-8">
              {isLogin
                ? "Sign in to manage your weddings"
                : "Start planning your celebration"}
            </p>

            {error && (
              <div className="bg-[#FDF0EF] text-[#A04040] px-4 py-3 text-sm mb-6 border border-[#F5D5D5]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="flex gap-5">
                  <div className="flex-1">
                    <label className="block text-[10px] text-[#A09890] uppercase tracking-[1px] mb-2">
                      First name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full py-2 bg-transparent border-b border-[#E0D5C8] text-sm text-[#2D2D2D] focus:outline-none focus:border-[#B89B7A] transition-colors"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] text-[#A09890] uppercase tracking-[1px] mb-2">
                      Last name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full py-2 bg-transparent border-b border-[#E0D5C8] text-sm text-[#2D2D2D] focus:outline-none focus:border-[#B89B7A] transition-colors"
                      required
                    />
                  </div>
                </div>
              )}

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

              <div>
                <label className="block text-[10px] text-[#A09890] uppercase tracking-[1px] mb-2">
                  Password
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

              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => router.push("/forgot-password")}
                    className="text-xs text-[#B89B7A] hover:text-[#2D2D2D] transition-colors duration-300"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#2D2D2D] text-[#FEFCFA] text-[13px] uppercase tracking-[2px] hover:bg-[#B89B7A] disabled:bg-[#D0C8BE] transition-colors duration-300"
              >
                {loading
                  ? "Please wait..."
                  : isLogin
                    ? "Sign in"
                    : "Create account"}
              </button>
            </form>

            <p className="text-center text-sm text-[#A09890] mt-6">
              {isLogin
                ? "Don\u2019t have an account? "
                : "Already have an account? "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-[#B89B7A] hover:text-[#2D2D2D] transition-colors duration-300"
              >
                {isLogin ? "Create one" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
}
