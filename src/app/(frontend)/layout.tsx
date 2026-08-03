import type { Metadata } from 'next'
import React from 'react'

// Único punto donde entra Tailwind. Mantenerlo así: si globals.css sube
// a un layout compartido, el preflight rompe el panel de Payload.
import './globals.css'

export const metadata: Metadata = {
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
