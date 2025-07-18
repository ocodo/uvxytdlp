import { cn } from "@/lib/utils";
import type { FC } from "react";

interface SelectStateProps {
  label: string;
  state: string;
  choices: Record<string, string>;
  setState: (newValue: string) => void;
  className?: string;
  layout: 'row' | 'column'
}

export const SelectState: FC<SelectStateProps> = ({ ...props }) => {

  const asRow = (
    <>
      <div className={cn("flex flex-col items-start justify-between gap-2", props.className)}>
        <div className="text-sm font-light">{props.label}</div>
      </div>
      <div className="flex flex-row items-start justify-start gap-2">
        {Object.keys(props.choices).map((choice: string) => (
          <div
            className={cn(
              `p-1 px-3 text-xs rounded-2xl cursor-pointer`,
              `${props.state === choice
                ? 'bg-primary'
                : 'bg-background'}`)}
            onClick={() => props.setState(choice)}
          >
            {choice}
          </div>
        ))}
      </div>
    </>
  );

  const asCol = (
    <div className={cn("flex flex-col items-start justify-between gap-2", props.className)}>
      <div className="text-sm font-light">{props.label}</div>
      <div className="flex flex-row items-center justify-between gap-2">
        {Object.keys(props.choices).map((choice: string) => (
          <div
            className={cn(
              `p-1 px-3 text-xs rounded-2xl cursor-pointer`,
              `${props.state === choice
                ? 'bg-primary'
                : 'bg-background'}`)}
            onClick={() => props.setState(choice)}
          >
            {choice}
          </div>
        ))}
      </div>
    </div>
  );

  return { row: asRow, column: asCol }[props.layout]

};
