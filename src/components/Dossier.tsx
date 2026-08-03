import type { Post } from '@/payload-types'
import { cn } from '@/lib/utils'

/**
 * Panel lateral de stats de un dino. Se alimenta del array `stats` del
 * artículo; si está vacío, el componente no se pinta.
 */
export function Dossier({
  className,
  stats,
}: {
  className?: string
  stats: Post['stats']
}) {
  if (!stats || stats.length === 0) return null

  return (
    <aside className={cn('panel h-fit p-6', className)}>
      <p className="font-hud text-[11px] tracking-[0.22em] text-element uppercase">Stats</p>

      <dl className="mt-5 space-y-4">
        {stats.map((stat) => {
          // Un máximo en 0 dividiría entre cero y dejaría la barra en NaN.
          const pct = stat.max > 0 ? Math.min(100, Math.max(0, (stat.value / stat.max) * 100)) : 0

          return (
            <div key={stat.id ?? stat.label}>
              <div className="font-hud flex items-baseline justify-between text-xs">
                <dt className="text-bone">{stat.label}</dt>
                <dd className="text-bone-dim">
                  {stat.value}
                  <span className="opacity-50"> / {stat.max}</span>
                </dd>
              </div>
              <div
                aria-hidden="true"
                className="mt-1.5 h-1 bg-moss"
              >
                <div className="h-full bg-element" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </dl>
    </aside>
  )
}
