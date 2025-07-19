import * as React from "react"
import { cn } from "@/lib/utils"

interface SeekBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  indicatorClassName?: string
  duration: number // total duration in seconds
  formatTime?: (time: number) => string // optional custom time formatter
}

const SeekBar = React.forwardRef<HTMLInputElement, SeekBarProps>(
  (
    {
      className,
      indicatorClassName = "",
      value = 0,
      duration, // default to max if not provided
      formatTime = (t) =>
        new Date(t * 1000).toISOString().substring(14, 19), // mm:ss
      ...props
    },
    ref
  ) => {
    const [hoverPercent, setHoverPercent] = React.useState<number | null>(null)
    const [isHovering, setIsHovering] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)

    const percent = ((Number(value) / Number(duration)) * 100).toFixed(2)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const offsetX = e.clientX - rect.left
      const newPercent = Math.max(0, Math.min(100, (offsetX / rect.width) * 100))
      setHoverPercent(newPercent)
    }

    const handleMouseLeave = () => {
      setHoverPercent(null)
      setIsHovering(false)
    }

    const handleMouseEnter = () => {
      setIsHovering(true)
    }

    const hoverTime =
      hoverPercent !== null ? (duration * hoverPercent) / 100 : null

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative w-full h-6", // slightly taller to fit the tooltip
          className
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
      >
        {/* Background track */}
        <div className="absolute top-2 left-0 w-full h-2 bg-primary/20 rounded-full" />

        {/* Range input */}
        <input
          type="range"
          ref={ref}
          value={value}
          max={duration}
          min={0}
          step="0.01"
          className={cn(
            "absolute top-2 left-0 w-full h-2 opacity-0 cursor-pointer z-10",
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-moz-range-thumb]:appearance-none"
          )}
          {...props}
        />

        {/* Filled indicator */}
        <div
          className={cn(
            "absolute top-2 left-0 h-2 bg-primary rounded-full transition-all",
            indicatorClassName
          )}
          style={{ width: `${percent}%` }}
        />

        {/* Hover time popup */}
        {isHovering && hoverPercent !== null && (
          <div
            className={`absolute -top-6 transform -translate-x-1/2 rounded-full
                        bg-primary text-foreground border-foreground
                        border-[1px] text-xs px-2 py-1
                        pointer-events-none z-20`}
            style={{
              left: `${hoverPercent}%`
            }}
          >
            {formatTime(hoverTime ?? 0)}
          </div>
        )}
      </div>
    )
  }
)

SeekBar.displayName = "SeekBar"

export { SeekBar }
