"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Ensure these imports point to where you actually moved the files
import { FacultyDashboard } from "@/components/dashboard/FacultyDashboard";
import { ManagerDashboard } from "@/components/dashboard/ManagerDashboard";
// import { StudentDashboard } from "@/components/dashboard/StudentDashboard"; 

export default function DashboardPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    // 1. Read the user data from localStorage
    const userString = localStorage.getItem('aggie_user');
    
    if (!userString) {
      // 2. If no user in storage, redirect to login
      router.push("/"); 
    } else {
      // 3. Parse the user data and get the role
      const user = JSON.parse(userString);
      setUserRole(user.role);
    }
    setIsLoading(false);
  }, [router]);

  // Show loading state while checking authentication
  if (isLoading || !userRole) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* <Header /> */} 
      <main className="flex-1 p-6">
        
        {/* GROUP 1: Roles that see the FACULTY Dashboard */}
        {/* We explicitly check for all roles that should use this view */}
        {(userRole === 'Administrator' || userRole === 'Researcher' || userRole === 'Professor') && (
          <FacultyDashboard />
        )}
        
        {/* GROUP 2: Roles that see the MANAGER Dashboard */}
        {userRole === 'Building Manager' && (
          <ManagerDashboard />
        )}

        {/* GROUP 3: Roles that see the STUDENT Dashboard */}
        {/* {userRole === 'Student' && <StudentDashboard />} */}
        
      </main>
    </div>
  );
}