import React from 'react'
import { getBranding, imageFrom } from '@/lib/queries'

/**
 * Icono compacto del header del panel, junto al menú lateral.
 * Igual que el logo: imagen si la hay, si no la forma de la esquina recortada.
 */
export default async function Icon() {
  let icon: null | { alt: string; url: string } = null

  try {
    const branding = await getBranding()
    icon = imageFrom(branding.adminIcon)
  } catch {
    icon = null
  }

  if (icon) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={icon.alt || 'Isla Perdida'}
        src={icon.url}
        style={{ height: 24, objectFit: 'contain', width: 24 }}
      />
    )
  }

  return (
    <svg
      aria-label="Isla Perdida"
      fill="none"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M1 1H17L23 7V23H7L1 17V1Z" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}
