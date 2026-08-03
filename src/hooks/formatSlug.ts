import type { FieldHook } from 'payload'

/** Marcas diacríticas combinantes (U+0300–U+036F), escritas con escapes
 *  para que la clase no dependa de caracteres invisibles en el archivo. */
const COMBINING_MARKS = new RegExp('[\\u0300-\\u036f]', 'g')

/**
 * Convierte un texto a slug seguro para URL.
 * Maneja acentos y ñ, que es lo que va a pasar seguro escribiendo en español.
 */
export const slugify = (input: string): string =>
  input
    .normalize('NFD')
    .replace(COMBINING_MARKS, '') // quita acentos: "Rex Alfa Ñ" -> "Rex Alfa N"
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
