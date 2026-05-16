import * as React from 'react'
import { cn } from '@/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'error' | 'warning' | 'info' | 'success'
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn('badge', variant, className)}
      {...props}
    />
  )
)
Badge.displayName = 'Badge'

export { Badge }