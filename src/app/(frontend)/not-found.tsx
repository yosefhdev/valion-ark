import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto max-w-[1120px] px-6 py-24">
      <p className="font-hud text-[11px] uppercase tracking-[0.22em] text-torch">
        Señal perdida — 404
      </p>

      <h1 className="mt-4 font-display text-6xl font-extrabold uppercase leading-[0.95]">
        Aquí no hay nada
      </h1>

      <div className="panel mt-10 max-w-xl p-6">
        <p className="text-bone-dim">
          Esta ruta no lleva a ningún lado. O el artículo todavía es un borrador, o
          alguien cambió su dirección, o el link venía mal desde el principio.
        </p>
        <p className="font-hud mt-6 text-sm">
          <Link href="/wiki" className="text-element">
            Volver a la wiki
          </Link>
        </p>
      </div>
    </main>
  )
}
