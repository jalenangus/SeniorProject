import type { User, Request, Building, Room, Student } from "./types";

export const mockUsers: User[] = [
  {
    id: 1,
    name: "Dr. Alice Smith",
    username: "asmith",
    password: "password",
    email: "asmith@ncat.edu",
    role: "Requester",
    canRequest: true,
  },
  {
    id: 2,
    name: "Dr. Bob Johnson",
    username: "bjohnson",
    password: "password",
    email: "bjohnson@ncat.edu",
    role: "Requester",
    canRequest: true,
  },
  {
    id: 3,
    name: "Mr. Charlie Brown",
    username: "cbrown",
    password: "password",
    email: "cbrown@ncat.edu",
    role: "Approver",
    canRequest: false,
    managesBuildingIds: [1, 4], // Manages McNair and Martin
  },
  {
    id: 4,
    name: "Ms. Diana Prince",
    username: "dprince",
    password: "password",
    email: "dprince@ncat.edu",
    role: "Approver",
    canRequest: false,
    managesBuildingIds: [2, 3], // Manages Graham and Monroe
  },
  {
    id: 5,
    name: "Prof. Eve Adams",
    username: "eadams",
    password: "password",
    email: "eadams@ncat.edu",
    role: "Requester",
    canRequest: false, // This user cannot make requests, for testing RBAC
  },
  {
    id: 6,
    name: "John Doe",
    username: "johndoe",
    password: "password",
    email: "jdoe@aggies.ncat.edu",
    role: "Student",
    studentId: "123456789",
    canRequest: false,
  },
  {
    id: 7,
    name: "Jane Roe",
    username: "janeroe",
    password: "password",
    email: "jroe@aggies.ncat.edu",
    role: "Student",
    studentId: "987654321",
    canRequest: false,
  },
  {
    id: 8,
    name: "Peter Pan",
    username: "ppan",
    password: "password",
    email: "ppan@aggies.ncat.edu",
    role: "Student",
    studentId: "112233445",
    canRequest: false,
  },
];

export const mockBuildings: Building[] = [
  { id: 1, name: "McNair" },
  { id: 2, name: "Graham" },
  { id: 3, name: "Monroe" },
  { id: 4, name: "Martin" },
];

export const mockRooms: Room[] = [
  { id: 101, name: "Room 101", buildingId: 1 },
  { id: 102, name: "Lab A", buildingId: 1 },
  { id: 201, name: "Room 201", buildingId: 2 },
  { id: 202, name: "Studio B", buildingId: 2 },
  { id: 301, name: "Room 301", buildingId: 3 },
  { id: 401, name: "Lab C", buildingId: 4 },
  { id: 404, name: "Server Room", buildingId: 4 },
];

export const mockStudents: Student[] = [
    { id: "123456789", name: "John Doe"},
    { id: "987654321", name: "Jane Roe"},
    { id: "112233445", name: "Peter Pan"},
]

export const mockRequests: Request[] = [
  {
    id: 1,
    studentId: "123456789",
    studentName: "John Doe",
    buildingId: 1,
    roomId: 101,
    semester: "Fall 2024",
    justification: "Needs access for senior design project research.",
    status: "Pending",
    requestedBy: 1,
    requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    studentId: "987654321",
    studentName: "Jane Roe",
    buildingId: 4,
    roomId: 401,
    semester: "Fall 2024",
    justification: "Assisting with faculty research on weekends.",
    status: "Pending",
    requestedBy: 2,
    requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    studentId: "112233445",
    studentName: "Peter Pan",
    buildingId: 2,
    roomId: 201,
    semester: "Spring 2024",
    justification: "Completed project work.",
    status: "Approved",
    requestedBy: 1,
    requestedAt: new Date("2024-04-15T10:00:00Z").toISOString(),
    actionTakenBy: 4,
    actionTakenAt: new Date("2024-04-15T14:30:00Z").toISOString(),
  },
   {
    id: 4,
    studentId: "123456789",
    studentName: "John Doe",
    buildingId: 3,
    roomId: 301,
    semester: "Spring 2024",
    justification: "Access no longer needed.",
    status: "Denied",
    requestedBy: 2,
    requestedAt: new Date("2024-05-01T09:00:00Z").toISOString(),
    actionTakenBy: 4,
    actionTakenAt: new Date("2024-05-01T11:00:00Z").toISOString(),
  },
];
