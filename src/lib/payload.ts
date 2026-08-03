import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Acceso a la base desde Server Components, sin salto HTTP.
 *
 * OJO: la Local API corre con `overrideAccess: true` por defecto, así que NO
 * aplica el control de acceso de `access/index.ts`. Cualquier consulta de
 * `posts` para el sitio público tiene que filtrar `_status: 'published'` a
 * mano, o los borradores se publican solos.
 */
export const getPayloadClient = async () => getPayload({ config })

/** Filtro obligatorio en todo lo que se muestre al público. */
export const onlyPublished = {
  _status: { equals: 'published' },
} as const
