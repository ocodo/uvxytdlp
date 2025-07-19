import { cn } from "@/lib/utils";
import type { FC } from "react";

interface SelectStateProps {
  label: string;
  state: string;
  choices: Record<string, string>;
  setState: (newValue: string) => void;
  className?: string;
  labelClasses?: string;
  choiceButtonClasses?: string;
  selectedChoiceClassName?: string;
  unSelectedChoiceClassName?: string;
  layout: 'row' | 'column';
}

export const SelectState: FC<SelectStateProps> = ({
  label,
  state,
  choices,
  setState,
  className,
  labelClasses = "text-sm font-light",
  choiceButtonClasses,
  selectedChoiceClassName = "bg-primary text-white",
  unSelectedChoiceClassName = "bg-background",
  layout
}) => {

  const renderChoices = () => (
    <div className="flex flex-row items-center justify-start gap-2">
      {Object.keys(choices).map((choice) => (
        <div
          key={choice}
          className={cn(
            "p-1 px-3 text-xs rounded-2xl cursor-pointer",
            state === choice ? selectedChoiceClassName : unSelectedChoiceClassName,
            choiceButtonClasses
          )}
          onClick={() => setState(choice)}
        >
          {choice}
        </div>
      ))}
    </div>
  );

  if (layout === 'row') {
    return (
      <>
        <div className={cn("flex flex-col items-start justify-between gap-2", className)}>
          <div className={labelClasses}>{label}</div>
        </div>
        {renderChoices()}
      </>
    );
  }

  return (
    <div className={cn("flex flex-col items-start justify-between gap-2", className)}>
      <div className={labelClasses}>{label}</div>
      {renderChoices()}
    </div>
  );
};
