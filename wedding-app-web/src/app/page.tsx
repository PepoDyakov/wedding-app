"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#FEFCFA]">
      <nav className="flex justify-between items-center px-6 sm:px-8 py-5 bg-white">
        <div className="text-[17px] tracking-[3px] uppercase text-[#2D2D2D]">
          TheWeddingApp
        </div>
        <div className="hidden sm:flex items-center gap-7">
          <a
            href="#features"
            className="text-sm text-[#999] tracking-wide hover:text-[#B89B7A] transition-colors duration-300"
          >
            Features
          </a>
          <a
            href="#how"
            className="text-sm text-[#999] tracking-wide hover:text-[#B89B7A] transition-colors duration-300"
          >
            How it works
          </a>
          {isAuthenticated ? (
            <button
              onClick={() => router.push("/dashboard")}
              className="text-[13px] px-5 py-2 border border-[#2D2D2D] text-[#2D2D2D] uppercase tracking-[1.5px] hover:bg-[#2D2D2D] hover:text-[#FEFCFA] transition-all duration-300"
            >
              Dashboard
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/auth")}
                className="text-sm text-[#B89B7A] tracking-wide hover:text-[#2D2D2D] transition-colors duration-300"
              >
                Sign in
              </button>
              <button
                onClick={() => router.push("/auth")}
                className="text-[13px] px-5 py-2 border border-[#2D2D2D] text-[#2D2D2D] uppercase tracking-[1.5px] hover:bg-[#2D2D2D] hover:text-[#FEFCFA] transition-all duration-300"
              >
                Get started
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => router.push("/auth")}
          className="sm:hidden text-[13px] px-5 py-2 border border-[#2D2D2D] text-[#2D2D2D] uppercase tracking-[1.5px]"
        >
          Get started
        </button>
      </nav>

      <section className="py-24 text-center bg-[#FEFCFA] sm:px-12">
        <p className="text-xs text-[#B89B7A] uppercase tracking-[3px] mb-6 animate-fade-up">
          Wedding planning, reimagined
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-[#2D2D2D] leading-tight mb-5 animate-fade-up-delay-1">
          Where every detail
          <br />
          falls into place
        </h1>
        <p className="text-base text-[#A09890] max-w-sm mx-auto leading-relaxed mb-10 animate-fade-up-delay-2">
          Elegant invitations, effortless RSVPs, and thoughtful guest management
          — designed for couples who value simplicity.
        </p>
        <div className="flex justify-center gap-3 animate-fade-up-delay-3">
          <button
            onClick={() => router.push("/auth")}
            className="px-9 py-3 bg-[#2D2D2D] text-[#FEFCFA] text-[13px] uppercase tracking-[2px] hover:bg-[#B89B7A] transition-colors duration-300"
          >
            Begin your story
          </button>
          <button
            onClick={() => {
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-9 py-3 border border-[#D0C8BE] text-[#2D2D2D] text-[13px] uppercase tracking-[2px] hover:bg-[#2D2D2D] hover:text-[#FEFCFA] hover:border-[#2D2D2D] transition-all duration-300"
          >
            Learn more
          </button>
        </div>
      </section>

      <section
        id="features"
        className="flex flex-col sm:flex-row border-t border-[#F0EBE4] bg-white"
      >
        {[
          {
            num: "01",
            title: "Invitations",
            desc: "Beautifully crafted emails with personal QR codes",
          },
          {
            num: "02",
            title: "Guest tracking",
            desc: "Real-time RSVPs and attendance at a glance",
          },
          {
            num: "03",
            title: "Preferences",
            desc: "Dietary needs, music requests, and special notes",
          },
        ].map((feature, i) => (
          <div
            key={feature.num}
            className={`flex-1 py-10 px-6 text-center hover:bg-[#FEFCFA] transition-colors duration-300 cursor-default ${
              i < 2 ? "border-b sm:border-b-0 sm:border-r border-[#F0EBE4]" : ""
            }`}
          >
            <p className="text-sm text-[#C8B8A4] tracking-wider mb-3">
              {feature.num}
            </p>
            <h3 className="font-serif text-lg text-[#2D2D2D] mb-1">
              {feature.title}
            </h3>
            <p className="text-sm text-[#A09890] leading-relaxed">
              {feature.desc}
            </p>
          </div>
        ))}
      </section>

      <section id="how" className="py-20 bg-[#FEFCFA]">
        <div className="max-w-3xl mx-auto px-8">
          <div className="text-center mb-14">
            <p className="text-xs text-[#B89B7A] uppercase tracking-[3px] mb-3">
              How it works
            </p>
            <h2 className="font-serif text-3xl text-[#2D2D2D]">
              Four simple steps
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                num: "01",
                title: "Create",
                desc: "Set up your wedding with date, venue, and a personal touch",
              },
              {
                num: "02",
                title: "Invite",
                desc: "Add guests and send elegant invitations with one click",
              },
              {
                num: "03",
                title: "Collect",
                desc: "Guests RSVP and share preferences through a simple page",
              },
              {
                num: "04",
                title: "Celebrate",
                desc: "Focus on your day knowing every detail is handled",
              },
            ].map((step) => (
              <div key={step.num} className="text-center cursor-default">
                <p className="text-sm text-[#C8B8A4] tracking-wider mb-2">
                  {step.num}
                </p>
                <h3 className="font-serif text-lg text-[#2D2D2D] mb-1 hover:-translate-y-0.5 transition-transform duration-300">
                  {step.title}
                </h3>
                <p className="text-sm text-[#A09890] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#2D2D2D] text-center">
        <p className="text-xs text-[#A09890] uppercase tracking-[3px] mb-4">
          Ready to begin?
        </p>
        <h2 className="font-serif text-3xl text-[#FEFCFA] mb-8">
          Your story starts here
        </h2>
        <button
          onClick={() => router.push("/auth")}
          className="px-9 py-3 border border-[#F0EBE4] text-[#FEFCFA] text-[13px] uppercase tracking-[2px] hover:bg-[#F0EBE4] hover:text-[#2D2D2D] transition-all duration-300"
        >
          Get started free
        </button>
      </section>

      <footer className="py-6 bg-[#FEFCFA] border-t border-[#F0EBE4]">
        <p className="text-center text-sm text-[#C8B8A4] tracking-wider">
          &copy; {new Date().getFullYear()} TheWeddingApp
        </p>
      </footer>
    </div>
  );
}
