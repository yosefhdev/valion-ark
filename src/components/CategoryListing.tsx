import { notFound } from 'next/navigation'
import { Breadcrumb } from '@/components/Breadcrumb'
import { Pagination } from '@/components/Pagination'
import { PostCard } from '@/components/PostCard'
import { findCategoryBySlug, getCategoryPosts } from '@/lib/queries'

/**
 * La vista de una categoría. La comparten la página 1 (/wiki/[categoria]) y
 * las siguientes (/wiki/[categoria]/p/[n]), para que no haya dos copias del
 * mismo listado que puedan divergir.
 */
export async function CategoryListing({
  categoria,
  page,
}: {
  categoria: string
  page: number
}) {
  const cat = await findCategoryBySlug(categoria)
  if (!cat) notFound()

  const { docs: posts, totalPages, totalDocs } = await getCategoryPosts(cat.id, page)

  // Una página que se pasa del total no existe: /p/99 no debe devolver un
  // listado vacío con 200, o Google indexaría páginas huecas.
  if (posts.length === 0 && page > 1) notFound()

  return (
    <main className="mx-auto max-w-[1120px] px-6 py-20">
      <Breadcrumb items={[{ href: '/wiki', label: 'Wiki' }, { label: cat.title }]} />

      <h1 className="font-display mt-4 text-5xl font-extrabold uppercase">{cat.title}</h1>
      {cat.description && <p className="mt-3 max-w-2xl text-bone-dim">{cat.description}</p>}

      {totalPages > 1 && (
        <p className="font-hud mt-4 text-[11px] tracking-[0.18em] text-bone-dim uppercase">
          Página {page} de {totalPages} · {totalDocs} artículos
        </p>
      )}

      {posts.length === 0 ? (
        <p className="mt-10 text-bone-dim">Todavía no hay artículos publicados aquí.</p>
      ) : (
        <>
          <ul className="mt-10 space-y-4">
            {posts.map((post) => (
              <li key={post.id}>
                <PostCard categorySlug={cat.slug as string} post={post} />
              </li>
            ))}
          </ul>

          <Pagination basePath={`/wiki/${cat.slug}`} page={page} totalPages={totalPages} />
        </>
      )}
    </main>
  )
}
