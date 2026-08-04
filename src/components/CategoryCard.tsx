import Image from 'next/image'
import Link from 'next/link'
import type { Category } from '@/payload-types'
import { Badge } from '@/components/ui/badge'
import { imageFrom } from '@/lib/queries'

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
  // La miniatura, no la original: en el índice se ve a 112 px de ancho.
  const thumb = imageFrom(category.image, 'thumbnail')

  return (
    <Link
      className="panel group relative flex items-start gap-5 p-6 pl-8 transition-colors hover:border-element"
      href={`/wiki/${category.slug}`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-0 bottom-0 left-0 w-1 ${TIER_STRIPE[category.tier]}`}
      />

      <div className="min-w-0 flex-1">
        <Badge tier={category.tier}>{TIER_LABEL[category.tier]}</Badge>

        <h2 className="font-display mt-3 text-2xl font-semibold uppercase group-hover:text-element">
          {category.title}
        </h2>

        {category.description && <p className="mt-2 text-bone-dim">{category.description}</p>}

        <p className="font-hud mt-4 text-[11px] tracking-[0.18em] text-bone-dim uppercase">
          {postCount} {postCount === 1 ? 'artículo' : 'artículos'}
        </p>
      </div>

      {/* Decorativa: el nombre de la categoría ya está en el título, así que
          repetirlo en el alt solo haría que el lector lo lea dos veces. */}
      {thumb && (
        <Image
          alt=""
          className="hidden size-28 shrink-0 border border-moss object-cover sm:block"
          // Las medidas de pantalla (112 px = size-28), no las del archivo:
          // next/image genera el srcset a partir de estas, así que con las del
          // archivo pediría una variante mucho mayor de la que se ve.
          height={112}
          src={thumb.url}
          width={112}
        />
      )}
    </Link>
  )
}
