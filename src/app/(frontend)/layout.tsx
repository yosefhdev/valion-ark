import type { Metadata } from 'next'
import React from 'react'

// Único punto donde entra Tailwind. Mantenerlo así: si globals.css sube
// a un layout compartido, el preflight rompe el panel de Payload.
import './globals.css'

export const metadata: Metadata = {
  // Sin esto, las imágenes de Open Graph se resuelven contra localhost y las
  // previews al compartir salen rotas en producción. En Railway hay que
  // apuntar NEXT_PUBLIC_SERVER_URL al dominio real.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'),
  title: 'Isla Perdida — Wiki del servidor',
  description: 'Mods, dinos, guías y reglas del servidor de ARK.',
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
