import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { FC } from "react";

interface SwitchStateProps {
  label: string;
  state: boolean;
  setState: (newValue: boolean) => void;
}

export const SwitchState: FC<SwitchStateProps> = ({
  label,
  state,
  setState,
}) => (
  <>
    <div className={cn("text-sm font-light")}>{label}</div>
    <div>
      <Switch onClick={() => setState(!state)} checked={state} />
    </div>
  </>
);
