import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import { es } from '@payloadcms/translations/languages/es'
import { en } from '@payloadcms/translations/languages/en'
import path from 'path'
import { fileURLToPath } from 'url'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Posts } from './collections/Posts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  // --- Panel de administración ---
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— Isla Perdida',
      description: 'Panel de contenido de la wiki del servidor',
    },
    components: {
      // Componentes React normales que tú creas, para poner tu logo
      // en el login y en el header del panel.
      graphics: {
        Logo: '@/components/admin/Logo',
        Icon: '@/components/admin/Icon',
      },
    },
  },

  // --- Idioma del panel ---
  i18n: {
    supportedLanguages: { es, en },
    fallbackLanguage: 'es',
  },

  collections: [Posts, Categories, Media, Users],

  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  // --- Base de datos: Postgres, variable que Railway inyecta ---
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),

  // --- Storage de imágenes: Cloudflare R2 (S3-compatible) ---
  plugins: [
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.R2_BUCKET as string,
      config: {
        endpoint: process.env.R2_ENDPOINT,
        region: 'auto', // R2 siempre usa 'auto'
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
        },
        forcePathStyle: true, // requerido para R2
      },
    }),
  ],

  // Limita el tamaño de subida para no llenar el bucket por accidente
  upload: {
    limits: { fileSize: 5_000_000 }, // 5 MB
  },
})
