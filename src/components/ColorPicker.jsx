import { useState } from 'react'
import { cn } from '@/lib/utils'
import { BRAND_PALETTE } from '@/utils/gridUtils'

export function ColorPicker({ colorA, colorB, onChangeA, onChangeB }) {
  const [active, setActive] = useState('A') // 'A' | 'B'

  function pick(hex) {
    if (active === 'A') onChangeA(hex)
    else onChangeB(hex)
  }

  return (
    <div className="space-y-3">
      {/* Color slot selectors */}
      <div className="flex gap-2">
        {[
          { slot: 'A', color: colorA, label: 'Color A', onChange: onChangeA },
          { slot: 'B', color: colorB, label: 'Color B', onChange: onChangeB },
        ].map(({ slot, color, label }) => (
          <button
            key={slot}
            onClick={() => setActive(slot)}
            className={cn(
              'flex-1 flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all border',
              active === slot
                ? 'border-[#50cfff] bg-[#0d2035] text-white shadow-[0_0_0_1px_#50cfff]'
                : 'border-[#2a3a4a] bg-[#0d1a2a] text-slate-400 hover:border-[#3a4a5a]'
            )}
          >
            <span
              className="w-4 h-4 rounded-sm flex-shrink-0 border border-white/20"
              style={{ backgroundColor: color }}
            />
            <span>{label}</span>
            <span className="ml-auto font-mono text-[10px] opacity-60">{color}</span>
          </button>
        ))}
      </div>

      {/* Brand palette swatches */}
      <div className="space-y-1.5">
        {Object.entries(BRAND_PALETTE).map(([family, colors]) => (
          <div key={family} className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 w-14 flex-shrink-0 text-right">{family}</span>
            <div className="flex gap-1">
              {colors.map((hex) => (
                <button
                  key={hex}
                  title={hex}
                  onClick={() => pick(hex)}
                  className={cn(
                    'w-5 h-5 rounded-sm border transition-all hover:scale-110',
                    (active === 'A' ? colorA : colorB) === hex
                      ? 'border-[#50cfff] shadow-[0_0_0_1px_#50cfff]'
                      : 'border-white/10 hover:border-white/30'
                  )}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
