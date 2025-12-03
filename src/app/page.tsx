"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/hooks/useAppContext"; // Make sure this path matches your file
import { Button } from "@/components/ui/button"; // If this errors, change to standard <button>
import { Input } from "@/components/ui/input";   // If this errors, change to standard <input>
import { Label } from "@/components/ui/label";   // If this errors, delete this line and use standard <label>

export default function LoginPage() {
  const { login } = useAppContext();
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Call the login function from AppContext (which talks to your server.js)
    const result = await login(email, password);

    if (result.success) {
      // If success, go to the dashboard
      // Note: You might need to create the /dashboard/faculty page if it doesn't exist yet
      router.push("/dashboard"); 
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-blue-900">Aggie One Access</h1>
          <p className="text-gray-500">Enter your credentials to access the system</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input 
              id="email" 
              type="email" 
              placeholder="hmartin@ncat.edu"
              className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input 
              id="password" 
              type="password" 
              placeholder="••••••••"
              className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        
        <div className="text-center text-xs text-gray-400">
          <p>For testing use: hmartin@ncat.edu</p>
        </div>
      </div>
    </div>
  );
}