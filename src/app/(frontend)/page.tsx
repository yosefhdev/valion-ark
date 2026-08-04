import type { Metadata } from 'next'
import { CategoryCard } from '@/components/CategoryCard'
import { HudReadout } from '@/components/HudReadout'
import { PostCard } from '@/components/PostCard'
import { Reveal } from '@/components/Reveal'
import { SectionHeader } from '@/components/SectionHeader'
import { TelemetryGrid, type Telemetry } from '@/components/TelemetryGrid'
import { buttonVariants } from '@/components/ui/button'
import { getCategoriesWithCounts, getLatestPosts, getServerInfo } from '@/lib/queries'
import type { Category } from '@/payload-types'

export const revalidate = 3600

const STATUS: Record<string, { dot: string; label: string; text: string }> = {
  online: { dot: 'bg-element', label: 'Operativo', text: 'text-element' },
  mantenimiento: { dot: 'bg-torch', label: 'Mantenimiento', text: 'text-torch' },
  offline: { dot: 'bg-rust', label: 'Caído', text: 'text-rust' },
}

export async function generateMetadata(): Promise<Metadata> {
  const info = await getServerInfo()
  return {
    title: { absolute: `${info.serverName} / ${info.tagline}` },
    description: info.description,
  }
}

export default async function HomePage() {
  const [info, categories, latest] = await Promise.all([
    getServerInfo(),
    getCategoriesWithCounts(),
    getLatestPosts(4),
  ])

  const status = STATUS[info.status] ?? STATUS.online

  // La tira solo muestra lo que está cargado: un "0 slots" es peor que nada.
  const telemetry: Telemetry[] = [
    { label: 'Mapas', value: String(info.mapCount ?? 0) },
    { label: 'Mods', value: String(info.modCount ?? 0) },
    ...(info.slots ? [{ label: 'Slots', value: String(info.slots) }] : []),
    ...(info.version ? [{ label: 'Versión', value: info.version }] : []),
    ...(info.rates ?? []).map((rate) => ({ label: rate.label, value: rate.value })),
  ]

  const steps = info.connectionSteps ?? []
  const features = info.features ?? []
  const rules = info.rules ?? []

  return (
    <main>
      {/* ───────────────────────── Héroe ───────────────────────── */}
      <section className="border-b border-moss">
        <div className="mx-auto max-w-[1120px] px-6 pt-16 pb-14">
          <div className="font-hud flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] tracking-[0.22em] uppercase">
            <span className="flex items-center gap-2">
              {/* Sin parpadeo: es un elemento permanente en pantalla y una
                  animación infinita ahí solo compite por la atención. El
                  estado ya se lee por color y por texto. */}
              <span aria-hidden="true" className={`inline-block size-2 ${status.dot}`} />
              <span className={status.text}>{status.label}</span>
            </span>
            {info.mapCount > 0 && <span className="text-bone-dim">{info.mapCount} mapas</span>}
            {info.modCount > 0 && <span className="text-bone-dim">{info.modCount} mods</span>}
            {info.version && <span className="text-bone-dim">{info.version}</span>}
          </div>

          <Reveal as="h1" className="font-display mt-6 max-w-5xl leading-[0.88] font-extrabold uppercase text-[clamp(3.25rem,9vw,7.5rem)] tracking-[-0.01em]">
            {info.tagline}
          </Reveal>

          <Reveal className="mt-6 max-w-2xl" delay={80}>
            <p className="text-lg text-bone-dim">{info.description}</p>
          </Reveal>

          <Reveal className="mt-10 flex flex-col gap-4 sm:flex-row" delay={160}>
            <HudReadout className="sm:min-w-80" copyable label="IP del servidor" value={info.ip} />
            <a
              className={buttonVariants({ size: 'lg' })}
              href={info.discordUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Entrar al Discord
            </a>
          </Reveal>
        </div>
      </section>

      {/* ─────────────────────── Telemetría ─────────────────────── */}
      {telemetry.length > 0 && (
        <section className="border-b border-moss bg-basalt/30">
          <div className="mx-auto max-w-[1120px] px-6 py-10">
            <Reveal>
              <TelemetryGrid items={telemetry} />
            </Reveal>
          </div>
        </section>
      )}

      {/* ────────────────────── Cómo conectarse ────────────────────── */}
      {steps.length > 0 && (
        <section className="mx-auto max-w-[1120px] px-6 py-24">
          <SectionHeader index="01" kicker="De cero a jugando" title="Cómo entrar" />

          <ol className="mt-10 grid gap-px border border-moss bg-moss sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, i) => (
              <li className="bg-obsidian" key={step.id ?? step.title}>
                <Reveal className="h-full p-6" delay={i * 60}>
                  {/* Decorativo, pero no invisible: sobre el fondo obsidiana
                      el verde `moss` se pierde por completo. */}
                  <span
                    aria-hidden="true"
                    className="font-display block text-5xl font-extrabold text-bone-dim/40"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-display mt-2 text-xl font-semibold uppercase">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-bone-dim">{step.description}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ─────────────────────── Características ─────────────────────── */}
      {features.length > 0 && (
        <section className="border-y border-moss bg-basalt/30">
          <div className="mx-auto max-w-[1120px] px-6 py-20">
            <SectionHeader index="02" kicker="Por qué aquí" title="El servidor" />

            {/* Sin franja lateral de color: el marcador va en línea con el
                título, como en un manual técnico. */}
            <div className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2">
              {features.map((feature, i) => (
                <Reveal delay={i * 60} key={feature.id ?? feature.title}>
                  <h3 className="font-display flex items-baseline gap-3 text-2xl font-semibold uppercase">
                    <span aria-hidden="true" className="font-hud text-xs text-element">
                      {'///'}
                    </span>
                    {feature.title}
                  </h3>
                  <p className="mt-3 max-w-prose text-bone-dim">{feature.description}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ────────────────────────── Reglas ────────────────────────── */}
      {rules.length > 0 && (
        <section className="mx-auto max-w-[1120px] px-6 py-16">
          <SectionHeader index="03" kicker="Lo esencial" title="Reglas" />

          <ul className="mt-10 grid gap-px border border-moss bg-moss sm:grid-cols-2">
            {rules.map((rule, i) => (
              <li className="bg-obsidian" key={rule.id ?? rule.text}>
                <Reveal className="flex h-full items-start gap-4 p-5" delay={i * 40}>
                  <span
                    aria-hidden="true"
                    className="font-hud shrink-0 text-[11px] tracking-widest text-torch"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-bone">{rule.text}</span>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ──────────────────────── Categorías ──────────────────────── */}
      <section className="border-t border-moss">
        <div className="mx-auto max-w-[1120px] px-6 py-24">
          <SectionHeader
            action={{ href: '/wiki', label: 'Ver todo' }}
            index="04"
            kicker="Documentación del servidor"
            title="La wiki"
          />

          {categories.length === 0 ? (
            <p className="mt-10 text-bone-dim">Todavía no hay categorías.</p>
          ) : (
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {categories.map(({ category, postCount }, i) => (
                <Reveal delay={i * 60} key={category.id}>
                  <CategoryCard category={category} postCount={postCount} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────── Últimos artículos ─────────────────────── */}
      {latest.length > 0 && (
        <section className="mx-auto max-w-[1120px] px-6 pb-24">
          <SectionHeader index="05" kicker="Recién publicado" title="Lo último" />

          <ul className="mt-10 space-y-4">
            {latest.map((post, i) => {
              const cat = post.category as Category | number | null
              // Sin el slug de la categoría no hay URL que construir.
              if (!cat || typeof cat === 'number' || !cat.slug) return null

              return (
                <li key={post.id}>
                  <Reveal delay={i * 50}>
                    <PostCard categorySlug={cat.slug} post={post} />
                  </Reveal>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {/* ────────────────────────── CTA final ────────────────────────── */}
      <section className="border-t border-moss bg-basalt/30">
        <div className="mx-auto flex max-w-[1120px] flex-col items-start gap-6 px-6 py-16 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-extrabold uppercase sm:text-4xl">
              ¿Dudas antes de entrar?
            </h2>
            <p className="mt-2 text-bone-dim">
              Pregunta en el Discord: alguien de la tribu suele estar conectado.
            </p>
          </div>

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
    </main>
  )
}
