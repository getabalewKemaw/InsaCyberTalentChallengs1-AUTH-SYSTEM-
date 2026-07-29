"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "../../lib/auth-client";
import { SignInForm } from "../../components/auth/SignInForm";
import { Card, CardContent } from "../../components/ui/Card";
export default function SignInPage() {
  const router = useRouter();
  const { data: sessionData } = useSession();
  useEffect(() => {
    if (sessionData?.session) {
      router.push("/dashboard");
    }
  }, [sessionData, router]);
  return (
    <div className="min-h-screen bg-[#FBF9F6] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md flex flex-col gap-6">
        <Card className="shadow-md">
          <CardContent className="p-6">
            <SignInForm
              onSuccess={() => router.push("/dashboard")}
              onSwitchToSignUp={() => router.push("/signup")}
            />
          </CardContent>
        </Card>
        <div className="text-center">
          <Link href="/" className="text-xs font-semibold text-[#594F4F] hover:text-[#554236] transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
