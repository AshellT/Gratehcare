import React from "react";

type Props = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

const Card: React.FC<Props> = ({
  title,
  description,
  action,
  icon,
  className = "",
  children,
}) => {
  const hasHeader = title || description || icon || action;
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {hasHeader && (
        <header className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {icon && (
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                {icon}
              </span>
            )}
            <div>
              {title && (
                <h3 className="font-display text-base font-bold text-slate-900">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-slate-500 mt-0.5">{description}</p>
              )}
            </div>
          </div>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
};

export default Card;
