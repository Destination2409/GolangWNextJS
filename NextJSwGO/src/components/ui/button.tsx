import * as React from "react"

import { Puff } from 'react-loader-spinner'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "warning" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  isLoading?: boolean
  loaderColor?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", isLoading, loaderColor, children, ...props }, ref) => {
    const baseClass = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    
    let variantClass = ""
    switch (variant) {
      case "default":
        variantClass = "bg-primary text-primary-foreground hover:bg-primary/90"
        break
      case "destructive":
        variantClass = "bg-destructive text-destructive-foreground hover:bg-destructive/90"
        break
      case "warning":
        variantClass = "bg-warning text-warning-foreground hover:bg-warning/90"
        break
      case "outline":
        variantClass = "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        break
      case "secondary":
        variantClass = "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        break
      case "ghost":
        variantClass = "hover:bg-accent hover:text-accent-foreground"
        break
      case "link":
        variantClass = "text-primary underline-offset-4 hover:underline"
        break
    }

    let sizeClass = ""
    switch (size) {
      case "default":
        sizeClass = "h-10 px-4 py-2"
        break
      case "sm":
        sizeClass = "h-9 rounded-md px-3"
        break
      case "lg":
        sizeClass = "h-11 rounded-md px-8"
        break
      case "icon":
        sizeClass = "h-10 w-10"
        break
    }

    return (
      <button
        ref={ref}
        className={`${baseClass} ${variantClass} ${sizeClass} ${className || ""}`}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <Puff visible={true} height="24" width="24" color={loaderColor || "#ffffff"} ariaLabel="puff-loading" />
        ) : (
          children
        )}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
