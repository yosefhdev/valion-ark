import type { FieldHook } from 'payload'

/**
 * Convierte un texto a slug seguro para URL.
 * Maneja acentos y ñ, que es lo que va a pasar seguro escribiendo en español.
 */
export const slugify = (input: string): string =>
  input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos: "Rex Alfa Ñ" -> "Rex Alfa N"
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // todo lo que no sea alfanumérico -> guion
    .replace(/^-+|-+$/g, '') // sin guiones al inicio o final

/**
 * Hook de campo: si el editor no escribió un slug, lo genera desde `fallback`.
 * Si sí lo escribió, lo respeta pero lo normaliza.
 *
 * Así el editor solo escribe el título y el slug sale bien siempre.
 */
export const formatSlug =
  (fallback: string): FieldHook =>
  ({ data, operation, value }) => {
    if (typeof value === 'string' && value.length > 0) {
      return slugify(value)
    }

    if (operation === 'create' || operation === 'update') {
      const fallbackData = data?.[fallback]
      if (typeof fallbackData === 'string' && fallbackData.length > 0) {
        return slugify(fallbackData)
      }
    }

    return value
  }
