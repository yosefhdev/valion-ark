import React from 'react'

/**
 * Wordmark que Payload muestra en la pantalla de login del panel.
 * Componente de servidor normal: sin hooks, sin 'use client'.
 */
export default function Logo() {
  return (
    <div
      style={{
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        fontSize: '2rem',
        fontWeight: 800,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        lineHeight: 1,
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
