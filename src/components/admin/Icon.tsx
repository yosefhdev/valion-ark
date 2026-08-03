import React from 'react'

/**
 * Icono compacto para el header del panel (junto al menú lateral).
 * Reusa la esquina recortada del diseño como forma reconocible.
 */
export default function Icon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Isla Perdida"
    >
      <path
        d="M1 1H17L23 7V23H7L1 17V1Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  )
}
