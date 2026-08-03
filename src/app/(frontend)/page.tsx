import type { Metadata } from 'next'
import Link from 'next/link'
import { CategoryCard } from '@/components/CategoryCard'
import { HudReadout } from '@/components/HudReadout'
import { PostCard } from '@/components/PostCard'
import { buttonVariants } from '@/components/ui/button'
import { getCategoriesWithCounts, getLatestPosts, getServerInfo } from '@/lib/queries'
import type { Category } from '@/payload-types'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const info = await getServerInfo()
  return {
    title: {
      absolute: `${info.serverName} — ${info.tagline}`,
    },
    description: info.description,
  }
}

export default async function HomePage() {
  const [info, categories, latest] = await Promise.all([
    getServerInfo(),
    getCategoriesWithCounts(),
    getLatestPosts(4),
  ])

  const eyebrow = [
    info.mapCount ? `${info.mapCount} mapas` : null,
    info.modCount ? `${info.modCount} mods` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <main>
      {/* ---------- Héroe ---------- */}
      <section className="mx-auto max-w-[1120px] px-6 pt-20 pb-16">
        {eyebrow && (
          <p className="font-hud text-[11px] tracking-[0.22em] text-element uppercase">
            {eyebrow}
          </p>
        )}

        <h1 className="font-display mt-4 max-w-4xl text-6xl font-extrabold uppercase sm:text-7xl">
          {info.tagline}
        </h1>

        <p className="mt-5 max-w-2xl text-lg text-bone-dim">{info.description}</p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-stretch">
          <HudReadout
            className="sm:min-w-80"
            copyable
            label="IP del servidor"
            value={info.ip}
          />

          <a
            className={buttonVariants({ size: 'lg' })}
            href={info.discordUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Entrar al Discord
          </a>
        </div>
      </section>

      {/* ---------- Rates ---------- */}
      {info.rates && info.rates.length > 0 && (
        <section className="border-y border-moss bg-basalt/40">
          <div className="mx-auto flex max-w-[1120px] flex-wrap gap-x-12 gap-y-4 px-6 py-6">
            {info.rates.map((rate) => (
              <div key={rate.id ?? rate.label}>
                <p className="font-hud text-[11px] tracking-[0.22em] text-bone-dim uppercase">
                  {rate.label}
                </p>
                <p className="font-hud mt-1 text-xl text-element">{rate.value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Índice de categorías ---------- */}
      <section className="mx-auto max-w-[1120px] px-6 py-20">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-4xl font-extrabold uppercase">La wiki</h2>
          <Link
            className="font-hud text-[11px] tracking-[0.18em] text-element uppercase hover:underline"
            href="/wiki"
          >
            Ver todo →
          </Link>
        </div>

        {categories.length === 0 ? (
          <p className="mt-8 text-bone-dim">Todavía no hay categorías.</p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {categories.map(({ category, postCount }) => (
              <CategoryCard category={category} key={category.id} postCount={postCount} />
            ))}
          </div>
        )}
      </section>

      {/* ---------- Últimos artículos ---------- */}
      {latest.length > 0 && (
        <section className="mx-auto max-w-[1120px] px-6 pb-20">
          <h2 className="font-display text-4xl font-extrabold uppercase">Lo último</h2>

          <ul className="mt-8 space-y-4">
            {latest.map((post) => {
              const cat = post.category as Category | number | null
              // Sin el slug de la categoría no hay URL que construir.
              if (!cat || typeof cat === 'number' || !cat.slug) return null

              return (
                <li key={post.id}>
                  <PostCard categorySlug={cat.slug} post={post} />
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </main>
  )
}
