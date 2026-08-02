import { cn } from '@/lib/utils'

export interface SegmentedControlOption<T extends string> {
  value: T
  label: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  variant = 'primary',
  fullWidth = false,
  'aria-label': ariaLabel,
}: {
  options: SegmentedControlOption<T>[]
  value: T
  onChange: (value: T) => void
  variant?: 'primary' | 'subtle'
  fullWidth?: boolean
  'aria-label'?: string
}) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="flex items-center gap-1 rounded-lg border border-border p-0.5 text-xs">
      {options.map((option) => {
        const isActive = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-md px-2 py-1 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              fullWidth && 'flex-1',
              isActive
                ? variant === 'primary'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
