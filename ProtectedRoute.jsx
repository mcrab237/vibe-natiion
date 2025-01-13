// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./src/context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // If user is not logged in, redirect to login
    return <Navigate to="/login" />;
  }

  // Otherwise, render the protected component
  return children;
};

export default ProtectedRoute;
