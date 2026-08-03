import { getPayloadClient } from '@/lib/payload'

export async function Footer() {
  const payload = await getPayloadClient()
  const info = await payload.findGlobal({ slug: 'server-info', depth: 0 })
  const serverName = info?.serverName ?? 'Isla Perdida'

  return (
    <footer className="mt-24 border-t border-moss">
      <div className="mx-auto max-w-[1120px] px-6 py-10">
        <p className="font-display text-lg font-extrabold uppercase">{serverName}</p>

        {/* Disclaimer obligatorio: el sitio no es oficial ni está afiliado
            a Studio Wildcard. Ver las advertencias del plan. */}
        <p className="mt-3 max-w-2xl text-sm text-bone-dim">
          Sitio no oficial, hecho por y para la comunidad del servidor. ARK: Survival
          Ascended y sus marcas son propiedad de Studio Wildcard, que no patrocina ni
          respalda este proyecto.
        </p>
      </div>
    </footer>
  )
}
