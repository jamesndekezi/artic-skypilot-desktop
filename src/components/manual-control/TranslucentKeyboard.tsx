import clsx from 'clsx'
import KeyboardKey from './KeyboardKey'

interface TranslucentKeyboardProps {
  /** Set of currently pressed keys (from useKeyboardControl) */
  pressedKeys: Set<string>
  /** Whether keyboard control is enabled */
  enabled: boolean
}

// Keys relevant to flight control — kept for documentation; active state is computed inline
// via pressedKeys.has() in each KeyboardKey active prop
/**
 * TranslucentKeyboard — display-only PC keyboard overlay.
 *
 * Renders a realistic QWERTY keyboard with individual key components.
 * Active keys are highlighted in electric blue.
 * Display only — clicking keys does NOT fire keyboard events.
 */
export default function TranslucentKeyboard({ pressedKeys, enabled }: TranslucentKeyboardProps) {
  /** Returns true when the given key code/value is in pressedKeys */
  function isActive(...keys: string[]): boolean {
    return keys.some((k) => pressedKeys.has(k))
  }

  return (
    <div
      className={clsx(
        'glass-panel p-3 transition-all duration-300',
        enabled
          ? 'border-green-500/40 shadow-[0_0_12px_rgba(34,197,94,0.15)]'
          : 'border-white/10',
      )}
      aria-label="Keyboard control overlay — display only"
    >
      <div className="space-y-1.5">
        {/* ── Row 0: Esc, 1–3, … H, ? ── */}
        <div className="flex items-center gap-1">
          <KeyboardKey label="Esc"   width="md" active={isActive('Escape')} />
          <div className="w-2" />
          <KeyboardKey label="1"     active={isActive('1')} />
          <KeyboardKey label="2"     active={isActive('2')} />
          <KeyboardKey label="3"     active={isActive('3')} />
          <KeyboardKey label="4"     dimmed />
          <KeyboardKey label="5"     dimmed />
          <KeyboardKey label="6"     dimmed />
          <KeyboardKey label="7"     dimmed />
          <KeyboardKey label="8"     dimmed />
          <KeyboardKey label="9"     dimmed />
          <KeyboardKey label="0"     dimmed />
          <KeyboardKey label="-"     dimmed />
          <KeyboardKey label="="     dimmed />
          <div className="flex-1" />
          <KeyboardKey label="H"     active={isActive('h', 'H')} />
          <KeyboardKey label="?"     active={isActive('?')} />
        </div>

        {/* ── Row 1: Tab Q W E R … ── */}
        <div className="flex items-center gap-1">
          <KeyboardKey label="Tab"   width="lg" dimmed />
          <KeyboardKey label="Q"     dimmed />
          <KeyboardKey label="W"     active={isActive('w', 'W')} />
          <KeyboardKey label="E"     dimmed />
          <KeyboardKey label="R"     dimmed />
          <KeyboardKey label="T"     dimmed />
          <KeyboardKey label="Y"     dimmed />
          <KeyboardKey label="U"     dimmed />
          <KeyboardKey label="I"     dimmed />
          <KeyboardKey label="O"     dimmed />
          <KeyboardKey label="P"     dimmed />
          <KeyboardKey label="["     dimmed />
          <KeyboardKey label="]"     dimmed />
          <KeyboardKey label="\"     dimmed />
        </div>

        {/* ── Row 2: Caps A S D F … ── */}
        <div className="flex items-center gap-1">
          <KeyboardKey label="Caps"  width="lg" dimmed />
          <KeyboardKey label="A"     active={isActive('a', 'A')} />
          <KeyboardKey label="S"     active={isActive('s', 'S')} />
          <KeyboardKey label="D"     active={isActive('d', 'D')} />
          <KeyboardKey label="F"     dimmed />
          <KeyboardKey label="G"     dimmed />
          <KeyboardKey label="H"     dimmed />
          <KeyboardKey label="J"     dimmed />
          <KeyboardKey label="K"     dimmed />
          <KeyboardKey label="L"     dimmed />
          <KeyboardKey label=";"     dimmed />
          <KeyboardKey label="'"     dimmed />
        </div>

        {/* ── Row 3: Shift Z X C … ↑ ── */}
        <div className="flex items-center gap-1">
          <KeyboardKey label="Shift" width="xl" active={isActive('Shift')} />
          <KeyboardKey label="Z"     dimmed />
          <KeyboardKey label="X"     dimmed />
          <KeyboardKey label="C"     dimmed />
          <KeyboardKey label="V"     dimmed />
          <KeyboardKey label="B"     dimmed />
          <KeyboardKey label="N"     dimmed />
          <KeyboardKey label="M"     dimmed />
          <KeyboardKey label=","     dimmed />
          <KeyboardKey label="."     dimmed />
          <KeyboardKey label="/"     dimmed />
          <div className="flex-1" />
          <KeyboardKey label="ArrowUp" displayLabel="↑" active={isActive('ArrowUp')} />
        </div>

        {/* ── Row 4: Ctrl Alt Space … ← ↓ → ── */}
        <div className="flex items-center gap-1">
          <KeyboardKey label="Ctrl"  width="md" dimmed />
          <KeyboardKey label="Alt"   width="md" dimmed />
          <KeyboardKey label="Space" displayLabel="Space" width="xxl" active={isActive(' ')} />
          <KeyboardKey label="Alt"   width="md" dimmed />
          <KeyboardKey label="Ctrl"  width="md" dimmed />
          <div className="flex-1" />
          <KeyboardKey label="ArrowLeft"  displayLabel="←" active={isActive('ArrowLeft')} />
          <KeyboardKey label="ArrowDown"  displayLabel="↓" active={isActive('ArrowDown')} />
          <KeyboardKey label="ArrowRight" displayLabel="→" active={isActive('ArrowRight')} />
        </div>
      </div>

      {/* Flight-key legend */}
      <div className="mt-2 pt-2 border-t border-white/5 flex flex-wrap gap-1.5">
        {[
          { keys: ['w','W'], label: 'Pitch Fwd' },
          { keys: ['s','S'], label: 'Pitch Back' },
          { keys: ['a','A'], label: 'Roll L' },
          { keys: ['d','D'], label: 'Roll R' },
          { keys: ['ArrowUp'], label: 'Throttle ↑' },
          { keys: ['ArrowDown'], label: 'Throttle ↓' },
          { keys: ['ArrowLeft'], label: 'Yaw L' },
          { keys: ['ArrowRight'], label: 'Yaw R' },
          { keys: ['Shift'], label: 'Precision' },
          { keys: [' '], label: 'Pause' },
          { keys: ['Escape'], label: 'Clear' },
        ].map(({ keys, label }) => {
          const active = keys.some((k) => pressedKeys.has(k))
          return (
            <span
              key={label}
              className={clsx(
                'text-[10px] font-mono px-1.5 py-0.5 rounded border',
                active
                  ? 'bg-blue-600/30 border-blue-400/60 text-blue-300'
                  : 'bg-navy-900/60 border-artic-border/40 text-artic-muted',
              )}
            >
              {label}
            </span>
          )
        })}
      </div>
    </div>
  )
}
