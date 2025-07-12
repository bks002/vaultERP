import { useDispatch } from "react-redux";
import { clearUserData } from "./Redux/userSlice";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function AuthWrapper({ children }) {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const storage = localStorage.getItem("isAuthenticated") ? localStorage : sessionStorage;

    const authStatus = storage.getItem("isAuthenticated") === "true";

    if (authStatus) {
      setIsAuthenticated(true);
    } else {
      localStorage.clear();
      sessionStorage.clear();
      dispatch(clearUserData());
      setIsAuthenticated(false);
    }

    setIsCheckingAuth(false);
  }, []);

  if (isCheckingAuth) return null;

  return isAuthenticated ? children : <Navigate to="/" replace />;
}