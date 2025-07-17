import { StatusDisplay } from "@/components/ocodo-ui/status-display";
import type { FC } from "react";

interface BackendConnectionFailedProps {
  error: string | null
  initializeApiBase: () => Promise<void>
}

export const BackendConnectionFailed:FC<BackendConnectionFailedProps> = ({error, initializeApiBase}) => (
  <StatusDisplay>
    <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <h2 className="text-xl font-semibold mt-4 text-red-500">Backend Connection Failed</h2>
    <p className="text-foreground/90 mt-2">{error}</p>
    <p className="text-foreground/70 mt-2 text-sm">
      This can happen if the backend service isn't running or is on a non-standard port. For setup instructions, see the{' '}
      <a
        href="https://github.com/ocodo/uvxytdlp"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 underline"
      >
        project docs.
      </a>.
    </p>
    <button
      onClick={initializeApiBase}
      className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-colors duration-200"
    >
      Try Again
    </button>
  </StatusDisplay>
)
