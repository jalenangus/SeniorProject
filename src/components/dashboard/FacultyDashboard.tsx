"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";
import { apiGetMyRequests } from "@/lib/api";

interface RequestData {
  id: number;
  student_name: string;
  building_name: string;
  room_number: string;
  room_type: string;
  status: 'Pending' | 'Approved' | 'Denied';
}

// This line MUST be "export const FacultyDashboard"
export const FacultyDashboard = () => {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); 

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const userString = localStorage.getItem('aggie_user');
        if (!userString) {
          throw new Error("User not found in localStorage.");
        }
        const user = JSON.parse(userString);
        
        const data = await apiGetMyRequests(user.id);
        
        setRequests(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleNewRequest = () => {
    // This path is based on your file structure `src/app/dashboard/request/new`
    router.push("/dashboard/request/new"); 
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Pending':
        return 'outline';
      case 'Denied':
        return 'destructive';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return <div>Loading your requests...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Faculty Dashboard</h1>
          <p className="text-muted-foreground">Manage your room access requests.</p>
        </div>
        <Button onClick={handleNewRequest}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Building</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  You have not submitted any requests.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.student_name}</TableCell>
                  <TableCell>{request.building_name}</TableCell>
                  <TableCell>{request.room_number}</TableCell>
                  <TableCell>{request.room_type}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(request.status) as any}>
                      {request.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};