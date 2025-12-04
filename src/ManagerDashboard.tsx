"use client";
import { useEffect, useState } from "react";
import { apiGetAllRequests, apiUpdateRequestStatus, apiExportExcel, apiExportPDF } from "@/lib/api";

export const ManagerDashboard = () => {
  const [requests, setRequests] = useState<any[]>([]);

  const loadData = () => apiGetAllRequests().then(setRequests);

  useEffect(() => { loadData(); }, []);

  const handleStatus = async (id: number, status: string) => {
    await apiUpdateRequestStatus(id, status);
    loadData(); // Refresh list
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manager Dashboard</h1>
        <div className="space-x-2">
            <button 
                onClick={apiExportExcel} 
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium transition"
            >
                Export Excel
            </button>
            <button 
                onClick={apiExportPDF} 
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-medium transition"
            >
                Export PDF
            </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-600">Student</th>
              <th className="p-4 font-medium text-gray-600">Location</th>
              <th className="p-4 font-medium text-gray-600">Reason</th>
              <th className="p-4 font-medium text-gray-600">Status</th>
              <th className="p-4 font-medium text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-gray-500">No requests found.</td></tr>
            ) : (
                requests.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                        <div className="font-semibold">{r.student_name}</div>
                        <div className="text-xs text-gray-500">{r.student_email}</div>
                    </td>
                    <td className="p-4">
                        <div>{r.building_name}</div>
                        <div className="text-sm text-gray-500">Room {r.room_number}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 max-w-xs truncate">{r.reason}</td>
                    <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            r.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                            r.status === 'Denied' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            {r.status}
                        </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                    {r.status === 'Pending' && (
                        <>
                        <button onClick={() => handleStatus(r.id, 'Approved')} className="text-green-600 hover:text-green-800 font-medium text-sm">Approve</button>
                        <button onClick={() => handleStatus(r.id, 'Denied')} className="text-red-600 hover:text-red-800 font-medium text-sm">Deny</button>
                        </>
                    )}
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};