import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayloadClient, onlyPublished } from '@/lib/payload'
import type { Media } from '@/payload-types'

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
    <main className="mx-auto max-w-[1120px] px-6 py-24">
      <p className="font-hud text-[11px] uppercase tracking-[0.22em] text-bone-dim">
        <Link href="/wiki" className="text-element">
          Wiki
        </Link>{' '}
        / {cat.title}
      </p>

      <h1 className="mt-4 font-display text-5xl font-extrabold uppercase">{cat.title}</h1>
      {cat.description && <p className="mt-3 text-bone-dim">{cat.description}</p>}

      {posts.length === 0 ? (
        <p className="mt-10 text-bone-dim">Todavía no hay artículos publicados aquí.</p>
      ) : (
        <ul className="mt-10 space-y-4">
          {posts.map((post) => {
            const cover = post.coverImage as Media | number | null
            // El listado usa `thumbnail`, no la imagen completa.
            const thumb =
              cover && typeof cover !== 'number' ? (cover.sizes?.thumbnail ?? null) : null

            return (
              <li key={post.id}>
                <Link href={`/wiki/${cat.slug}/${post.slug}`} className="panel flex gap-5 p-6">
                  {thumb?.url && thumb.width && thumb.height && (
                    <Image
                      src={thumb.url}
                      alt={typeof cover !== 'number' ? (cover?.alt ?? '') : ''}
                      width={thumb.width}
                      height={thumb.height}
                      className="hidden h-24 w-32 shrink-0 object-cover sm:block"
                    />
                  )}
                  <div className="min-w-0">
                    <h2 className="font-display text-2xl font-semibold uppercase">
                      {post.title}
                    </h2>
                    {post.excerpt && <p className="mt-2 text-bone-dim">{post.excerpt}</p>}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
