export type UserRole = "Requester" | "Approver" | "Admin";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  canRequest: boolean;
  managesBuildingIds?: number[];
}

export interface Student {
  id: string;
  name: string;
}

export interface Building {
  id: number;
  name: string;
}

export interface Room {
  id: number;
  name: string;
  buildingId: number;
}

export type RequestStatus = "Pending" | "Approved" | "Denied";

export interface Request {
  id: number;
  studentId: string;
  studentName: string;
  buildingId: number;
  roomId: number;
  semester: string;
  justification: string;
  status: RequestStatus;
  requestedBy: number; // User ID
  requestedAt: string; // ISO date string
  actionTakenBy?: number; // User ID
  actionTakenAt?: string; // ISO date string
}
