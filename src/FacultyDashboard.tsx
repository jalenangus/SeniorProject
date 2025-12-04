// src/components/dashboard/FacultyDashboard.tsx
"use client";
import { useEffect, useState } from "react";
import { apiGetMyRequests } from "@/lib/api";
import Link from "next/link";

export const FacultyDashboard = () => {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('aggie_user') || '{}');
    if (u.id) apiGetMyRequests(u.id).then(setRequests);
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Faculty Dashboard</h1>
        <Link href="/dashboard/request/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + New Request
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-600">Building</th>
              <th className="p-4 font-medium text-gray-600">Room</th>
              <th className="p-4 font-medium text-gray-600">Student</th>
              <th className="p-4 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{r.building_name}</td>
                <td className="p-4">{r.room_number}</td>
                <td className="p-4">{r.student_name}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    r.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                    r.status === 'Denied' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">No requests found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};