import { type FC, type SVGProps } from "react"

interface OcodoLoaderIconProps extends SVGProps<SVGSVGElement> {
  ringColor?: string
  spinnerColor?: string
  spinnerWidth?: number
}

export const OcodoLoaderIcon: FC<OcodoLoaderIconProps> = (props) => {
  const {
    ringColor= '#00000030',
    spinnerColor= '#FFFFFF',
    spinnerWidth= 18.5,
  } = props

  return (
    <svg
      width={500}
      height={500}
      viewBox='0 0 132.292 132.292'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path
        stroke={ringColor}
        strokeWidth={spinnerWidth}
        fill='none'
        d='M120.037 66.146a53.89 53.89 0 0 1-53.891 53.891 53.89 53.89 0 0 1-53.891-53.891 53.89 53.89 0 0 1 53.89-53.891 53.89 53.89 0 0 1 53.892 53.89Z'
      />
      <path
        fill='none'
        stroke={spinnerColor}
        strokeLinecap='round'
        strokeWidth={spinnerWidth}
        d='M93.091 19.475a53.9 53.9 0 0 0-26.945-7.22c-29.764 0-53.892 24.127-53.891 53.89'
      />
    </svg>
  )
}

