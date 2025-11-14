"use client";

import { Check, X, Download, AlertTriangle, User, Building, Clock } from "lucide-react";
import { useAppContext } from "@/hooks/useAppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockBuildings, mockRooms } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { downloadAsCsv } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ManagerDashboard() {
  const { user, users, requests, updateRequestStatus } = useAppContext();
  const { toast } = useToast();

  if (!user || user.role !== "Approver") return null;

  const managedBuildingIds = user.managesBuildingIds || [];
  const pendingRequests = requests.filter(
    (req) => req.status === "Pending" && managedBuildingIds.includes(req.buildingId)
  );

  const handleAction = (requestId: number, newStatus: "Approved" | "Denied") => {
    updateRequestStatus(requestId, newStatus);
    toast({
      title: `Request ${newStatus}`,
      description: `The access request has been successfully ${newStatus.toLowerCase()}. A simulated notification has been sent.`,
      variant: newStatus === "Denied" ? "destructive" : "default",
    });
  };

  const handleDownloadReport = () => {
    const approvedRequests = requests.filter(req => req.status === 'Approved' && managedBuildingIds.includes(req.buildingId));
    if (approvedRequests.length === 0) {
        toast({
            title: "No Data",
            description: "There are no approved requests to export.",
            variant: "destructive"
        })
        return;
    }

    const reportData = approvedRequests.map(req => ({
        request_id: req.id,
        student_name: req.studentName,
        student_id: req.studentId,
        building: mockBuildings.find(b => b.id === req.buildingId)?.name,
        room: mockRooms.find(r => r.id === req.roomId)?.name,
        semester: req.semester,
        requester: users.find(u => u.id === req.requestedBy)?.name,
        request_date: new Date(req.requestedAt).toISOString(),
        approver: users.find(u => u.id === req.actionTakenBy)?.name,
        approval_date: req.actionTakenAt ? new Date(req.actionTakenAt).toISOString() : '',
    }));
    
    downloadAsCsv(reportData, `approved-access-report-${new Date().toISOString().split('T')[0]}`);
  };

  const getRequesterName = (id: number) => users.find(u => u.id === id)?.name || 'N/A';
  const getBuildingName = (id: number) => mockBuildings.find(b => b.id === id)?.name || 'N/A';
  const getRoomName = (id: number) => mockRooms.find(r => r.id === id)?.name || 'N/A';

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Manager Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user.name}. Review pending requests for your buildings.</p>
        </div>
        <Button onClick={handleDownloadReport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download Approved Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
          <CardDescription>
            The following requests are awaiting your approval or denial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Justification</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.length > 0 ? (
                  pendingRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div className="font-medium">{req.studentName}</div>
                        <div className="text-sm text-muted-foreground">{req.studentId}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{getBuildingName(req.buildingId)}</div>
                        <div className="text-sm text-muted-foreground">{getRoomName(req.roomId)}</div>
                      </TableCell>
                      <TableCell>{getRequesterName(req.requestedBy)}</TableCell>
                      <TableCell className="max-w-xs">
                          <p className="truncate text-sm">{req.justification}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <TooltipProvider>
                          <div className="flex gap-2 justify-end">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-green-600 hover:bg-green-100 hover:text-green-700"
                                  onClick={() => handleAction(req.id, "Approved")}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Approve</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-600 hover:bg-red-100 hover:text-red-700"
                                  onClick={() => handleAction(req.id, "Denied")}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Deny</TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Check className="h-8 w-8" />
                        <span>No pending requests. All clear!</span>
                      </div>
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
