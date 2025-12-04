const API_URL = 'http://localhost:3001/api';

async function handleResponse(response: Response) {
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error');
  return data;
}

export async function apiLogin(email: string, password?: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

// === REQUESTS ===
export async function apiGetAllRequests() {
  const res = await fetch(`${API_URL}/requests`);
  return handleResponse(res);
}
export async function apiGetMyRequests(id: number) {
  const res = await fetch(`${API_URL}/requests/faculty/${id}`);
  return handleResponse(res);
}
export async function apiGetStudentRequests(email: string) {
  const res = await fetch(`${API_URL}/requests/student?email=${encodeURIComponent(email)}`);
  return handleResponse(res);
}
export async function apiSubmitRequest(data: any) {
  const res = await fetch(`${API_URL}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}
export async function apiUpdateRequestStatus(id: number, status: string) {
  const res = await fetch(`${API_URL}/requests/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handleResponse(res);
}

// === EXPORT FUNCTIONS ===
export async function apiExportExcel() {
    window.open(`${API_URL}/export/excel`, '_blank');
}

export async function apiExportPDF() {
    window.open(`${API_URL}/export/pdf`, '_blank');
}

// === LOOKUPS ===
export async function apiGetStudents() { return handleResponse(await fetch(`${API_URL}/students`)); }
export async function apiGetBuildings() { return handleResponse(await fetch(`${API_URL}/buildings`)); }
export async function apiGetRoomsByBuilding(id: number) { return handleResponse(await fetch(`${API_URL}/rooms/${id}`)); }
export async function apiGetSemesters() { return handleResponse(await fetch(`${API_URL}/semesters`)); }

// === USER MANAGEMENT (For Site Manager) ===

// Get All Users (Faculty & Students)
export async function apiGetAllUsers() {
    const res = await fetch(`${API_URL}/users`);
    return handleResponse(res);
}

// Update a Faculty Member's Role (e.g., Promote Professor to Manager)
export async function apiUpdateFacultyRole(id: number, roleName: string) {
    const res = await fetch(`${API_URL}/users/faculty/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role_name: roleName }),
    });
    return handleResponse(res);
}

// Delete a User (Student or Faculty)
export async function apiDeleteUser(id: number, type: 'Student' | 'Faculty') {
    const res = await fetch(`${API_URL}/users/${type.toLowerCase()}/${id}`, {
        method: 'DELETE',
    });
    return handleResponse(res);
}