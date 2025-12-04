"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiGetBuildings, apiGetRoomsByBuilding, apiGetSemesters, apiSubmitRequest } from '@/lib/api';

export function RequestForm() {
  const router = useRouter();
  const [buildings, setBuildings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    student_name: '',
    student_email: '', // NEW Field
    building_id: '', 
    room_id: '', 
    semester_id: '',
    reason: ''
  });

  useEffect(() => {
    apiGetBuildings().then(setBuildings);
    apiGetSemesters().then(setSemesters);
  }, []);

  useEffect(() => {
    if (formData.building_id) {
      apiGetRoomsByBuilding(Number(formData.building_id)).then(setRooms);
    }
  }, [formData.building_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('aggie_user') || '{}');
    
    await apiSubmitRequest({
      faculty_id: user.id,
      student_name: formData.student_name,
      student_email: formData.student_email,
      building_id: Number(formData.building_id),
      room_id: Number(formData.room_id),
      semester_id: Number(formData.semester_id),
      reason: formData.reason
    });

    alert("Request Submitted!");
    router.push('/dashboard');
  };

  const handleChange = (e: any) => setFormData({...formData, [e.target.name]: e.target.value});

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow max-w-lg mx-auto mt-10 space-y-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800">New Room Access Request</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Student Name</label>
        <input name="student_name" onChange={handleChange} className="w-full border p-2 rounded" placeholder="e.g. Student Name" required />
      </div>

      {/* NEW: Student Email Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Student Email (School Email)</label>
        <input name="student_email" type="email" onChange={handleChange} className="w-full border p-2 rounded" placeholder="e.g. studentname@aggies.ncat.edu" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-700">Building</label>
            <select name="building_id" onChange={handleChange} className="w-full border p-2 rounded" required>
            <option value="">Select Building</option>
            {buildings.map(b => <option key={b.id} value={b.id}>{b.building_name}</option>)}
            </select>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Room</label>
            <select name="room_id" onChange={handleChange} className="w-full border p-2 rounded" required disabled={!formData.building_id}>
            <option value="">Select Room</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.room_number}</option>)}
            </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Semester</label>
        <select name="semester_id" onChange={handleChange} className="w-full border p-2 rounded" required>
          <option value="">Select Semester</option>
          {semesters.map(s => <option key={s.id} value={s.id}>{s.semester_name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Reason for Request</label>
        <textarea name="reason" onChange={handleChange} className="w-full border p-2 rounded h-24" required></textarea>
      </div>

      <button type="submit" className="w-full bg-blue-900 text-white py-2 rounded hover:bg-blue-800 font-bold">
        Submit Request
      </button>
    </form>
  );
}