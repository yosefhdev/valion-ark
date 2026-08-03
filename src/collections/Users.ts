import type { CollectionConfig } from 'payload'
import { authenticated } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Usuario',
    plural: 'Usuarios',
  },
  auth: {
    // Bloquea la cuenta tras 5 intentos fallidos durante 10 minutos.
    // Mitigación básica de fuerza bruta en /admin.
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    tokenExpiration: 60 * 60 * 8, // 8 horas de sesión
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email'],
    group: 'Administración',
  },
  access: {
    // Importante: esta colección NUNCA debe tener lectura pública,
    // aun cuando todos los usuarios sean administradores.
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
    // `admin` (¿puede entrar al panel?) exige devolver boolean, no un Where,
    // así que no acepta el tipo `Access` de las otras operaciones.
    admin: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nombre',
    },
    // email y password los agrega Payload por `auth`
  ],
}
