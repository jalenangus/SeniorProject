"use client";

import { PlusCircle, Building, Clock, User, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/hooks/useAppContext";
import { Button } from "@/components/ui/button";
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

export default function FacultyDashboard() {
  const router = useRouter();
  const { user, requests } = useAppContext();

  if (!user) return null;

  const userRequests = requests.filter((req) => req.requestedBy === user.id);

  const getBuildingName = (id: number) => mockBuildings.find(b => b.id === id)?.name || 'N/A';
  const getRoomName = (id: number) => mockRooms.find(r => r.id === id)?.name || 'N/A';

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Welcome, {user.name}</h1>
          <p className="text-muted-foreground">Here are your submitted access requests.</p>
        </div>
        {user.canRequest && (
            <Button onClick={() => router.push("/request/new")} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Access Request
            </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request History</CardTitle>
          <CardDescription>A log of all access requests you have submitted.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date Requested</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userRequests.length > 0 ? (
                  userRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div className="font-medium">{req.studentName}</div>
                        <div className="text-sm text-muted-foreground">{req.studentId}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{getBuildingName(req.buildingId)}</div>
                        <div className="text-sm text-muted-foreground">{getRoomName(req.roomId)}</div>
                      </TableCell>
                      <TableCell>{new Date(req.requestedAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <StatusBadge status={req.status} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      You have not submitted any requests.
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
