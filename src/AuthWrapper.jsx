import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const EXPIRY_DURATION = 1 * 60 * 1000; 

export default function AuthWrapper({ children }) {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storage = localStorage.getItem("loginTime") ? localStorage : sessionStorage;

    const authStatus = storage.getItem("isAuthenticated") === "true";
    const loginTime = parseInt(storage.getItem("loginTime") || "0", 10);
    const now = Date.now();

    if (authStatus) {
      if (loginTime && now - loginTime > EXPIRY_DURATION) {
        localStorage.clear();
        sessionStorage.clear();
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    }

    setIsCheckingAuth(false);
  }, []);

  if (isCheckingAuth) return null;

  return isAuthenticated ? children : <Navigate to="/" replace />;
}
