import type { Metadata } from 'next'
import { CategoryListing } from '@/components/CategoryListing'
import { findCategoryBySlug } from '@/lib/queries'
import { getPayloadClient } from '@/lib/payload'

export const revalidate = 3600

type Params = { categoria: string }

export async function generateStaticParams(): Promise<Params[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'categories',
    limit: 100,
    depth: 0,
  })
  return docs.filter((c) => Boolean(c.slug)).map((c) => ({ categoria: c.slug as string }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { categoria } = await params
  const cat = await findCategoryBySlug(categoria)
  if (!cat) return { title: 'Categoría no encontrada' }

  return {
    title: cat.title,
    description: cat.description ?? `Artículos de ${cat.title}.`,
  }
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { categoria } = await params
  return <CategoryListing categoria={categoria} page={1} />
}
