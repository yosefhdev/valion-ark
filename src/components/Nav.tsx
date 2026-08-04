import Image from 'next/image'
import Link from 'next/link'
import { SearchDialog } from '@/components/SearchDialog'
import { getPayloadClient } from '@/lib/payload'
import { getBranding, getSearchIndex, imageFrom } from '@/lib/queries'

/**
 * Barra superior. Lee el nombre del servidor del global, para que cambiarlo
 * en el panel se refleje en todo el sitio.
 *
 * El menú de móvil con `sheet` es Fase 7; por ahora los enlaces caben.
 */
export async function Nav() {
  const payload = await getPayloadClient()
  const [info, searchItems, branding] = await Promise.all([
    payload.findGlobal({ slug: 'server-info', depth: 0 }),
    getSearchIndex(),
    getBranding(),
  ])

  const logo = imageFrom(branding.siteLogo)
  const serverName = info?.serverName ?? 'Isla Perdida'

  return (
    <header className="sticky top-0 z-50 border-b border-moss bg-obsidian/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between px-6 py-4">
        <Link className="flex items-center" href="/">
          {logo ? (
            // El alt lleva el nombre del servidor: un logo es texto en forma de
            // imagen, y describirlo como "logo" no le sirve a nadie.
            <Image
              alt={serverName}
              className="h-8 w-auto"
              height={logo.height}
              priority
              src={logo.url}
              width={logo.width}
            />
          ) : (
            <span className="font-display text-xl font-extrabold uppercase">{serverName}</span>
          )}
        </Link>

        <nav className="font-hud flex items-center gap-4 text-[11px] tracking-[0.18em] uppercase sm:gap-6">
          <SearchDialog items={searchItems} />

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
