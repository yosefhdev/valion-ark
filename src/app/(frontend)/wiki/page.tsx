import type { Metadata } from 'next'
import { CategoryCard } from '@/components/CategoryCard'
import { getPayloadClient, onlyPublished } from '@/lib/payload'

// ISR: la página se sirve estática y se refresca cada hora. Al publicar un
// artículo, el hook de Posts la revalida antes, sin esperar a que expire.
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Wiki',
  description: 'Mods, dinos, guías y reglas del servidor.',
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
    <main className="mx-auto max-w-[1120px] px-6 py-20">
      <p className="font-hud text-[11px] tracking-[0.22em] text-element uppercase">
        Documentación del servidor
      </p>
      <h1 className="font-display mt-3 text-5xl font-extrabold uppercase">Wiki</h1>

      {categories.length === 0 ? (
        <p className="mt-10 text-bone-dim">Todavía no hay categorías.</p>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {categories.map((cat) => (
            <CategoryCard
              category={cat}
              key={cat.id}
              postCount={countByCategory.get(cat.id) ?? 0}
            />
          ))}
        </div>
      )}
    </main>
  )
}
