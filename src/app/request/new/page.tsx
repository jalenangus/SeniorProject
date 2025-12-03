"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/hooks/useAppContext";
import { Header } from "@/components/Header";
import { RequestForm } from "@/components/request/RequestForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewRequestPage() {
  const { user } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.replace("/");
    } else if (user && !user.canRequest) {
      // Redirect if user somehow gets here without request permissions
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (!user || !user.canRequest) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-8">
            <div className="space-y-4 max-w-2xl mx-auto">
                <Skeleton className="h-12 w-1/2" />
                <div className="border rounded-lg p-6 space-y-6">
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-1/3 ml-auto" />
                </div>
            </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <RequestForm />
      </main>
    </div>
  );
}
