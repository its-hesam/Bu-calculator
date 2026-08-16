import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.99]",
  {
    variants: {
      variant: {
        default: "bg-primary font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/25",
        destructive: "bg-destructive font-semibold text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-border bg-surface/60 text-foreground shadow-sm hover:border-primary/40 hover:bg-primary/5",
        secondary: "border border-border bg-secondary/80 text-secondary-foreground shadow-sm hover:bg-secondary",
        ghost: "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        green: "border border-primary/30 bg-primary/10 font-semibold text-primary hover:bg-primary/20",
        danger: "border border-destructive/30 bg-destructive/10 font-semibold text-destructive hover:bg-destructive/20",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8",
        icon: "h-11 w-11",
        full: "h-12 w-full rounded-lg px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
