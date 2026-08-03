import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CategoryListing } from '@/components/CategoryListing'
import { getPayloadClient, onlyPublished } from '@/lib/payload'
import { findCategoryBySlug, PAGE_SIZE } from '@/lib/queries'

export const revalidate = 3600

type Params = { categoria: string; n: string }

/**
 * Páginas 2 en adelante. La 1 vive en /wiki/[categoria], así que aquí no se
 * genera: tener la misma lista en dos URLs distintas es contenido duplicado.
 */
export async function generateStaticParams(): Promise<Params[]> {
  const payload = await getPayloadClient()
  const { docs: categories } = await payload.find({
    collection: 'categories',
    limit: 100,
    depth: 0,
  })

  const params: Params[] = []

  for (const cat of categories) {
    if (!cat.slug) continue

    const { totalPages } = await payload.find({
      collection: 'posts',
      where: { and: [{ category: { equals: cat.id } }, onlyPublished] },
      limit: PAGE_SIZE,
      depth: 0,
    })

    for (let n = 2; n <= totalPages; n++) {
      params.push({ categoria: cat.slug, n: String(n) })
    }
  }

  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { categoria, n } = await params
  const cat = await findCategoryBySlug(categoria)
  if (!cat) return { title: 'Categoría no encontrada' }

  return {
    title: `${cat.title} — página ${n}`,
    description: cat.description ?? `Artículos de ${cat.title}.`,
  }
}

export default async function CategoryPaginatedPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { categoria, n } = await params
  const page = Number(n)

  // /p/abc o /p/0 no son páginas: fuera. La 1 tiene su propia URL.
  if (!Number.isInteger(page) || page < 2) notFound()

  return <CategoryListing categoria={categoria} page={page} />
}
