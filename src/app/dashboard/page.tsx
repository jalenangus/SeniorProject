"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/hooks/useAppContext";
import FacultyDashboard from "@/components/dashboard/FacultyDashboard";
import ManagerDashboard from "@/components/dashboard/ManagerDashboard";
import { Header } from "@/components/Header";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.replace("/");
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-8">
            <div className="space-y-4">
                <Skeleton className="h-12 w-1/3" />
                <Skeleton className="h-8 w-1/4" />
                <div className="border rounded-lg p-4">
                    <Skeleton className="h-8 w-full mb-4" />
                    <Skeleton className="h-32 w-full" />
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
        {user.role === "Requester" && <FacultyDashboard />}
        {user.role === "Approver" && <ManagerDashboard />}
      </main>
    </div>
  );
}
