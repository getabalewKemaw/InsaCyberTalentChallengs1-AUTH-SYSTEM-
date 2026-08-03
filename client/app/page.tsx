"use client";
import Link from "next/link";
import { useSession } from "../lib/auth-client";
import { Button } from "../components/ui/Button";

export default function Home() {
  const { data: sessionData, isPending } = useSession();

  return (
    <div className="relative min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 overflow-hidden select-none">
      <main className="relative z-10 flex flex-col items-center gap-8 text-center max-w-4xl mx-auto">
        <div className="flex flex-col items-center">
          <h1 className="text-6xl sm:text-8xl md:text-9xl font-black text-color-text-main tracking-tighter leading-none">
            SYNCWRITE
          </h1>
          <p className="mt-4 text-xl text-color-text-muted font-medium max-w-lg">
            Real-time collaborative document editing for teams. Fast, secure, and beautiful.
          </p>
        </div>
        {isPending ? (
          <div className="py-4 text-xs font-semibold text-color-text-muted animate-pulse">
            Checking active session...
          </div>
        ) : sessionData?.session ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-semibold text-color-text-muted">
              Logged in as <strong className="text-color-text-main">{sessionData.user.email}</strong>
            </p>
            <Link href="/dashboard">
              <Button
                size="lg"
                className="px-10 py-4 text-base font-bold bg-color-primary text-white hover:bg-color-primary-hover shadow-md hover:scale-105 transition-transform"
              >
                Go to Dashboard →
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-sm mt-2">
            <Link href="/signin" className="w-full sm:w-1/2">
              <Button
                variant="outline"
                size="lg"
                className="w-full py-3.5 text-base font-bold border-2 border-brand-border text-color-text-main hover:bg-white hover:border-color-primary shadow-xs"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup" className="w-full sm:w-1/2">
              <Button
                size="lg"
                className="w-full py-3.5 text-base font-bold bg-color-primary text-white hover:bg-color-primary-hover shadow-md hover:scale-[1.02] transition-all"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
