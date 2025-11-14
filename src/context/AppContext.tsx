"use client";

import React, { createContext, useReducer, ReactNode, useCallback } from "react";
import type { User, Request, RequestStatus } from "@/lib/types";
import { mockUsers, mockRequests } from "@/lib/mock-data";

// STATE
interface AppState {
  user: User | null;
  users: User[];
  requests: Request[];
}

const initialState: AppState = {
  user: null,
  users: mockUsers,
  requests: mockRequests,
};

// ACTIONS
type AppAction =
  | { type: "LOGIN"; payload: { userId: number } }
  | { type: "LOGOUT" }
  | { type: "ADD_REQUEST"; payload: Omit<Request, "id" | "status" | "requestedAt"> }
  | { type: "UPDATE_REQUEST_STATUS"; payload: { requestId: number; status: RequestStatus; userId: number } };

// REDUCER
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "LOGIN":
      const userToLogin = state.users.find(u => u.id === action.payload.userId) || null;
      return { ...state, user: userToLogin };
    case "LOGOUT":
      return { ...state, user: null };
    case "ADD_REQUEST":
        const newRequest: Request = {
            ...action.payload,
            id: state.requests.length + 1,
            status: "Pending",
            requestedAt: new Date().toISOString(),
        };
        return { ...state, requests: [newRequest, ...state.requests] };
    case "UPDATE_REQUEST_STATUS":
        return {
            ...state,
            requests: state.requests.map(req =>
                req.id === action.payload.requestId
                    ? { ...req, status: action.payload.status, actionTakenBy: action.payload.userId, actionTakenAt: new Date().toISOString() }
                    : req
            ),
        };
    default:
      return state;
  }
};

// CONTEXT
interface AppContextType extends AppState {
  login: (userId: number) => void;
  logout: () => void;
  addRequest: (requestData: Omit<Request, "id" | "status" | "requestedAt">) => { success: boolean, message: string };
  updateRequestStatus: (requestId: number, status: RequestStatus) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

// PROVIDER
export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const login = useCallback((userId: number) => {
    dispatch({ type: "LOGIN", payload: { userId } });
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: "LOGOUT" });
  }, []);

  const addRequest = useCallback((requestData: Omit<Request, "id" | "status" | "requestedAt">) => {
    const requester = state.users.find(u => u.id === requestData.requestedBy);
    if (!requester?.canRequest) {
        return { success: false, message: "Access Denied: Your role does not have permission to create requests." };
    }
    dispatch({ type: 'ADD_REQUEST', payload: requestData });
    return { success: true, message: "Request submitted successfully!" };
  }, [state.users]);

  const updateRequestStatus = useCallback((requestId: number, status: RequestStatus) => {
    if (state.user) {
        dispatch({ type: "UPDATE_REQUEST_STATUS", payload: { requestId, status, userId: state.user.id } });
    }
  }, [state.user]);

  const value = {
    ...state,
    login,
    logout,
    addRequest,
    updateRequestStatus,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
