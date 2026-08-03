/**
 * Página de humo de la Fase 0: verifica que Tailwind v4, los tokens del
 * @theme y la utilidad .panel funcionan. Se reemplaza en la Fase 6.
 */
export default function HomePage() {
  return (
    <main className="mx-auto max-w-[1120px] px-6 py-24">
      <p className="font-hud text-[11px] uppercase tracking-[0.22em] text-element">
        Fase 0 — base técnica
      </p>

      <h1 className="mt-4 font-display text-6xl font-extrabold uppercase leading-[0.95]">
        Isla Perdida
      </h1>

      <div className="panel mt-10 p-6">
        <p className="font-hud text-[11px] uppercase tracking-[0.22em] text-bone-dim">
          IP del servidor
        </p>
        <p className="font-hud mt-2 text-xl text-torch">127.0.0.1:7777</p>
      </div>

      {/* Prueba del puente shadcn: estas clases leen las variables mapeadas.
          El rounded-lg debe verse cuadrado — los radios están en 0. */}
      <div className="mt-6 border border-border bg-card p-6 text-card-foreground">
        <p className="font-hud text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Puente shadcn
        </p>
        <button
          type="button"
          className="mt-3 rounded-lg bg-primary px-4 py-2 font-hud text-sm uppercase tracking-widest text-primary-foreground"
        >
          Unirse al Discord
        </button>
      </div>

      <p className="mt-8 text-bone-dim">
        Si ves el panel con la esquina recortada y estos colores, Tailwind quedó bien.
        Ahora abre <code className="font-hud text-element">/admin</code>: si los campos se
        ven desalineados, el preflight se está filtrando al panel.
      </p>
    </main>
  )
}
