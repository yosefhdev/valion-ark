import Image from 'next/image'
import Link from 'next/link'
import type { Media, Post } from '@/payload-types'

export function PostCard({
  categorySlug,
  post,
}: {
  categorySlug: string
  post: Post
}) {
  const cover = post.coverImage as Media | number | null
  // El listado usa `thumbnail`, nunca la imagen completa.
  const thumb = cover && typeof cover !== 'number' ? (cover.sizes?.thumbnail ?? null) : null

  return (
    <Link
      className="panel group flex gap-5 p-6 transition-colors hover:border-element"
      href={`/wiki/${categorySlug}/${post.slug}`}
    >
      {thumb?.url && thumb.width && thumb.height && (
        <Image
          alt={typeof cover !== 'number' ? (cover?.alt ?? '') : ''}
          className="hidden h-24 w-32 shrink-0 border border-moss object-cover sm:block"
          // Medidas de pantalla (w-32 h-24), no las del archivo. Mismo motivo
          // que en CategoryCard.
          height={96}
          src={thumb.url}
          width={128}
        />
      )}

      <div className="min-w-0">
        <h2 className="font-display text-2xl font-semibold uppercase group-hover:text-element">
          {post.title}
        </h2>
        {post.excerpt && <p className="mt-2 text-bone-dim">{post.excerpt}</p>}
      </div>
    </Link>
  )
}
