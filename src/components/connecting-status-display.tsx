import { StatusDisplay } from "@/components/status-display";
import type { FC } from "react";

export const ConnectingStatusDisplay: FC<{ error: string | null }> = ({ error }) => (
  <StatusDisplay className="animate-pulse">
    <svg className="mx-auto h-12 w-12 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <h2 className="text-xl font-semibold mt-4">Connecting to apiserver...</h2>
    {error && <p className="text-orange-400 mt-2 text-sm">{error.replace('API service not reachable.', 'Searching for API...')}</p>}
    <p className="mt-4 text-xs text-foreground/70">Please wait while the application attempts to locate the apiserver.</p>
  </StatusDisplay>
)
