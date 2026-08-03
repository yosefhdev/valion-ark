import type { Category } from '@/payload-types'
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
    depth: 0,
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

/** Los datos del servidor. El global siempre existe, aunque esté a medio llenar. */
export async function getServerInfo() {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'server-info', depth: 0 })
}
