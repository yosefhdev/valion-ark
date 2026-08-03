import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * Paginación por ruta, no por query string: así cada página sigue siendo
 * estática. Con `?page=` la ruta pasaría a dinámica y se perdería el ISR.
 *
 * La página 1 vive en /wiki/[categoria]; el resto en /wiki/[categoria]/p/[n].
 */
export function Pagination({
  basePath,
  page,
  totalPages,
}: {
  basePath: string
  page: number
  totalPages: number
}) {
  if (totalPages <= 1) return null

  const href = (n: number) => (n === 1 ? basePath : `${basePath}/p/${n}`)
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  const linkClass =
    'font-hud border border-moss px-3 py-2 text-[11px] uppercase tracking-widest hover:border-element hover:text-element'

  return (
    <nav aria-label="Paginación" className="mt-10">
      <ul className="flex flex-wrap items-center gap-2">
        <li>
          {page > 1 ? (
            <Link className={linkClass} href={href(page - 1)} rel="prev">
              ← Anterior
            </Link>
          ) : (
            <span className={cn(linkClass, 'cursor-not-allowed opacity-40')}>← Anterior</span>
          )}
        </li>

        {pages.map((n) => (
          <li key={n}>
            {n === page ? (
              <span
                aria-current="page"
                className="font-hud border border-element bg-element/10 px-3 py-2 text-[11px] tracking-widest text-element uppercase"
              >
                {n}
              </span>
            ) : (
              <Link className={linkClass} href={href(n)}>
                {n}
              </Link>
            )}
          </li>
        ))}

        <li>
          {page < totalPages ? (
            <Link className={linkClass} href={href(page + 1)} rel="next">
              Siguiente →
            </Link>
          ) : (
            <span className={cn(linkClass, 'cursor-not-allowed opacity-40')}>Siguiente →</span>
          )}
        </li>
      </ul>
    </nav>
  )
}
