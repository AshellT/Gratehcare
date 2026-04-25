import React from "react";
import { Construction, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/dashboard/PageHeader";
import Card from "@/components/dashboard/Card";

const PlaceholderPage: React.FC<{
  title: string;
  eyebrow?: string;
  description?: string;
}> = ({ title, eyebrow, description }) => {
  const navigate = useNavigate();
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={[
          {
            label: "Back to dashboard",
            variant: "secondary",
            icon: <ArrowLeft className="h-4 w-4" />,
            onClick: () => navigate("/app"),
          },
        ]}
      />
      <Card className="text-center py-16">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
          <Construction className="h-7 w-7" />
        </div>
        <h3 className="font-display text-xl font-bold text-slate-900">
          This module is on its way
        </h3>
        <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
          We're shaping <strong>{title}</strong> right now. The data, layouts and
          workflows for this section will appear here in a future release.
        </p>
      </Card>
    </div>
  );
};

export default PlaceholderPage;
