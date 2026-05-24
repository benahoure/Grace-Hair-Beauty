import { cn } from '../../lib/format'

interface FilterTabsProps<T extends string> {
  options: Array<{ value: T; label: string }>
  value: T
  onChange: (value: T) => void
  label: string
}

export function FilterTabs<T extends string>({ options, value, onChange, label }: FilterTabsProps<T>) {
  return (
    <div className="scroll-hide overflow-x-auto pb-1" role="group" aria-label={label}>
      <div className="flex min-w-max gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={cn(
              'min-h-11 rounded-card border px-4 text-sm font-semibold transition-colors',
              value === option.value
                ? 'border-gold bg-gold-pale text-cocoa'
                : 'border-cream-border bg-paper text-mocha hover:border-gold',
            )}
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
