"use client";
import { useEffect, useState } from "react";
import { 
    apiGetAllRequests, 
    apiExportExcel, 
    apiExportPDF,
    apiGetAllUsers,       // New Import
    apiUpdateFacultyRole, // New Import
    apiDeleteUser         // New Import
} from "@/lib/api";

export const SiteManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');
  
  // Data State
  const [requests, setRequests] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Data
  const fetchData = async () => {
    setLoading(true);
    try {
        const [reqData, userData] = await Promise.all([
            apiGetAllRequests(),
            apiGetAllUsers()
        ]);
        setRequests(reqData);
        setUsers(userData);
    } catch (err) {
        console.error("Failed to fetch data", err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleRoleChange = async (id: number, newRole: string) => {
    try {
        await apiUpdateFacultyRole(id, newRole);
        alert("Role updated successfully!");
        fetchData(); // Refresh data
    } catch (e: any) {
        alert("Error updating role: " + e.message);
    }
  };

  const handleDeleteUser = async (id: number, type: 'Student' | 'Faculty', name: string) => {
    if (!confirm(`Are you sure you want to delete ${type} "${name}"? This cannot be undone.`)) return;
    
    try {
        await apiDeleteUser(id, type);
        alert("User deleted.");
        fetchData(); // Refresh data
    } catch (e: any) {
        alert("Error deleting user: " + e.message);
    }
  };

  // Stats
  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const approvedCount = requests.filter(r => r.status === 'Approved').length;

  if (loading) return <div>Loading Site Manager Data...</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-bold text-blue-900">Site Manager Overview</h1>
            <p className="text-gray-500 text-sm mt-1">Chair / Administrator View</p>
        </div>
        
        <div className="space-x-2">
            <button 
                onClick={apiExportExcel} 
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium transition"
            >
                <span>📊</span> Export Excel
            </button>
            <button 
                onClick={apiExportPDF} 
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-medium transition"
            >
                <span>📄</span> Export PDF
            </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 border-b mb-6">
        <button 
            className={`pb-2 px-4 font-medium ${activeTab === 'overview' ? 'border-b-2 border-blue-900 text-blue-900' : 'text-gray-500'}`}
            onClick={() => setActiveTab('overview')}
        >
            Requests Overview
        </button>
        <button 
            className={`pb-2 px-4 font-medium ${activeTab === 'users' ? 'border-b-2 border-blue-900 text-blue-900' : 'text-gray-500'}`}
            onClick={() => setActiveTab('users')}
        >
            Manage Users
        </button>
      </div>

      {/* === TAB 1: OVERVIEW === */}
      {activeTab === 'overview' && (
        <>
            <div className="flex gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm flex-1 text-center">
                    <div className="text-2xl font-bold text-blue-800">{requests.length}</div>
                    <div className="text-xs text-blue-600 uppercase font-semibold">Total Requests</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 shadow-sm flex-1 text-center">
                    <div className="text-2xl font-bold text-yellow-800">{pendingCount}</div>
                    <div className="text-xs text-yellow-600 uppercase font-semibold">Pending</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm flex-1 text-center">
                    <div className="text-2xl font-bold text-green-800">{approvedCount}</div>
                    <div className="text-xs text-green-600 uppercase font-semibold">Approved</div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                <table className="w-full text-left text-sm">
                <thead className="bg-gray-800 text-white">
                    <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Student</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Requested By</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.length === 0 ? (
                        <tr><td colSpan={6} className="p-8 text-center text-gray-500">No requests found.</td></tr>
                    ) : (
                        requests.map((r) => (
                        <tr key={r.id} className="border-b hover:bg-gray-50 transition">
                            <td className="p-3 font-mono text-gray-500">#{r.id}</td>
                            <td className="p-3">
                                <div className="font-bold text-gray-900">{r.student_name}</div>
                                <div className="text-xs text-gray-500">{r.student_email}</div>
                            </td>
                            <td className="p-3">{r.building_name} - {r.room_number}</td>
                            <td className="p-3">{r.requested_by}</td>
                            <td className="p-3">{new Date(r.created_at).toLocaleDateString()}</td>
                            <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    r.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                                    r.status === 'Denied' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {r.status}
                                </span>
                            </td>
                        </tr>
                        ))
                    )}
                </tbody>
                </table>
            </div>
        </>
      )}

      {/* === TAB 2: MANAGE USERS === */}
      {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={`${u.type}-${u.id}`} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-gray-500">{u.id}</td>
                    <td className="p-3 font-bold">{u.fname} {u.lname}</td>
                    <td className="p-3 text-gray-600">{u.email}</td>
                    <td className="p-3">
                        {u.type === 'Faculty' ? (
                            <select 
                                className="border rounded p-1 text-sm bg-gray-50"
                                value={u.role_name}
                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            >
                                <option value="Professor">Professor</option>
                                <option value="Building Manager">Building Manager</option>
                                <option value="Chair">Chair</option>
                                <option value="Administrator">Administrator</option>
                            </select>
                        ) : (
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">Student</span>
                        )}
                    </td>
                    <td className="p-3 text-right">
                        <button 
                            onClick={() => handleDeleteUser(u.id, u.type, `${u.fname} ${u.lname}`)}
                            className="text-red-600 hover:text-red-800 hover:underline font-medium"
                        >
                            Delete
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      )}
    </div>
  );
};