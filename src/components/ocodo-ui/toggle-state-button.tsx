import { cn } from "@/lib/utils";
import type { FC, MouseEventHandler, ReactNode } from "react";

interface ToggleStateButtonProps {
  state: boolean;
  onIcon: ReactNode;
  offIcon: ReactNode;
  toggleState: MouseEventHandler<HTMLDivElement>;
  className?: string;
}

export const ToggleStateButton: FC<ToggleStateButtonProps> = ({
  state,
  toggleState,
  onIcon,
  offIcon,
  className,
}) => (
  <div
    onClick={toggleState}
    className={cn(
      "m-2 p-2 hover:bg-foreground/10 w-10 h-10 rounded-full",
      className
    )}>
    {state ? offIcon : onIcon}
  </div>
)


