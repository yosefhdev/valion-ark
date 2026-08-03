import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayloadClient, onlyPublished } from '@/lib/payload'

// ISR: la página se sirve estática y se refresca cada hora. Al publicar un
// artículo, el hook de Posts la revalida antes, sin esperar a que expire.
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Wiki',
  description: 'Mods, dinos, guías y reglas del servidor.',
}

const TIER_LABEL: Record<string, string> = {
  basico: 'Básico',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
  obligatorio: 'Obligatorio',
}

export default async function WikiIndexPage() {
  const payload = await getPayloadClient()

  const { docs: categories } = await payload.find({
    collection: 'categories',
    limit: 100,
    sort: 'order',
    depth: 0,
  })

  // Un conteo por categoría, para que la tarjeta diga cuántos artículos hay.
  const counts = await Promise.all(
    categories.map(async (cat) => {
      const { totalDocs } = await payload.find({
        collection: 'posts',
        where: { and: [{ category: { equals: cat.id } }, onlyPublished] },
        limit: 0,
        depth: 0,
      })
      return [cat.id, totalDocs] as const
    }),
  )
  const countByCategory = new Map(counts)

  return (
    <main className="mx-auto max-w-[1120px] px-6 py-24">
      <h1 className="font-display text-5xl font-extrabold uppercase">Wiki</h1>

      {categories.length === 0 ? (
        <p className="mt-6 text-bone-dim">Todavía no hay categorías.</p>
      ) : (
        <ul className="mt-10 space-y-4">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link href={`/wiki/${cat.slug}`} className="panel block p-6">
                <p className="font-hud text-[11px] uppercase tracking-[0.22em] text-element">
                  {TIER_LABEL[cat.tier] ?? cat.tier}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold uppercase">
                  {cat.title}
                </h2>
                {cat.description && <p className="mt-2 text-bone-dim">{cat.description}</p>}
                <p className="font-hud mt-3 text-xs text-bone-dim">
                  {countByCategory.get(cat.id) ?? 0} artículos
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
