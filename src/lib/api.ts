// This file is your "API Helper."
// It's part of the Presentation Layer (Frontend).
// Its only job is to make `fetch` calls to your Application Layer (Backend).

//
// Make sure this says "localhost:3001"
//
const API_URL = 'http://localhost:3001/api'; // The address of your backend server

// Helper function to handle fetch responses
async function handleResponse(response: Response) {
  // Try to parse the response as JSON
  const data = await response.json(); 
  
  if (!response.ok) {
    // If it's an error, throw the message from the server's JSON
    throw new Error(data.message || 'API request failed');
  }
  return data;
}

// === AUTH ENDPOINTS ===

/**
 * Corresponds to: [POST] /api/login
 * This is your "Authentication Service Subsystem"
 */
export async function apiLogin(email: string, password?: string) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
}

// === REQUEST ENDPOINTS ===

/**
 * Corresponds to: [GET] /api/requests
 * Used by: ManagerDashboard (Workflow/Approval Subsystem)
 */
export async function apiGetAllRequests() {
  const token = localStorage.getItem('aggie_token');
  const response = await fetch(`${API_URL}/requests`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
}

/**
 * Corresponds to: [GET] /api/requests/faculty/:facultyId
 * Used by: FacultyDashboard (Request Processing Subsystem)
 */
export async function apiGetMyRequests(facultyId: number) {
  const token = localStorage.getItem('aggie_token');
  const response = await fetch(`${API_URL}/requests/faculty/${facultyId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
}

/**
 * Corresponds to: [POST] /api/requests
 * Used by: RequestForm (Request Processing Subsystem)
 */
export async function apiSubmitRequest(requestData: {
  faculty_id: number;
  student_id: number;
  building_id: number;
  room_id: number;
  semester_id: number;
}) {
  const token = localStorage.getItem('aggie_token');
  const response = await fetch(`${API_URL}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(requestData),
  });
  return handleResponse(response);
}

/**
 * Corresponds to: [PUT] /api/requests/:requestId
 * Used by: ManagerDashboard (Workflow/Approval Subsystem)
 */
export async function apiUpdateRequestStatus(requestId: number, status: 'Approved' | 'Denied') {
  const token = localStorage.getItem('aggie_token');
  const response = await fetch(`${API_URL}/requests/${requestId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  return handleResponse(response);
}

// === DATA LOOKUP ENDPOINTS (for your forms) ===

/**
 * Corresponds to: [GET] /api/students
 */
export async function apiGetStudents() {
  const token = localStorage.getItem('aggie_token');
  const response = await fetch(`${API_URL}/students`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
}

/**
 * Corresponds to: [GET] /api/buildings
 */
export async function apiGetBuildings() {
  const token = localStorage.getItem('aggie_token');
  const response = await fetch(`${API_URL}/buildings`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
}

/**
 * Corresponds to: [GET] /api/rooms/:buildingId
 */
export async function apiGetRoomsByBuilding(buildingId: number) {
  const token = localStorage.getItem('aggie_token');
  const response = await fetch(`${API_URL}/rooms/${buildingId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
}

/**
 * Corresponds to: [GET] /api/semesters
 */
export async function apiGetSemesters() {
  const token = localStorage.getItem('aggie_token');
  const response = await fetch(`${API_URL}/semesters`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
}