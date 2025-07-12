'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardProps } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface AnimatedCardProps extends CardProps {
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  scale?: boolean
  hover?: boolean
  stagger?: boolean
  index?: number
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
  duration = 0.3,
  direction = 'up',
  scale = false,
  hover = true,
  stagger = false,
  index = 0,
  ...props
}: AnimatedCardProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up': return { opacity: 0, y: 20 }
      case 'down': return { opacity: 0, y: -20 }
      case 'left': return { opacity: 0, x: -20 }
      case 'right': return { opacity: 0, x: 20 }
      default: return { opacity: 0, y: 20 }
    }
  }

  const getAnimatePosition = () => {
    return { opacity: 1, x: 0, y: 0 }
  }

  const staggerDelay = stagger ? index * 0.1 : 0
  const totalDelay = delay + staggerDelay

  const hoverAnimation = hover ? {
    scale: scale ? 1.02 : 1,
    y: -2,
    transition: { duration: 0.2 }
  } : {}

  return (
    <motion.div
      initial={getInitialPosition()}
      animate={getAnimatePosition()}
      whileHover={hoverAnimation}
      transition={{ 
        duration, 
        delay: totalDelay,
        ease: 'easeOut'
      }}
    >
      <Card className={cn('transition-shadow duration-200', className)} {...props}>
        {children}
      </Card>
    </motion.div>
  )
}

// Animated card grid for displaying multiple cards
interface AnimatedCardGridProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  stagger?: boolean
  className?: string
}

export function AnimatedCardGrid({
  children,
  columns = 3,
  gap = 'md',
  stagger = true,
  className = ''
}: AnimatedCardGridProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  }

  return (
    <motion.div
      className={cn(
        'grid',
        columnClasses[columns],
        gapClasses[gap],
        className
      )}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: stagger ? 0.1 : 0
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

// Animated list item for tables and lists
interface AnimatedListItemProps {
  children: React.ReactNode
  index?: number
  delay?: number
  className?: string
  onClick?: () => void
}

export function AnimatedListItem({
  children,
  index = 0,
  delay = 0,
  className = '',
  onClick
}: AnimatedListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{
        duration: 0.2,
        delay: delay + (index * 0.05),
        ease: 'easeOut'
      }}
      whileHover={onClick ? { x: 4 } : {}}
      className={cn(
        'transition-colors duration-200',
        onClick && 'cursor-pointer hover:bg-slate-50',
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

// Animated collapse/expand container
interface AnimatedCollapseProps {
  isOpen: boolean
  children: React.ReactNode
  className?: string
}

export function AnimatedCollapse({
  isOpen,
  children,
  className = ''
}: AnimatedCollapseProps) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={cn('overflow-hidden', className)}
        >
          <motion.div
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            exit={{ y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Animated modal/dialog backdrop
interface AnimatedBackdropProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function AnimatedBackdrop({
  isOpen,
  onClose,
  children,
  className = ''
}: AnimatedBackdropProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50',
            className
          )}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Animated notification/toast
interface AnimatedNotificationProps {
  isVisible: boolean
  children: React.ReactNode
  position?: 'top' | 'bottom'
  className?: string
}

export function AnimatedNotification({
  isVisible,
  children,
  position = 'top',
  className = ''
}: AnimatedNotificationProps) {
  const initialY = position === 'top' ? -100 : 100

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: initialY, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: initialY, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn(
            'fixed left-1/2 transform -translate-x-1/2 z-50',
            position === 'top' ? 'top-4' : 'bottom-4',
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Animated counter for numbers
interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
}

export function AnimatedCounter({
  value,
  duration = 1,
  className = '',
  prefix = '',
  suffix = ''
}: AnimatedCounterProps) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.span
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {prefix}
        <motion.span
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          {value.toLocaleString()}
        </motion.span>
        {suffix}
      </motion.span>
    </motion.span>
  )
}
