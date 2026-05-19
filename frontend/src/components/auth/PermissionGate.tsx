import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  hasPermission,
  resourceForPath,
  type PermissionAction,
  type Resource,
} from "@/lib/permissions";

const PermissionGate: React.FC<{
  action?: PermissionAction;
  resource?: Resource;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}> = ({ action = "view", resource, fallback = null, children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const resolvedResource = resource || resourceForPath(location.pathname);

  if (!hasPermission(user?.role, resolvedResource, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGate;
