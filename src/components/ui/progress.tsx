import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  animated?: boolean
  variant?: 'default' | 'success' | 'warning' | 'destructive'
  showLabel?: boolean
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({
    className,
    value = 0,
    max = 100,
    animated = true,
    variant = 'default',
    showLabel = false,
    ...props
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const getVariantClasses = () => {
      switch (variant) {
        case 'success':
          return 'bg-green-500'
        case 'warning':
          return 'bg-yellow-500'
        case 'destructive':
          return 'bg-red-500'
        default:
          return 'bg-primary'
      }
    }

    return (
      <div className="relative">
        <div
          ref={ref}
          className={cn(
            "relative h-2 w-full overflow-hidden rounded-full bg-muted",
            className
          )}
          {...props}
        >
          {animated ? (
            <motion.div
              className={cn("h-full transition-colors", getVariantClasses())}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1],
                delay: 0.1
              }}
            />
          ) : (
            <div
              className={cn("h-full transition-all duration-300 ease-in-out", getVariantClasses())}
              style={{ width: `${percentage}%` }}
            />
          )}
        </div>

        {showLabel && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-1 text-xs text-muted-foreground text-right"
          >
            {Math.round(percentage)}%
          </motion.div>
        )}
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
