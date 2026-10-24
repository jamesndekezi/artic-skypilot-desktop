import clsx from 'clsx'

export type KeyWidth = 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

interface KeyboardKeyProps {
  label: string
  /** Display label when different from the logical label (e.g. arrow symbols) */
  displayLabel?: string
  width?: KeyWidth
  active?: boolean
  dimmed?: boolean
  className?: string
}

// Min-width classes for each size variant
const WIDTH_CLASS: Record<KeyWidth, string> = {
  sm:  'min-w-[28px]  w-[28px]',
  md:  'min-w-[40px]  w-[40px]',
  lg:  'min-w-[56px]  w-[56px]',
  xl:  'min-w-[80px]  w-[80px]',
  xxl: 'min-w-[120px] w-[120px]',
}

export default function KeyboardKey({
  label,
  displayLabel,
  width = 'sm',
  active = false,
  dimmed = false,
  className,
}: KeyboardKeyProps) {
  return (
    <div
      aria-label={`Key ${label}${active ? ' (pressed)' : ''}`}
      role="img"
      className={clsx(
        // Base styles shared by all keys
        'h-8 flex items-center justify-center',
        'rounded-md border text-[11px] font-mono font-medium',
        'select-none transition-all duration-75',
        WIDTH_CLASS[width],
        // State-driven styles
        active ? 'key-active' : 'key-inactive',
        dimmed && 'opacity-40',
        className,
      )}
    >
      {displayLabel ?? label}
    </div>
  )
}
