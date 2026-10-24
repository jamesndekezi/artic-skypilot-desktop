import clsx from 'clsx'

export type KeyWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl'

interface KeyboardKeyProps {
  label: string
  /** Display label when different from the logical label (e.g. arrow symbols) */
  displayLabel?: string
  width?: KeyWidth
  active?: boolean
  dimmed?: boolean
  className?: string
}

// Pixel widths matching a realistic keyboard feel
const WIDTH_CLASS: Record<KeyWidth, string> = {
  xs:   'w-8  min-w-[32px]',
  sm:   'w-9  min-w-[36px]',
  md:   'w-12 min-w-[48px]',
  lg:   'w-14 min-w-[56px]',
  xl:   'w-20 min-w-[80px]',
  xxl:  'w-28 min-w-[112px]',
  xxxl: 'w-48 min-w-[192px]',
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
        // Base — realistic key height and shape
        'h-9 flex items-center justify-center',
        'rounded border text-[11px] font-mono font-medium',
        'select-none transition-all duration-75',
        WIDTH_CLASS[width],
        // State
        active
          ? [
              'bg-blue-600/80 border-blue-400 text-white',
              'shadow-[0_0_10px_rgba(59,130,246,0.7),inset_0_1px_0_rgba(255,255,255,0.15)]',
            ]
          : [
              'bg-[rgba(15,32,64,0.65)] border-[rgba(21,42,84,0.9)] text-slate-400',
              'shadow-[inset_0_-2px_0_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.04)]',
            ],
        dimmed && 'opacity-50',
        className,
      )}
    >
      {displayLabel ?? label}
    </div>
  )
}
