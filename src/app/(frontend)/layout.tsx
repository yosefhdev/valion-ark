import type { Metadata } from 'next'
import { Barlow, Big_Shoulders, JetBrains_Mono } from 'next/font/google'
import React from 'react'

// Único punto donde entra Tailwind. Mantenerlo así: si globals.css sube
// a un layout compartido, el preflight rompe el panel de Payload.
import './globals.css'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'

// next/font las autoaloja y las precarga: sin petición a Google y sin el
// parpadeo de texto sin estilo. Cada una expone una variable CSS que el
// @theme de globals.css consume.
//
// OJO: la familia del mockup se llama "Big Shoulders Display", pero Google la
// renombró a "Big Shoulders". El nombre viejo ya no existe en next/font.
const display = Big_Shoulders({
  subsets: ['latin'],
  weight: 'variable',
  variable: '--font-display-src',
  display: 'swap',
})

const body = Barlow({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-body-src',
  display: 'swap',
})

const hud = JetBrains_Mono({
  subsets: ['latin'],
  weight: 'variable',
  variable: '--font-hud-src',
  display: 'swap',
})

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
    <html
      lang="es"
      className={`${display.variable} ${body.variable} ${hud.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        {/* Sin JavaScript, el IntersectionObserver nunca marca los bloques
            como visibles y la página quedaría en blanco. */}
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>

        <Nav />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
