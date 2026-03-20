"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : "";

  return (
    <header className="bg-white border-b border-[#F0EBE4]">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-[15px] tracking-[3px] uppercase text-[#2D2D2D] font-normal"
        >
          WeddingApp
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#A09890]">{user?.firstName}</span>
          <div className="w-8 h-8 rounded-full bg-[#F7F3EE] border border-[#E8E0D5] flex items-center justify-center text-[10px] text-[#B89B7A] font-medium tracking-wider">
            {initials}
          </div>
          <button
            onClick={handleLogout}
            className="text-[11px] text-[#B89B7A] tracking-wide"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
