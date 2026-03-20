"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Wedding App</h1>
          {isAuthenticated ? (
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              Go to Dashboard
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/auth")}
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm"
              >
                Log In
              </button>
              <button
                onClick={() => router.push("/auth")}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </header>

      <main>
        <section className="max-w-5xl mx-auto px-4 py-24 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Your Wedding, Beautifully Organized
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Create stunning invitations, manage your guest list, collect RSVPs
            and preferences — all in one place.
          </p>
          <button
            onClick={() => router.push("/auth")}
            className="px-8 py-3 bg-blue-600 text-white text-lg rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Your Wedding
          </button>
        </section>

        <section className="bg-white py-20">
          <div className="max-w-5xl mx-auto px-4">
            <h3 className="text-2xl font-bold text-center mb-12">
              Everything You Need
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  ✉
                </div>
                <h4 className="font-semibold text-lg mb-2">
                  Beautiful Invitations
                </h4>
                <p className="text-gray-500">
                  Send personalized email invitations with custom messages,
                  theme colors, and QR codes for easy access.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  ✓
                </div>
                <h4 className="font-semibold text-lg mb-2">RSVP Tracking</h4>
                <p className="text-gray-500">
                  Track who&apos;s attending at a glance. Guests can accept or
                  decline with a single click.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  ♫
                </div>
                <h4 className="font-semibold text-lg mb-2">
                  Guest Preferences
                </h4>
                <p className="text-gray-500">
                  Collect food, drink, and music preferences so every detail of
                  your celebration is perfect.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4">
            <h3 className="text-2xl font-bold text-center mb-12">
              How It Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                  1
                </div>
                <h4 className="font-semibold mb-1">Create</h4>
                <p className="text-sm text-gray-500">
                  Set up your wedding with date, venue, and a personal touch.
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                  2
                </div>
                <h4 className="font-semibold mb-1">Invite</h4>
                <p className="text-sm text-gray-500">
                  Add guests and send beautiful invitations with one click.
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                  3
                </div>
                <h4 className="font-semibold mb-1">Collect</h4>
                <p className="text-sm text-gray-500">
                  Guests RSVP and share their preferences through a simple page.
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                  4
                </div>
                <h4 className="font-semibold mb-1">Celebrate</h4>
                <p className="text-sm text-gray-500">
                  Focus on your big day knowing every detail is handled.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-blue-600 py-16">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Plan Your Perfect Day?
            </h3>
            <p className="text-blue-100 mb-8">
              Join couples who are making their wedding planning effortless.
            </p>
            <button
              onClick={() => router.push("/auth")}
              className="px-8 py-3 bg-white text-blue-600 text-lg rounded-md hover:bg-blue-50 transition-colors font-medium"
            >
              Get Started Free
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm">
          <p>© {new Date().getFullYear()} Wedding App. Made with love.</p>
        </div>
      </footer>
    </div>
  );
}
