/*
 * This is your Request Form component.
 * It's a Client Component.
 * It will be imported by your `app/request/new/page.tsx`.
 */
'use client'; // <-- CRITICAL

import { useState } from 'react';
import { API_URL } from '@/lib/api';

export function RequestForm() {
  const [message, setMessage] = useState('');
  
  // --- Form State ---
  // You should expand this to include all your form fields
  // For now, I'm using mock data, but you'd link these to inputs.
  const [studentId, setStudentId] = useState('1'); // Mock: '1'
  const [buildingId, setBuildingId] = useState('1'); // Mock: '1'
  const [roomId, setRoomId] = useState('1'); // Mock: '1'
  const [semesterId, setSemesterId] = useState('1'); // Mock: '1'
  // --- End Form State ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    // 1. Get logged-in user's ID from localStorage
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) {
        setMessage('Error: You are not logged in.');
        return;
    }
    const userData = JSON.parse(userDataString);
    const facultyId = userData.id;

    // 2. Gather all data from your form state
    const newRequest = {
      facultyId: facultyId,
      studentId: parseInt(studentId, 10),
      buildingId: parseInt(buildingId, 10),
      roomId: parseInt(roomId, 10),
      semesterId: parseInt(semesterId, 10)
    };

    try {
      // 3. Send data to your Application Layer's "Request Processing" subsystem
      const response = await fetch(`${API_URL}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest),
      });

      const data = await response.json();

      if (!response.ok) {
        // This will catch the error from your Stored Procedure!
        // e.g., "Access denied: Only administrators and researchers..."
        throw new Error(data.message || 'Submission failed.');
      }

      setMessage('Request submitted successfully!');
      // You can also reset the form here

    } catch (error: any) {
      console.error('Error submitting request:', error);
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Submit New Request</h3>
      {/* This is a minimal form. You should build this out with
        dropdowns for buildings, rooms, etc.
      */}
      <div>
        <label>Student ID (Mock):</label>
        <input value={studentId} onChange={e => setStudentId(e.target.value)} />
      </div>
      <div>
        <label>Building ID (Mock):</label>
        <input value={buildingId} onChange={e => setBuildingId(e.target.value)} />
      </div>
      <div>
        <label>Room ID (Mock):</label>
        <input value={roomId} onChange={e => setRoomId(e.target.value)} />
      </div>
      <div>
        <label>Semester ID (Mock):</label>
        <input value={semesterId} onChange={e => setSemesterId(e.target.value)} />
      </div>

      <button type="submit">Submit Request</button>
      {message && <p>{message}</p>}
    </form>
  );
}