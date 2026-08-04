import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * Encabezado de sección con numeración tipo manual técnico. El índice y los
 * corchetes son decorativos: se ocultan a lectores de pantalla para que no
 * lean "corchete cero uno corchete" antes de cada título.
 */
export function SectionHeader({
  action,
  className,
  index,
  kicker,
  title,
}: {
  action?: { href: string; label: string }
  className?: string
  index: string
  kicker?: string
  title: string
}) {
  return (
    <div className={cn('border-b border-moss pb-4', className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div className="flex items-baseline gap-4">
          <span
            aria-hidden="true"
            className="font-hud text-[11px] tracking-[0.22em] text-element"
          >
            [{index}]
          </span>
          <h2 className="font-display text-4xl font-extrabold uppercase sm:text-5xl">
            {title}
          </h2>
        </div>

        {action && (
          <Link
            className="font-hud text-[11px] tracking-[0.18em] text-element uppercase hover:underline"
            href={action.href}
          >
            {action.label} <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>

      {kicker && (
        <p className="font-hud mt-3 text-[11px] tracking-[0.22em] text-bone-dim uppercase">
          {kicker}
        </p>
      )}
    </div>
  )
}
