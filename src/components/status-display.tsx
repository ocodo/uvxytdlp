import type { FC, ReactNode } from "react";

export const StatusDisplay: FC<{ children: ReactNode, className?: string }> = ({ children, className }) => (
  <div className="flex items-center justify-center min-h-screen bg-background text-foreground p-4">
    <div className={`bg-card rounded-lg p-8 shadow-lg text-center max-w-sm w-full ${className || ''}`}>
      {children}
    </div>
  </div>
);
