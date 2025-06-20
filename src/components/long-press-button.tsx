import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react'

export default function LongPressDemo() {

  const defaultMessage = "Long Press Button: Core Visual Fill & Drain"
  const [doneMessage, setDoneMessage] = useState(defaultMessage)

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 font-sans">
      <h1 className="text-4xl font-extrabold text-white mb-12 text-center drop-shadow-lg" onClick={() => setDoneMessage(defaultMessage)}>
        {doneMessage}
      </h1>

      {/* The LongPressButton component */}
      <LongPressButton
        fillUpColor="bg-teal-500"
        longPressDuration={1000}
        onLongPress={() => setDoneMessage("Yes it is ... quite nice")}
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          Hold Me (1s)
        </div>
      </LongPressButton>
    </div>
  )
}

interface LongPressButtonProps {
  children: ReactNode
  fillUpColor: string
  longPressDuration: number
  onLongPress: () => void
}

/**
 * A React functional component that visually fills up when held down,
 * and drains rapidly if released before full.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to display inside the button (e.g., text, icons).
 * @param {string} props.fillUpColor - Tailwind CSS class for the filling background color (e.g., "bg-blue-500").
 * @param {number} props.longPressDuration - Duration in milliseconds for the button to fully fill.
 * @param {function} props.onLongPress - long press complete callback function
 */
const LongPressButton: React.FC<LongPressButtonProps> = ({
  children,
  fillUpColor,
  longPressDuration,
  onLongPress,
}) => {
  // State to track the current fill percentage of the button
  const [fillPercentage, setFillPercentage] = useState(0)

  const isPressingRef = useRef(false)
  const fillAnimationFrameId = useRef(null)
  const drainAnimationFrameId = useRef(null)
  const pressStartTime = useRef(0)
  const drainStartTime = useRef(0)
  const initialDrainFill = useRef(0)

  const DRAIN_SPEED_MULTIPLIER = 4

  const fillAnimation = useCallback((timestamp: number) => {
    if (!isPressingRef.current && fillAnimationFrameId?.current) {
      cancelAnimationFrame(fillAnimationFrameId.current)
      fillAnimationFrameId.current = null
      return
    }

    const elapsedTime = timestamp - pressStartTime.current
    const newPercentage = Math.min(100, (elapsedTime / longPressDuration) * 100)
    setFillPercentage(newPercentage)

    if (newPercentage < 100 && fillAnimationFrameId) {
      fillAnimationFrameId.current = requestAnimationFrame(fillAnimation)
    } else {
      cancelAnimationFrame(fillAnimationFrameId.current)
      fillAnimationFrameId.current = null
      setFillPercentage(100)
      onLongPress()
    }
  }, [longPressDuration])

  const drainAnimation = useCallback((timestamp) => {
    if (fillPercentage <= 0) {
      cancelAnimationFrame(drainAnimationFrameId.current)
      drainAnimationFrameId.current = null
      return
    }

    const elapsedTime = timestamp - drainStartTime.current
    const effectiveDrainDuration = (initialDrainFill.current / 100) * (longPressDuration / DRAIN_SPEED_MULTIPLIER)
    const newPercentage = Math.max(0, initialDrainFill.current - (elapsedTime / effectiveDrainDuration) * initialDrainFill.current)
    setFillPercentage(newPercentage)

    if (newPercentage > 0) {
      drainAnimationFrameId.current = requestAnimationFrame(drainAnimation)
    } else {
      cancelAnimationFrame(drainAnimationFrameId.current)
      drainAnimationFrameId.current = null
      setFillPercentage(0)
    }
  }, [longPressDuration, fillPercentage])

  const handleMouseDown = (e) => {
    if (e.button !== 0) return

    isPressingRef.current = true
    pressStartTime.current = performance.now()

    if (fillAnimationFrameId.current) {
      cancelAnimationFrame(fillAnimationFrameId.current)
      fillAnimationFrameId.current = null
    }
    if (drainAnimationFrameId.current) {
      cancelAnimationFrame(drainAnimationFrameId.current)
      drainAnimationFrameId.current = null
    }

    setFillPercentage(0)
    fillAnimationFrameId.current = requestAnimationFrame(fillAnimation)
  }

  const handleMouseUp = () => {
    isPressingRef.current = false

    if (fillAnimationFrameId.current) {
      cancelAnimationFrame(fillAnimationFrameId.current)
      fillAnimationFrameId.current = null
    }

    if (fillPercentage > 0 && !drainAnimationFrameId.current) {
      drainStartTime.current = performance.now()
      initialDrainFill.current = fillPercentage
      drainAnimationFrameId.current = requestAnimationFrame(drainAnimation)
    }
  }

  const handleMouseLeave = () => {
    if (isPressingRef.current) {
      isPressingRef.current = false

      if (fillAnimationFrameId.current) {
        cancelAnimationFrame(fillAnimationFrameId.current)
        fillAnimationFrameId.current = null
      }

      if (fillPercentage > 0 && !drainAnimationFrameId.current) {
        drainStartTime.current = performance.now()
        initialDrainFill.current = fillPercentage
        drainAnimationFrameId.current = requestAnimationFrame(drainAnimation)
      }
    }
  }


  useEffect(() => {
    return () => {
      if (fillAnimationFrameId.current) {
        cancelAnimationFrame(fillAnimationFrameId.current)
      }
      if (drainAnimationFrameId.current) {
        cancelAnimationFrame(drainAnimationFrameId.current)
      }
    }
  }, [])

  return (
    <button
      className={`
        relative overflow-hidden
        w-64 h-24
        bg-gray-700
        text-white font-semibold text-lg
        rounded-xl
        flex items-center justify-center
        focus:outline-none
      `}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onTouchCancel={handleMouseLeave}
    >
      <div
        className={`absolute bottom-0 left-0 right-0 ${fillUpColor} transition-none`}
        style={{
          height: `${fillPercentage}%`,
        }}
      />

      <span className="relative z-10 select-none pointer-events-none">
        {children}
      </span>
    </button>
  )
}
