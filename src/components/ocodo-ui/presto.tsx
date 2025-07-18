import { ArrowDownCircle } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"

interface PrestoProps {
  /** The text to display, which could be anything from logs to messages. Presto is also great for filtering and viewing log output. */
  text?: string
  /** Otional className to style Presto */
  className?: string
  /** Optional inline styles. */
  style?: React.CSSProperties
  /**Whether to scroll smoothly when the content updates or you scroll to the bottom. (Default (true)) */
  smooth?: boolean
  /** Should we show the scroll-to-bottom button? If `false`, the button won’t appear, and the scroll won’t auto-jump to the bottom when the text is first loaded. (Default (true))*/
  showScrollButton?: boolean
  /** If true, log entries will be color-coded based on log level (error, warn, info). (Default (false)) */
  highlightLogs?: boolean
  /** If true, it’ll automatically scroll to the first matching log when you apply a filter. If false, non-matching logs are hidden and no scrolling happens. (Default (false)) */
  scrollOnFilter?: boolean
  /** Color value for error highlighting */
  errorColor?: string
  /** Color value for info highlighting */
  infoColor?: string
  /** Color value for warn highlighting */
  warnColor?: string
  /** Color value for firstMatch highlighting */
  firstMatchColor?: string
}

const errorColorDefault = "#FF0000"
const warnColorDefault = "#FFFF00"
const infoColorDefault = "#00FF00"
const firstMatchColorDefault = "#00AAAA77"

/**
 * Presto component for rendering text logs with optional highlighting,
 * filtering, and scrolling functionality.
 *
 * @component
 * @example
 * // Example usage of Presto component:
 * <Presto text="Some log data here" highlightLogs={true} showScrollButton={true} />
 *
 * @param {PrestoProps} props - The properties for the Presto component.
 * @returns {JSX.Element} - Returns the Presto component with its rendered logs.
 */
export function Presto({
  text = "",
  className = "",
  style = {},
  smooth = true,
  firstMatchColor = firstMatchColorDefault,
  errorColor = errorColorDefault,
  infoColor = infoColorDefault,
  warnColor = warnColorDefault,
  showScrollButton = true,
  highlightLogs = false,
  scrollOnFilter = false
}: PrestoProps) {
  const preRef = useRef<HTMLDivElement>(undefined)
  const [showButton, setShowButton] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const [filterText, setFilterText] = useState("")
  const [filterRegex, setFilterRegex] = useState<RegExp | undefined>(undefined)
  const [regexError, setRegexError] = useState<string | undefined>(undefined)
  const [firstMatchIndex, setFirstMatchIndex] = useState<number | undefined>(undefined)

  const isDarkMode = document.documentElement.classList.contains('dark')
  const textLines = text.split("\n").filter(line => line.trim() !== "")

  const scrollToBottom = (behavior: ScrollBehavior = smooth ? "smooth" : "auto") => {
    if (preRef.current) {
      preRef.current.scrollTo({
        top: preRef.current.scrollHeight,
        behavior,
      })
      setShowButton(false)
    }
  }

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom()
    }
  })

  const onScroll = () => {
    if (!preRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = preRef.current
    const atBottom = scrollTop + clientHeight >= scrollHeight - 10

    setShowButton(!atBottom)
    setAutoScroll(atBottom)
  }

  const onFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setFilterText(val)

    if (val.startsWith("/")) {
      try {
        const pattern = val.slice(1)
        const regex = new RegExp(pattern, "i")
        setFilterRegex(regex)
        setRegexError(undefined)
      } catch {
        setFilterRegex(undefined)
        setRegexError("Invalid regex")
      }
    } else {
      setFilterRegex(undefined)
      setRegexError(undefined)
    }
  }

  const filteredLogs = textLines.filter((log) => {
    if (!filterText) return true
    if (scrollOnFilter) return true
    if (filterRegex) return filterRegex.test(log)
    return log.toLowerCase().includes(filterText.toLowerCase())
  })

  useEffect(() => {
    if (scrollOnFilter && filteredLogs.length > 0) {
      const firstMatch = textLines.findIndex((line) => {
        if (!filterText) return true
        if (filterRegex) return filterRegex.test(line)
        return line.toLowerCase().includes(filterText.toLowerCase())
      })
      setFirstMatchIndex(firstMatch)
    }
  }, [filteredLogs, filterText, filterRegex, textLines, scrollOnFilter])

  useEffect(() => {
    if (scrollOnFilter && firstMatchIndex !== undefined && preRef.current) {
      const firstMatchElement = preRef.current.children[firstMatchIndex] as HTMLElement
      firstMatchElement?.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [firstMatchIndex, scrollOnFilter])

  const formatLog = (log: string, index: number) => {
    const lower = log.toLowerCase()
    let color = "inherit"

    if (highlightLogs) {
      if (lower.includes("error")) color = errorColor
      else if (lower.includes("warn")) color = warnColor
      else if (lower.includes("info")) color = infoColor
    }

    const isFirstMatch = firstMatchIndex === index

    return (
      <div
        key={index}
        style={{
          color,
          lineHeight: 1.2,
          whiteSpaceCollapse: 'preserve-spaces',
          textWrap: 'nowrap',
          backgroundColor: isFirstMatch ? firstMatchColor : "inherit", // Highlight first match
          borderRadius: isFirstMatch ? "3px" : "inherit",
        }}
      >
        {log}
      </div>
    )
  }

  return (
    <div style={{ position: "relative", ...style }}>
      <input
        type="text"
        placeholder="Filter text (start with / for regex)"
        value={filterText}
        onChange={onFilterChange}
        className="text-sm w-full font-mono focus:outline-none focus:ring-0 border-0 px-1
         placeholder-gray-400 dark:placeholder-gray-500 rounded-t-sm"
        aria-label="Filter text"
        style={{
          backgroundColor: isDarkMode
            ? "rgba(34, 34, 34, 0.8)"
            : "rgba(169, 169, 169, 0.2)",
        }}
      />

      {regexError && (
        <div style={{ color: "red", marginBottom: "0.5rem", fontSize: "0.8rem" }}>
          {regexError}
        </div>
      )}

      <div
        ref={preRef}
        className={`text-nowrap overflow-scroll font-mono max-h-96 rounded-b-lg bg-muted p-4 ${className}`}
        onScroll={showScrollButton ? onScroll : undefined}
      >
        {filteredLogs.map(formatLog)}
      </div>

      {/* Scroll to bottom button */}
      <ScrollButton
        isDarkMode={isDarkMode}
        scrollToBottom={scrollToBottom}
        shown={showScrollButton && showButton}
      />
    </div>
  )
}

interface ScrollButtonProps {
  scrollToBottom: (behavior: 'smooth' | 'auto') => void
  isDarkMode: boolean
  shown: boolean
}

const ScrollButton: React.FC<ScrollButtonProps> = ({ scrollToBottom, isDarkMode, shown }) => (
  <div
    className={`
          ${shown ? 'opacity-70 cursor-pointer' : 'opacity-0'}
          transition-opacity
          duration-300
          delay-150
          rounded-full
          absolute
          bottom-2 right-4
          p-2`}
    onClick={() => scrollToBottom("smooth")}
    style={{
      backgroundColor: (isDarkMode ? "#444444CC" : "#00000033"),
    }}
    aria-label="Scroll to bottom"
  >
    <ArrowDownCircle />
  </div>
)
