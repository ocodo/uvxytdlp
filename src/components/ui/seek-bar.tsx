import * as React from "react"
import { cn } from "@/lib/utils"

interface SeekBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  indicatorClassName?: string
}

const SeekBar = React.forwardRef<HTMLInputElement, SeekBarProps>(
  ({ className, indicatorClassName = "", value = 0, max = 100, ...props }, ref) => {
    const percent = ((Number(value) / Number(max)) * 100).toFixed(2)

    return (
      <div
        className={cn(
          "relative w-full h-2 bg-primary/20 rounded-full",
          className
        )}
      >
        {/* Range input */}
        <input
          type="range"
          ref={ref}
          value={value}
          max={max}
          min={0}
          step="0.01"
          className={cn(
            "absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer z-10",
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-moz-range-thumb]:appearance-none"
          )}
          {...props}
        />

        {/* Visual indicator (filled bar) */}
        <div
          className={cn(
            "absolute top-0 left-0 h-2 bg-primary rounded-full transition-all",
            indicatorClassName
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    )
  }
)

SeekBar.displayName = "SeekBar"

export { SeekBar }
