"use client";

import { useEffect, useState } from "react";
import { apiGetStudentRequests } from "@/lib/api";

export const StudentDashboard = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('aggie_user') || '{}');
    if (user.email) {
      setStudentName(user.name);
      apiGetStudentRequests(user.email).then(setRequests);
    }
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Welcome, {studentName}</h1>
      <p className="text-gray-600 mb-6">Here is the status of your room access requests.</p>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-600">Location</th>
              <th className="p-4 font-medium text-gray-600">Requested By</th>
              <th className="p-4 font-medium text-gray-600">Reason</th>
              <th className="p-4 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">No requests found for your email.</td></tr>
            ) : (
              requests.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-bold">{r.building_name}</div>
                    <div className="text-sm text-gray-500">Room {r.room_number}</div>
                  </td>
                  <td className="p-4">{r.requested_by}</td>
                  <td className="p-4 text-sm text-gray-600 max-w-xs truncate">{r.reason}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
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
    </div>
  );
};