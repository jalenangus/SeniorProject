"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/hooks/useAppContext";
import Link from "next/link";

export function Header() {
  const { user, logout } = useAppContext();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  // Toggle dropdown
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            {/* Simple Building Icon SVG */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-7 w-7 text-blue-900" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
              <path d="M9 22v-4h6v4"></path>
              <path d="M8 6h.01"></path>
              <path d="M16 6h.01"></path>
              <path d="M8 10h.01"></path>
              <path d="M16 10h.01"></path>
              <path d="M8 14h.01"></path>
              <path d="M16 14h.01"></path>
            </svg>
            <h1 className="text-xl font-bold text-blue-900 font-headline">
              AggieRequest
            </h1>
          </div>

          {/* User Profile Section */}
          {user && (
            <div className="relative">
              <button 
                onClick={toggleMenu}
                className="relative h-10 w-10 rounded-full overflow-hidden border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {/* DiceBear Avatar */}
                <img 
                  src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`} 
                  alt={user.name} 
                  className="h-full w-full object-cover"
                />
              </button>

              {/* Dropdown Menu */}
              {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 border border-gray-100 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}