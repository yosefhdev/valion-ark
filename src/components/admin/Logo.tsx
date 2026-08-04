import React from 'react'
import { getBranding, imageFrom } from '@/lib/queries'

/**
 * Wordmark de la pantalla de login del panel.
 *
 * Lee la imagen subida en el global `branding`. Ese global tiene lectura
 * pública justamente por esto: aquí todavía no hay sesión.
 *
 * Si la consulta falla (base caída, global sin crear) cae al texto en vez de
 * reventar: dejar sin logo el login es feo, dejarlo sin cargar es peor.
 */
export default async function Logo() {
  let logo: null | { alt: string; url: string } = null

  try {
    const branding = await getBranding()
    logo = imageFrom(branding.adminLogo)
  } catch {
    logo = null
  }

  if (logo) {
    // `<img>` a propósito: el optimizador de next/image no aporta nada en el
    // panel y sí añade una capa que puede fallar en las rutas de Payload.
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={logo.alt || 'Isla Perdida'} src={logo.url} style={{ maxHeight: 80 }} />
  }

  return (
    <div
      style={{
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        fontSize: '2rem',
        fontWeight: 800,
        letterSpacing: '0.02em',
        lineHeight: 1,
        textTransform: 'uppercase',
      }}
    >
      Isla Perdida
      <div
        style={{
          fontFamily: 'ui-monospace, monospace',
          fontSize: '0.6875rem',
          fontWeight: 400,
          letterSpacing: '0.22em',
          marginTop: '0.5rem',
          opacity: 0.6,
        }}
      >
        WIKI DEL SERVIDOR
      </div>
    </div>
  )
}
