import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
    <div>
      <Label>{label}</Label>
    </div>
    <div>
      <Switch onClick={() => setState(!state)} checked={state} />
    </div>
  </>
);
