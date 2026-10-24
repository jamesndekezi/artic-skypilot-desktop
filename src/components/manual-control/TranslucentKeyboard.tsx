import clsx from 'clsx'
import KeyboardKey from './KeyboardKey'

interface TranslucentKeyboardProps {
  pressedKeys: Set<string>
  enabled: boolean
}

/**
 * TranslucentKeyboard — display-only PC keyboard overlay.
 *
 * Renders a realistic QWERTY keyboard matching the reference GCS design:
 * large translucent keys with electric-blue active highlights.
 * Display only — no click handlers fire keyboard events.
 */
export default function TranslucentKeyboard({ pressedKeys, enabled }: TranslucentKeyboardProps) {
  function isActive(...keys: string[]): boolean {
    return keys.some((k) => pressedKeys.has(k))
  }

  const rowClass = 'flex items-center gap-1.5'

  return (
    <div
      className={clsx(
        'rounded-xl border p-4 transition-all duration-300',
        'bg-[rgba(5,13,26,0.75)] backdrop-blur-md',
        enabled
          ? 'border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.12)]'
          : 'border-[rgba(21,42,84,0.8)]',
      )}
      aria-label="Keyboard control overlay — display only"
    >
      <div className="space-y-1.5">

        {/* ── Row 0: Esc  1 2 3 4 5 6 7 8 9 0 - =    H ? ── */}
        <div className={rowClass}>
          <KeyboardKey label="Esc"  width="md"  active={isActive('Escape')} />
          <div className="w-3" />
          <KeyboardKey label="1"    width="sm"  active={isActive('1')} />
          <KeyboardKey label="2"    width="sm"  active={isActive('2')} />
          <KeyboardKey label="3"    width="sm"  active={isActive('3')} />
          <KeyboardKey label="4"    width="sm"  dimmed />
          <KeyboardKey label="5"    width="sm"  dimmed />
          <KeyboardKey label="6"    width="sm"  dimmed />
          <KeyboardKey label="7"    width="sm"  dimmed />
          <KeyboardKey label="8"    width="sm"  dimmed />
          <KeyboardKey label="9"    width="sm"  dimmed />
          <KeyboardKey label="0"    width="sm"  dimmed />
          <KeyboardKey label="-"    width="sm"  dimmed />
          <KeyboardKey label="="    width="sm"  dimmed />
          <div className="flex-1" />
          <KeyboardKey label="H"    width="sm"  active={isActive('h', 'H')} />
          <KeyboardKey label="?"    width="sm"  active={isActive('?')} />
        </div>

        {/* ── Row 1: Tab Q W E R T Y U I O P [ ] \ ── */}
        <div className={rowClass}>
          <KeyboardKey label="Tab"  width="md"  dimmed />
          <KeyboardKey label="Q"    width="sm"  dimmed />
          <KeyboardKey label="W"    width="sm"  active={isActive('w', 'W')} />
          <KeyboardKey label="E"    width="sm"  dimmed />
          <KeyboardKey label="R"    width="sm"  dimmed />
          <KeyboardKey label="T"    width="sm"  dimmed />
          <KeyboardKey label="Y"    width="sm"  dimmed />
          <KeyboardKey label="U"    width="sm"  dimmed />
          <KeyboardKey label="I"    width="sm"  dimmed />
          <KeyboardKey label="O"    width="sm"  dimmed />
          <KeyboardKey label="P"    width="sm"  dimmed />
          <KeyboardKey label="["    width="sm"  dimmed />
          <KeyboardKey label="]"    width="sm"  dimmed />
          <KeyboardKey label="\"    width="md"  dimmed />
        </div>

        {/* ── Row 2: Caps A S D F G H J K L ; ' ── */}
        <div className={rowClass}>
          <KeyboardKey label="Caps" width="lg"  dimmed />
          <KeyboardKey label="A"    width="sm"  active={isActive('a', 'A')} />
          <KeyboardKey label="S"    width="sm"  active={isActive('s', 'S')} />
          <KeyboardKey label="D"    width="sm"  active={isActive('d', 'D')} />
          <KeyboardKey label="F"    width="sm"  dimmed />
          <KeyboardKey label="G"    width="sm"  dimmed />
          <KeyboardKey label="H"    width="sm"  dimmed />
          <KeyboardKey label="J"    width="sm"  dimmed />
          <KeyboardKey label="K"    width="sm"  dimmed />
          <KeyboardKey label="L"    width="sm"  dimmed />
          <KeyboardKey label=";"    width="sm"  dimmed />
          <KeyboardKey label="'"    width="sm"  dimmed />
        </div>

        {/* ── Row 3: Shift Z X C V B N M , . /      ↑ ── */}
        <div className={rowClass}>
          <KeyboardKey label="Shift" width="xl"  active={isActive('Shift')} />
          <KeyboardKey label="Z"     width="sm"  dimmed />
          <KeyboardKey label="X"     width="sm"  dimmed />
          <KeyboardKey label="C"     width="sm"  dimmed />
          <KeyboardKey label="V"     width="sm"  dimmed />
          <KeyboardKey label="B"     width="sm"  dimmed />
          <KeyboardKey label="N"     width="sm"  dimmed />
          <KeyboardKey label="M"     width="sm"  dimmed />
          <KeyboardKey label=","     width="sm"  dimmed />
          <KeyboardKey label="."     width="sm"  dimmed />
          <KeyboardKey label="/"     width="sm"  dimmed />
          <div className="flex-1" />
          <KeyboardKey label="ArrowUp"    displayLabel="↑" width="sm" active={isActive('ArrowUp')} />
        </div>

        {/* ── Row 4: Ctrl Alt  [  Space  ]  Alt Ctrl    ← ↓ → ── */}
        <div className={rowClass}>
          <KeyboardKey label="Ctrl"  width="md"  dimmed />
          <KeyboardKey label="Alt"   width="md"  dimmed />
          <KeyboardKey label="Space" displayLabel="Space" width="xxxl" active={isActive(' ')} />
          <KeyboardKey label="Alt"   width="md"  dimmed />
          <KeyboardKey label="Ctrl"  width="md"  dimmed />
          <div className="flex-1" />
          <KeyboardKey label="ArrowLeft"  displayLabel="←" width="sm" active={isActive('ArrowLeft')} />
          <KeyboardKey label="ArrowDown"  displayLabel="↓" width="sm" active={isActive('ArrowDown')} />
          <KeyboardKey label="ArrowRight" displayLabel="→" width="sm" active={isActive('ArrowRight')} />
        </div>

      </div>

      {/* ── Status strip ── */}
      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {[
            { keys: ['w','W'],        label: 'Pitch Fwd' },
            { keys: ['s','S'],        label: 'Pitch Back' },
            { keys: ['a','A'],        label: 'Roll L' },
            { keys: ['d','D'],        label: 'Roll R' },
            { keys: ['ArrowUp'],      label: '↑ Throttle' },
            { keys: ['ArrowDown'],    label: '↓ Throttle' },
            { keys: ['ArrowLeft'],    label: '← Yaw' },
            { keys: ['ArrowRight'],   label: '→ Yaw' },
            { keys: ['Shift'],        label: 'Precision' },
            { keys: [' '],            label: 'Pause' },
            { keys: ['Escape'],       label: 'Clear' },
          ].map(({ keys, label }) => {
            const active = keys.some((k) => pressedKeys.has(k))
            return (
              <span
                key={label}
                className={clsx(
                  'text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors',
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
        <div className={clsx(
          'flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded border shrink-0 ml-3',
          enabled
            ? 'text-green-400 border-green-500/40 bg-green-900/20'
            : 'text-artic-muted border-artic-border/40 bg-navy-900/40',
        )}>
          <span className={clsx('w-1.5 h-1.5 rounded-full', enabled ? 'bg-green-400' : 'bg-artic-muted')} />
          {enabled ? 'ACTIVE' : 'INACTIVE'}
        </div>
      </div>
    </div>
  )
}
