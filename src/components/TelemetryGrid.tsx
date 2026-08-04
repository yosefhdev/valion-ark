import { cn } from '@/lib/utils'

export type Telemetry = { hint?: string; label: string; value: string }

/**
 * Tira de datos del servidor.
 *
 * Las líneas divisorias son el `gap` de la grid dejando ver el fondo del
 * contenedor, no bordes de cada celda: así nunca se doblan en los cruces ni
 * hay que apagar el borde del último elemento de cada fila.
 */
export function TelemetryGrid({
  className,
  items,
}: {
  className?: string
  items: Telemetry[]
}) {
  if (items.length === 0) return null

  return (
    <dl
      className={cn(
        'grid grid-cols-2 gap-px border border-moss bg-moss sm:grid-cols-3 lg:grid-cols-4',
        className,
      )}
    >
      {items.map((item) => (
        <div className="bg-obsidian px-5 py-4" key={item.label}>
          <dt className="font-hud text-[10px] tracking-[0.22em] text-bone-dim uppercase">
            {item.label}
          </dt>
          <dd className="font-hud mt-1.5 text-2xl text-element tabular-nums">
            {item.value}
            {item.hint && (
              <span className="ml-1.5 text-[11px] tracking-widest text-bone-dim uppercase">
                {item.hint}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
