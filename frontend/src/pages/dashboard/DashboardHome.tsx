import React from "react";
import { useAuth } from "@/context/AuthContext";
import PlatformOwnerHome from "./role-homes/PlatformOwnerHome";
import SuperAdminHome from "./role-homes/SuperAdminHome";
import PlatformSupportHome from "./role-homes/PlatformSupportHome";
import OrgOwnerHome from "./role-homes/OrgOwnerHome";
import OperationsAdminHome from "./role-homes/OperationsAdminHome";
import CareCoordinatorHome from "./role-homes/CareCoordinatorHome";
import SupportWorkerHome from "./role-homes/SupportWorkerHome";
import BillingOfficerHome from "./role-homes/BillingOfficerHome";
import ComplianceOfficerHome from "./role-homes/ComplianceOfficerHome";
import FamilyHome from "./role-homes/FamilyHome";
import PractitionerHome from "./role-homes/PractitionerHome";

const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;
  switch (user.role) {
    case "platform_owner":
      return <PlatformOwnerHome />;
    case "super_admin":
      return <SuperAdminHome />;
    case "platform_support":
      return <PlatformSupportHome />;
    case "org_owner":
      return <OrgOwnerHome />;
    case "operations_admin":
      return <OperationsAdminHome />;
    case "care_coordinator":
      return <CareCoordinatorHome />;
    case "support_worker":
      return <SupportWorkerHome />;
    case "billing_officer":
      return <BillingOfficerHome />;
    case "compliance_officer":
      return <ComplianceOfficerHome />;
    case "family":
      return <FamilyHome />;
    case "practitioner":
      return <PractitionerHome />;
    default:
      return <OrgOwnerHome />;
  }
};

export default DashboardHome;
