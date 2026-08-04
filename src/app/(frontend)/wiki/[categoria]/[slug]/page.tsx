import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Breadcrumb } from '@/components/Breadcrumb'
import { Dossier } from '@/components/Dossier'
import { RichText } from '@/components/RichText'
import { TableOfContents } from '@/components/TableOfContents'
import { extractHeadings } from '@/lib/headings'
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
    // depth 2: la portada y, sobre todo, las imágenes incrustadas en el rich
    // text. Con depth 0 los nodos upload llegan como id y el converter los
    // descarta en silencio.
    depth: 2,
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
  const coverSize = cover && typeof cover !== 'number' ? (cover.sizes?.card ?? cover) : null

  const headings = extractHeadings(post.content)

  return (
    <main className="mx-auto max-w-[1120px] px-6 py-20">
      <Breadcrumb
        items={[
          { href: '/wiki', label: 'Wiki' },
          { href: `/wiki/${catSlug}`, label: catTitle ?? '' },
          { label: post.title },
        ]}
      />

      <h1 className="font-display mt-4 max-w-4xl text-5xl font-extrabold uppercase">
        {post.title}
      </h1>
      {post.excerpt && <p className="mt-3 max-w-2xl text-bone-dim">{post.excerpt}</p>}

      {coverSize?.url && coverSize.width && coverSize.height && (
        <Image
          alt={typeof cover !== 'number' ? (cover?.alt ?? '') : ''}
          className="mt-10 w-full border border-moss"
          height={coverSize.height}
          priority
          src={coverSize.url}
          width={coverSize.width}
        />
      )}

      <div className="mt-12 flex flex-col gap-12 lg:flex-row">
        <article className="min-w-0 flex-1">
          <RichText data={post.content} />
        </article>

        {/* Columna lateral: índice y stats. Se apila bajo la prosa en móvil.

            El `sticky` va en este envoltorio y no en el índice: si solo el
            índice queda fijo, el panel de stats sigue su flujo normal y al
            bajar acaba metiéndose debajo. Fijando el bloque entero, los dos
            se mueven juntos y mantienen su orden.

            El scroll interno es para artículos con muchos títulos: sin él, un
            índice más alto que la pantalla deja los últimos fuera de alcance. */}
        <div className="w-full lg:w-72 lg:shrink-0">
          <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            <TableOfContents headings={headings} />
            <Dossier stats={post.stats} />
          </div>
        </div>
      </div>
    </main>
  )
}
