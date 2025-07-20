import { OcodoLoaderIcon } from "@/components/ocodo-ui/ocodo-loader-icon";
import { StatusDisplay } from "@/components/ocodo-ui/status-display";
import { UvxYtdlpIcon } from "@/components/branding/uvxytdlp-icon";
import type { FC } from "react";

interface ConnectingStatusProps {
  error?: string | undefined;
  ready?: boolean;
  onDone?: () => void;
}

export const ConnectingStatusView: FC<ConnectingStatusProps> = ({ error, onDone, ready }) => {
  return (
    <StatusDisplay>
      <div className=" flex flex-col justify-center items-center gap-6">
        <h2 className="text-3xl tracking-tighter font-semibold mt-4">uvxytdlp</h2>
        <UvxYtdlpIcon onDone={onDone} doneDelay={400} size={240} strokeWidth={6} />

        <div className={`${ready ? "opacity-0" : ""} transition-all duration-1000`}><OcodoLoaderIcon className={`${ready ? "w-[0px] h-[0px]" : "w-[50px] h-[50px]"} animate-spin transition-all duration-1000`}/></div>

        {error
          ? <p className="text-orange-400 mt-2 text-sm">{error.replace('API service not reachable.', 'Searching for API...')}</p>
          : <p className="mt-4 text-sm text-foreground/70">{ready ? 'connected' : 'connecting to server...'}</p>
        }
      </div>
    </StatusDisplay>
  )
}
