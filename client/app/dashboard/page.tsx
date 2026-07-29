"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "../../lib/auth-client";
import { Button } from "../../components/ui/Button";
import Image from "next/image";
import Loader from "@/components/ui/loader";
export default function DashboardPage() {
  const router = useRouter();
  const { data: sessionData, isPending } = useSession();
  useEffect(() => {
    if (!isPending && !sessionData?.session) {
      router.push("/signin");
    }
  }, [sessionData, isPending, router]);
  if (isPending || !sessionData?.session) {
    return (
      <Loader />
    );
  }
  const user = sessionData.user;
  return (
    <div className="min-h-screen bg-[#FBF9F6] flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6 p-8 rounded-2xl bg-white border border-[#E8E2D9]">
        {user?.image ? (
          <Image
            src={user.image}
            alt={user.name || "User Avatar"}
            width={96}
            height={96}
            className="w-24 h-24 rounded-full border-2 border-[#BFB35A] object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-[#554236] text-[#BFB35A] font-bold flex items-center justify-center text-4xl">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
        )}
        <h1 className="text-3xl font-bold text-[#554236]">Welcome, {user?.name || "User"}!</h1>
        <Button
          onClick={async () => {
            await signOut();
            router.push("/");
          }}
          className="bg-[#554236] text-white hover:bg-[#403128] font-semibold px-8"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}
