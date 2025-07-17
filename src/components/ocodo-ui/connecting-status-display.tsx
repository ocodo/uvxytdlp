import { OcodoLoaderIcon } from "@/components/ocodo-ui/ocodo-loader-icon";
import { StatusDisplay } from "@/components/ocodo-ui/status-display";
import { UvxYtdlpIcon } from "@/components/branding/uvxytdlp-icon";
import type { FC } from "react";

interface ConnectingStatusProps {
  error?: string | null;
  ready?: boolean;
  onDone?: () => void;
}

export const ConnectingStatusView: FC<ConnectingStatusProps> = ({ error, onDone, ready }) => {
  return (
    <StatusDisplay>
      <div className=" flex flex-col justify-center items-center gap-6">
        <h2 className="text-3xl tracking-tighter font-semibold mt-4">uvxytdlp</h2>
        {ready &&
          <UvxYtdlpIcon onDone={onDone} doneDelay={1000} size={240} strokeWidth={6} />
        }
        {!ready &&
          <div><OcodoLoaderIcon className="w-20 h-20 animate-spin" /></div>
        }
        {error
          ? <p className="text-orange-400 mt-2 text-sm">{error.replace('API service not reachable.', 'Searching for API...')}</p>
          : <p className="mt-4 text-xs text-foreground/70">connecting...</p>
        }
      </div>
    </StatusDisplay>
  )
}
