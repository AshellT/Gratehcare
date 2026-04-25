import React from "react";
import PageHeader from "@/components/dashboard/PageHeader";
import { ROLE_LABELS, ROLE_DESCRIPTIONS, type Role } from "@/lib/roles";
import { useAuth } from "@/context/AuthContext";

const greetingFor = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

const RoleGreeting: React.FC<{
  actions?: { label: string; onClick?: () => void; variant?: "primary" | "secondary"; icon?: React.ReactNode }[];
}> = ({ actions }) => {
  const { user } = useAuth();
  if (!user) return null;
  const role = user.role as Role;
  const firstName = user.name.split(" ")[0] || user.name;
  return (
    <PageHeader
      eyebrow={ROLE_LABELS[role]}
      title={`${greetingFor()}, ${firstName}.`}
      description={ROLE_DESCRIPTIONS[role]}
      actions={actions}
    />
  );
};

export default RoleGreeting;
