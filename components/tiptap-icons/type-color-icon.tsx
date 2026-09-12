import { memo } from "react"

type SvgProps = React.ComponentPropsWithoutRef<"svg">

export const TypeColorIcon = memo(({ className, ...props }: SvgProps) => {
  return (
    <svg
      width="24"
      height="24"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12.85 4.146a.5.5 0 0 0-.7-.092L5.78 8.314a.5.5 0 0 0 .36.846h3.234l-1.39 4.17H5.5a.5.5 0 1 0 0 1h2.72l-1.57 4.71a.5.5 0 1 0 .946.314L12.5 13.486l4.904 6.768a.5.5 0 1 0 .946-.314l-1.57-4.71h2.72a.5.5 0 1 0 0-1h-2.374l-1.39-4.17h3.234a.5.5 0 0 0 .36-.846L13.55 4.054a.5.5 0 0 0-.7-.092v.184Z"
        fill="currentColor"
      />
      <rect x="2" y="20" width="20" height="2.5" rx="1.25" fill="currentColor" />
    </svg>
  )
})

TypeColorIcon.displayName = "TypeColorIcon"