'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PageTransitionProps {
  children: React.ReactNode
  transitionKey?: string
  direction?: 'horizontal' | 'vertical' | 'fade' | 'scale'
  duration?: number
  className?: string
}

export function PageTransition({
  children,
  transitionKey,
  direction = 'horizontal',
  duration = 0.3,
  className = ''
}: PageTransitionProps) {
  const getTransitionVariants = () => {
    switch (direction) {
      case 'horizontal':
        return {
          initial: { opacity: 0, x: 20 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -20 }
        }
      case 'vertical':
        return {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 }
        }
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        }
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.05 }
        }
      default:
        return {
          initial: { opacity: 0, x: 20 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -20 }
        }
    }
  }

  const variants = getTransitionVariants()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={transitionKey}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={{ duration, ease: 'easeInOut' }}
        className={cn('h-full', className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Slide transition for tab content
interface SlideTransitionProps {
  children: React.ReactNode
  activeKey: string
  direction?: 'left' | 'right'
  className?: string
}

export function SlideTransition({
  children,
  activeKey,
  direction = 'right',
  className = ''
}: SlideTransitionProps) {
  const slideDirection = direction === 'right' ? 1 : -1

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeKey}
        initial={{ opacity: 0, x: 20 * slideDirection }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 * slideDirection }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={cn('h-full', className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Staggered list animation
interface StaggeredListProps {
  children: React.ReactNode[]
  staggerDelay?: number
  className?: string
}

export function StaggeredList({
  children,
  staggerDelay = 0.1,
  className = ''
}: StaggeredListProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

// Form field animation
interface AnimatedFormFieldProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function AnimatedFormField({
  children,
  delay = 0,
  className = ''
}: AnimatedFormFieldProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Loading skeleton animation
interface LoadingSkeletonProps {
  width?: string | number
  height?: string | number
  className?: string
  rounded?: boolean
}

export function LoadingSkeleton({
  width = '100%',
  height = '1rem',
  className = '',
  rounded = false
}: LoadingSkeletonProps) {
  return (
    <motion.div
      className={cn(
        'bg-slate-200',
        rounded ? 'rounded-full' : 'rounded',
        className
      )}
      style={{ width, height }}
      animate={{
        opacity: [0.5, 1, 0.5]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  )
}

// Progress bar animation
interface AnimatedProgressProps {
  value: number
  max?: number
  className?: string
  showValue?: boolean
  duration?: number
}

export function AnimatedProgress({
  value,
  max = 100,
  className = '',
  showValue = false,
  duration = 1
}: AnimatedProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className={cn('relative', className)}>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <motion.div
          className="bg-emerald-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration, ease: 'easeOut' }}
        />
      </div>
      {showValue && (
        <motion.span
          className="absolute right-0 top-3 text-sm text-slate-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: duration * 0.5 }}
        >
          {Math.round(percentage)}%
        </motion.span>
      )}
    </div>
  )
}

// Floating action button animation
interface FloatingActionButtonProps {
  children: React.ReactNode
  onClick: () => void
  className?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

export function FloatingActionButton({
  children,
  onClick,
  className = '',
  position = 'bottom-right'
}: FloatingActionButtonProps) {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  }

  return (
    <motion.button
      className={cn(
        'fixed z-50 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg',
        'flex items-center justify-center',
        positionClasses[position],
        className
      )}
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.button>
  )
}

// Typewriter text animation
interface TypewriterTextProps {
  text: string
  speed?: number
  className?: string
  onComplete?: () => void
}

export function TypewriterText({
  text,
  speed = 50,
  className = '',
  onComplete
}: TypewriterTextProps) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: index * (speed / 1000),
            duration: 0.1
          }}
          onAnimationComplete={() => {
            if (index === text.length - 1 && onComplete) {
              onComplete()
            }
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  )
}
