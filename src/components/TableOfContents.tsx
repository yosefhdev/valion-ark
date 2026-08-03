import type { Heading } from '@/lib/headings'
import { cn } from '@/lib/utils'

/**
 * Índice de la guía. No se pinta con menos de dos títulos: para uno solo
 * ocupa espacio y no ayuda a nadie.
 */
export function TableOfContents({
  className,
  headings,
}: {
  className?: string
  headings: Heading[]
}) {
  if (headings.length < 2) return null

  return (
    <nav aria-labelledby="toc-title" className={cn('panel p-6', className)}>
      <p
        className="font-hud text-[11px] tracking-[0.22em] text-element uppercase"
        id="toc-title"
      >
        En esta página
      </p>

      <ul className="mt-4 space-y-2 text-sm">
        {headings.map((h) => (
          <li className={h.level === 3 ? 'pl-4' : undefined} key={h.id}>
            <a className="text-bone-dim hover:text-element" href={`#${h.id}`}>
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
