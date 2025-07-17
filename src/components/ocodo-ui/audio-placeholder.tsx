import type { SVGProps } from "react";

export function AudioPlaceholder(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em" height="1em"
      viewBox="0 0 14 14" {...props}>
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="7" cy="7" r="2.5" />
        <path d="M7 4.5v-4m2.5 13V12h2a1 1 0 0 0 1-1V7a5.5 5.5 0 0 0-3-4.9m-5 0a5.5 5.5 0 0 0 0 9.8v1.6" />
      </g>
    </svg>
  )
}
