"use client";

import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { apiGetAllRequests, apiUpdateRequestStatus } from "@/lib/api";

interface RequestData {
  id: number;
  student_name: string;
  requested_by: string; 
  building_name: string;
  room_number: string;
  room_type: string;
  status: 'Pending' | 'Approved' | 'Denied';
}

// This line MUST be "export const ManagerDashboard"
export const ManagerDashboard = () => {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAllRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiGetAllRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const handleUpdateRequest = async (id: number, newStatus: 'Approved' | 'Denied') => {
    try {
      await apiUpdateRequestStatus(id, newStatus);
      toast({
        title: "Success!",
        description: `Request #${id} has been ${newStatus}.`,
      });
      fetchAllRequests(); 
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err.message,
      });
    }
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
    return <div>Loading all requests...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Manager Dashboard</h1>
        <p className="text-muted-foreground">Approve or deny pending access requests.</p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Building</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No requests found.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.student_name}</TableCell>
                  <TableCell>{request.requested_by}</TableCell>
                  <TableCell>{request.building_name}</TableCell>
                  <TableCell>{request.room_number}</TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(request.status) as any}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {request.status === 'Pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateRequest(request.id, 'Approved')}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleUpdateRequest(request.id, 'Denied')}
                        >
                          Deny
                        </Button>
                      </>
                    )}
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