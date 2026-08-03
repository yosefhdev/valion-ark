import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPayloadClient, onlyPublished } from '@/lib/payload'
import type { Category, Media } from '@/payload-types'

export const revalidate = 3600

type Params = { categoria: string; slug: string }

export async function generateStaticParams(): Promise<Params[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: onlyPublished,
    limit: 500,
    depth: 1, // necesitamos el slug de la categoría, no solo su id
  })

  return docs.flatMap((post) => {
    const cat = post.category as Category | number | null
    if (!post.slug || !cat || typeof cat === 'number' || !cat.slug) return []
    return [{ categoria: cat.slug, slug: post.slug }]
  })
}

/** Un artículo publicado por slug. Los borradores nunca salen de aquí. */
async function findPost(slug: string) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: { and: [{ slug: { equals: slug } }, onlyPublished] },
    limit: 1,
    depth: 1,
  })
  return docs[0] ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await findPost(slug)
  if (!post) return { title: 'Artículo no encontrado' }

  const cover = post.coverImage as Media | number | null
  const ogUrl =
    cover && typeof cover !== 'number' ? (cover.sizes?.og?.url ?? cover.url) : undefined

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: ogUrl ? [{ url: ogUrl }] : undefined,
    },
  }
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { categoria, slug } = await params
  const post = await findPost(slug)
  if (!post) notFound()

  const cat = post.category as Category | number | null
  const catSlug = cat && typeof cat !== 'number' ? cat.slug : null
  const catTitle = cat && typeof cat !== 'number' ? cat.title : null

  // El artículo existe, pero colgado de otra categoría: esta URL no es la suya.
  if (catSlug !== categoria) notFound()

  const cover = post.coverImage as Media | number | null
  // Se sirve el tamaño `card`, no la imagen full: la original puede pesar 1 MB.
  const coverSize =
    cover && typeof cover !== 'number' ? (cover.sizes?.card ?? cover) : null

  return (
    <main className="mx-auto max-w-[1120px] px-6 py-24">
      <p className="font-hud text-[11px] uppercase tracking-[0.22em] text-bone-dim">
        <Link href="/wiki" className="text-element">
          Wiki
        </Link>{' '}
        /{' '}
        <Link href={`/wiki/${catSlug}`} className="text-element">
          {catTitle}
        </Link>{' '}
        / {post.title}
      </p>

      <h1 className="mt-4 font-display text-5xl font-extrabold uppercase">{post.title}</h1>
      {post.excerpt && <p className="mt-3 text-bone-dim">{post.excerpt}</p>}

      {coverSize?.url && coverSize.width && coverSize.height && (
        <Image
          src={coverSize.url}
          alt={typeof cover !== 'number' ? (cover?.alt ?? '') : ''}
          width={coverSize.width}
          height={coverSize.height}
          className="mt-10 w-full border border-moss"
          priority
        />
      )}

      <div className="mt-10 flex flex-col gap-12 lg:flex-row">
        <article className="min-w-0 flex-1">
          {/* Sin converters todavía: el mapeo de Lexical a las clases del
              diseño es Fase 5. Aquí solo importa que el contenido salga. */}
          <RichText data={post.content} />
        </article>

        {post.stats && post.stats.length > 0 && (
          <aside className="panel h-fit w-full p-6 lg:w-72">
            <p className="font-hud text-[11px] uppercase tracking-[0.22em] text-element">
              Stats
            </p>
            <dl className="mt-4 space-y-3">
              {post.stats.map((stat) => (
                <div key={stat.id ?? stat.label}>
                  <div className="font-hud flex justify-between text-xs">
                    <dt>{stat.label}</dt>
                    <dd className="text-bone-dim">
                      {stat.value} / {stat.max}
                    </dd>
                  </div>
                  <div className="mt-1 h-1 bg-moss">
                    <div
                      className="h-full bg-element"
                      style={{
                        width: `${Math.min(100, Math.max(0, (stat.value / stat.max) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </dl>
          </aside>
        )}
      </div>
    </main>
  )
}
