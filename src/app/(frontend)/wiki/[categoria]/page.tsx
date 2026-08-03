import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Breadcrumb } from '@/components/Breadcrumb'
import { PostCard } from '@/components/PostCard'
import { getPayloadClient, onlyPublished } from '@/lib/payload'

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

/** Una categoría por slug, o null. La usan la página y su metadata. */
async function findCategory(slug: string) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  return docs[0] ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { categoria } = await params
  const cat = await findCategory(categoria)
  if (!cat) return { title: 'Categoría no encontrada' }

  return {
    title: cat.title,
    description: cat.description ?? `Artículos de ${cat.title}.`,
  }
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { categoria } = await params
  const cat = await findCategory(categoria)
  if (!cat) notFound()

  const payload = await getPayloadClient()
  const { docs: posts } = await payload.find({
    collection: 'posts',
    where: { and: [{ category: { equals: cat.id } }, onlyPublished] },
    sort: '-updatedAt',
    limit: 100,
    depth: 1, // para traer la portada poblada, no solo su id
  })

  return (
    <main className="mx-auto max-w-[1120px] px-6 py-20">
      <Breadcrumb items={[{ href: '/wiki', label: 'Wiki' }, { label: cat.title }]} />

      <h1 className="font-display mt-4 text-5xl font-extrabold uppercase">{cat.title}</h1>
      {cat.description && <p className="mt-3 max-w-2xl text-bone-dim">{cat.description}</p>}

      {posts.length === 0 ? (
        <p className="mt-10 text-bone-dim">Todavía no hay artículos publicados aquí.</p>
      ) : (
        <ul className="mt-10 space-y-4">
          {posts.map((post) => (
            <li key={post.id}>
              <PostCard categorySlug={cat.slug as string} post={post} />
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
