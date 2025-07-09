import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function AuthWrapper({ children }) {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(authStatus);
    setIsCheckingAuth(false); 
  }, []);

  if (isCheckingAuth) {
    return null; 
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
}
