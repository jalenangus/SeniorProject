"use client";

import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useAppContext } from "@/hooks/useAppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { RequestStatus } from "@/lib/types";
import { mockBuildings, mockRooms } from "@/lib/mock-data";

const StatusBadge = ({ status }: { status: RequestStatus }) => {
  const variant: "default" | "secondary" | "destructive" | "outline" =
    status === "Approved" ? "default" : status === "Denied" ? "destructive" : "secondary";
  
  const Icon = status === "Approved" ? CheckCircle : status === "Denied" ? XCircle : AlertTriangle;

  const colorClass = 
    status === 'Approved' ? 'bg-green-100 text-green-800 border-green-200' :
    status === 'Denied' ? 'bg-red-100 text-red-800 border-red-200' :
    'bg-yellow-100 text-yellow-800 border-yellow-200';

  return (
    <Badge variant={variant} className={`flex items-center gap-1 w-fit ${colorClass}`}>
        <Icon className="h-3 w-3" />
        {status}
    </Badge>
  );
};

export default function StudentDashboard() {
  const { user, requests, users } = useAppContext();

  if (!user || user.role !== "Student" || !user.studentId) return null;

  const studentRequests = requests.filter((req) => req.studentId === user.studentId);

  const getBuildingName = (id: number) => mockBuildings.find(b => b.id === id)?.name || 'N/A';
  const getRoomName = (id: number) => mockRooms.find(r => r.id === id)?.name || 'N/A';
  const getRequesterName = (id: number) => users.find(u => u.id === id)?.name || 'N/A';

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Welcome, {user.name}</h1>
          <p className="text-muted-foreground">Here are the access requests submitted for you.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Access Requests</CardTitle>
          <CardDescription>A log of all access requests involving you.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Date Requested</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentRequests.length > 0 ? (
                  studentRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div className="font-medium">{getBuildingName(req.buildingId)}</div>
                        <div className="text-sm text-muted-foreground">{getRoomName(req.roomId)}</div>
                      </TableCell>
                      <TableCell>{getRequesterName(req.requestedBy)}</TableCell>
                      <TableCell>{new Date(req.requestedAt).toLocaleDateString()}</TableCell>
                      <TableCell>{req.semester}</TableCell>
                      <TableCell className="text-right">
                        <StatusBadge status={req.status} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No access requests have been submitted for you.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
