import type { SearchItem } from '@/components/SearchDialog'
import type { Category, Media } from '@/payload-types'
import { getPayloadClient, onlyPublished } from './payload'

/**
 * Consultas que comparten la portada y la wiki. Viven aquí para que el filtro
 * de publicados no se escriba dos veces y se olvide en una de ellas.
 */

export type CategoryWithCount = { category: Category; postCount: number }

/** Categorías en el orden del índice, cada una con su número de artículos. */
export async function getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'categories',
    limit: 100,
    sort: 'order',
    depth: 1, // para que la imagen de la tarjeta llegue poblada, no como id
  })

  return Promise.all(
    docs.map(async (category) => {
      const { totalDocs } = await payload.find({
        collection: 'posts',
        where: { and: [{ category: { equals: category.id } }, onlyPublished] },
        limit: 0,
        depth: 0,
      })
      return { category, postCount: totalDocs }
    }),
  )
}

/** Cuántos artículos entran en una página de categoría. */
export const PAGE_SIZE = 12

/** Una categoría por slug, o null. */
export async function findCategoryBySlug(slug: string): Promise<Category | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  return docs[0] ?? null
}

/** Artículos publicados de una categoría, paginados. */
export async function getCategoryPosts(categoryId: number | string, page: number) {
  const payload = await getPayloadClient()
  return payload.find({
    collection: 'posts',
    where: { and: [{ category: { equals: categoryId } }, onlyPublished] },
    sort: '-updatedAt',
    limit: PAGE_SIZE,
    page,
    depth: 1, // para traer la portada poblada, no solo su id
  })
}

/** Los artículos publicados más recientes, con su categoría poblada. */
export async function getLatestPosts(limit = 4) {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: onlyPublished,
    sort: '-updatedAt',
    limit,
    depth: 1, // hace falta el slug de la categoría para armar el link
  })
  return docs
}

/**
 * Todo lo publicado, reducido a lo mínimo que necesita el buscador. Se manda
 * al cliente entero, así que aquí solo va título, categoría y URL — nunca el
 * contenido, que multiplicaría el peso de la página.
 */
export async function getSearchIndex(): Promise<SearchItem[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: onlyPublished,
    limit: 500,
    sort: 'title',
    depth: 1, // hace falta el slug de la categoría
  })

  return docs.flatMap((post) => {
    const cat = post.category as Category | number | null
    if (!post.slug || !cat || typeof cat === 'number' || !cat.slug) return []
    return [
      {
        category: cat.title,
        href: `/wiki/${cat.slug}/${post.slug}`,
        title: post.title,
      },
    ]
  })
}

/** Los datos del servidor. El global siempre existe, aunque esté a medio llenar. */
export async function getServerInfo() {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'server-info', depth: 0 })
}

/**
 * Logos, favicon, fondo e imagen al compartir.
 * `depth: 1` para que los uploads lleguen poblados y no como id.
 */
export async function getBranding() {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'branding', depth: 1 })
}

/** URL y medidas de un campo de imagen, o null si no hay nada subido. */
export function imageFrom(
  value: unknown,
  size?: 'card' | 'og' | 'thumbnail',
): null | { alt: string; height: number; url: string; width: number } {
  if (!value || typeof value !== 'object') return null

  const media = value as Media
  const picked = size ? (media.sizes?.[size] ?? media) : media
  if (!picked?.url || !picked.width || !picked.height) return null

  return {
    alt: media.alt ?? '',
    height: picked.height,
    url: picked.url,
    width: picked.width,
  }
}
