import Link from 'next/link'
import type { Category } from '@/payload-types'
import { Badge } from '@/components/ui/badge'

const TIER_LABEL: Record<Category['tier'], string> = {
  basico: 'Básico',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
  obligatorio: 'Obligatorio',
}

/** La franja de color es lo que distingue un tier de otro de un vistazo. */
const TIER_STRIPE: Record<Category['tier'], string> = {
  basico: 'bg-element',
  intermedio: 'bg-bone',
  avanzado: 'bg-torch',
  obligatorio: 'bg-rust',
}

export function CategoryCard({
  category,
  postCount,
}: {
  category: Category
  postCount: number
}) {
  return (
    <Link
      className="panel group relative block p-6 pl-8 transition-colors hover:border-element"
      href={`/wiki/${category.slug}`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-0 bottom-0 left-0 w-1 ${TIER_STRIPE[category.tier]}`}
      />

      <Badge tier={category.tier}>{TIER_LABEL[category.tier]}</Badge>

      <h2 className="font-display mt-3 text-2xl font-semibold uppercase group-hover:text-element">
        {category.title}
      </h2>

      {category.description && <p className="mt-2 text-bone-dim">{category.description}</p>}

      <p className="font-hud mt-4 text-[11px] tracking-[0.18em] text-bone-dim uppercase">
        {postCount} {postCount === 1 ? 'artículo' : 'artículos'}
      </p>
    </Link>
  )
}
