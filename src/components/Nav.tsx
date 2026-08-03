import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'

/**
 * Barra superior. Lee el nombre del servidor del global, para que cambiarlo
 * en el panel se refleje en todo el sitio.
 *
 * El menú de móvil con `sheet` es Fase 7; por ahora los enlaces caben.
 */
export async function Nav() {
  const payload = await getPayloadClient()
  const info = await payload.findGlobal({ slug: 'server-info', depth: 0 })

  return (
    <header className="sticky top-0 z-50 border-b border-moss bg-obsidian/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between px-6 py-4">
        <Link className="font-display text-xl font-extrabold uppercase" href="/">
          {info?.serverName ?? 'Isla Perdida'}
        </Link>

        <nav className="font-hud flex items-center gap-6 text-[11px] tracking-[0.18em] uppercase">
          <Link className="hover:text-element" href="/wiki">
            Wiki
          </Link>
          {info?.discordUrl && (
            <a
              className="text-element hover:underline"
              href={info.discordUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Discord
            </a>
          )}
        </nav>
      </div>
    </header>
  )
}
