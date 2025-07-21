import { thinIconStyle } from "@/lib/icon-style";
import { cn } from "@/lib/utils";
import { type LucideProps } from "lucide-react";
import type { FC } from "react";

interface IconProps extends LucideProps {
  Icon: React.ForwardRefExoticComponent<React.PropsWithoutRef<LucideProps> & React.RefAttributes<SVGSVGElement>>
  className?: string;
}

export const Icon: FC<IconProps> = ({
  Icon,
  className,
  ...props
}) => (
  <div
    className={cn(
      "p-2 rounded-full",
      className
    )}
  >
    <Icon {...props} className="w-4 h-4" style={thinIconStyle} />
  </div>
)
