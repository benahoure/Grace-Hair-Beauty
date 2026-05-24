interface SkeletonProps {
  className?: string
  label?: string
}

export function Skeleton({ className = '', label = 'Loading content' }: SkeletonProps) {
  return (
    <div
      aria-label={label}
      aria-busy="true"
      className={`animate-pulse rounded-card bg-cream-border/70 ${className}`}
    />
  )
}
