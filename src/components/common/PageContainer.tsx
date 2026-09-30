import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div
      className={`
        min-h-full
        space-y-7
        p-4
        sm:p-6
        ${className}
      `}
    >
      {children}
    </div>
  );
}
