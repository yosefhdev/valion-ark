import type { Access } from 'payload'

/**
 * Control de acceso simple: todos los usuarios del panel son administradores.
 * Solo hay dos estados que importan: autenticado o público.
 */

/** Cualquier usuario con sesión puede escribir */
export const authenticated: Access = ({ req: { user } }) => Boolean(user)

/**
 * El público solo lee contenido publicado.
 * Un usuario autenticado también ve borradores, para poder editarlos.
 */
export const publishedOrAuthenticated: Access = ({ req: { user } }) => {
  if (user) return true
  return {
    _status: { equals: 'published' },
  }
}

/** Lectura pública sin condiciones (categorías, imágenes) */
export const publicRead: Access = () => true
