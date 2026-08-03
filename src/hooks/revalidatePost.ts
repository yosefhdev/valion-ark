import { revalidatePath } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  PayloadRequest,
} from 'payload'
import type { Category, Post } from '@/payload-types'

/**
 * Al publicar o borrar un artículo, el sitio estático se actualiza solo en vez
 * de esperar a que expire el ISR.
 */

/** El slug de la categoría, venga como objeto (depth>0) o como id (depth 0). */
async function categorySlug(
  category: null | Post['category'] | undefined,
  req: PayloadRequest,
): Promise<null | string> {
  if (!category) return null
  if (typeof category !== 'number') return (category as Category).slug ?? null

  try {
    const cat = await req.payload.findByID({
      collection: 'categories',
      id: category,
      depth: 0,
    })
    return cat?.slug ?? null
  } catch {
    return null
  }
}

/** Todas las rutas donde un artículo puede aparecer. */
async function pathsFor(post: null | Partial<Post>, req: PayloadRequest): Promise<string[]> {
  if (!post?.slug) return []
  const slug = await categorySlug(post.category, req)
  if (!slug) return []
  return [`/wiki/${slug}`, `/wiki/${slug}/${post.slug}`]
}

async function revalidate(paths: string[]) {
  // La portada y el índice listan artículos, así que también cambian.
  const all = new Set(['/', '/wiki', ...paths])
  for (const path of all) {
    try {
      revalidatePath(path)
    } catch {
      // Fuera de una request de Next (seeds, scripts, tests) revalidatePath no
      // aplica. No es un error: no hay caché que invalidar.
    }
  }
}

export const revalidatePost: CollectionAfterChangeHook<Post> = async ({
  doc,
  previousDoc,
  req,
}) => {
  if (req.context?.disableRevalidate) return doc

  // Se revalida también la ruta anterior: si cambió de slug o de categoría,
  // la URL vieja quedaría sirviendo una página que ya no existe.
  const paths = [...(await pathsFor(doc, req)), ...(await pathsFor(previousDoc, req))]
  await revalidate(paths)

  return doc
}

export const revalidatePostAfterDelete: CollectionAfterDeleteHook<Post> = async ({
  doc,
  req,
}) => {
  if (req.context?.disableRevalidate) return doc

  await revalidate(await pathsFor(doc, req))
  return doc
}
