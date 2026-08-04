import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { es } from '@payloadcms/translations/languages/es'
import { en } from '@payloadcms/translations/languages/en'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Posts } from './collections/Posts'
import { Branding } from './globals/Branding'
import { ServerInfo } from './globals/ServerInfo'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  // --- Panel de administración ---
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    // Payload inyecta `<style>@layer payload-default, payload;</style>` en el
    // <head> del panel, y en SSR ese nodo sale distinto que en cliente. Es
    // interno de Payload/Next, no de nuestro código, y la propia config
    // expone esta bandera para el caso. Solo afecta a las rutas del admin.
    suppressHydrationWarning: true,
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

  globals: [ServerInfo, Branding],

  editor: lexicalEditor(),

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

  // Requerido por Payload para generar los tamaños de imagen de Media
  sharp,

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
