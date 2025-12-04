"use client";

import React, { createContext, useReducer, ReactNode, useCallback } from "react";
import { apiLogin } from "@/lib/api"; 

// --- TYPES ---
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  canRequest: boolean;
}

interface AppState {
  user: User | null;
}

const initialState: AppState = {
  user: null, 
};

// --- REDUCER ---
type AppAction =
  | { type: "LOGIN"; payload: { user: User } }
  | { type: "LOGOUT" };

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.payload.user };
    case "LOGOUT":
      // Clear all storage on logout
      if (typeof window !== 'undefined') {
        localStorage.removeItem('aggie_token');
        localStorage.removeItem('aggie_user');
      }
      return { ...state, user: null };
    default:
      return state;
  }
};

// --- CONTEXT ---
interface AppContextType extends AppState {
  login: (email: string, password?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

// --- PROVIDER ---
export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 1. REAL LOGIN FUNCTION
  const login = useCallback(async (email: string, password?: string) => {
    try {
      // Call the API (server.js)
      const data = await apiLogin(email, password);
      
      // CRITICAL STEP: Save token AND user to localStorage
      // This is required for dashboard/page.tsx to work on refresh
      localStorage.setItem('aggie_token', data.token);
      localStorage.setItem('aggie_user', JSON.stringify(data.user));

      // Update State
      dispatch({ 
        type: "LOGIN", 
        payload: { user: data.user } 
      });

      return { success: true, message: "Login successful!" };
    } catch (error: any) {
      console.error("Login failed:", error);
      return { success: false, message: error.message || "Login failed" };
    }
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: "LOGOUT" });
  }, []);

  const value = {
    ...state,
    login,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};