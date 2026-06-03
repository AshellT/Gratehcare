import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import AppSplash from "@/components/AppSplash";
import { useAuth } from "@/context/AuthContext";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <AppSplash
        message="Loading your dashboard"
        submessage="Verifying access…"
      />
    );
  }

  if (!user) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname }} />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
