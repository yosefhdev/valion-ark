import type { GlobalConfig } from 'payload'
import { authenticated, publicRead } from '../access'

/**
 * Identidad visual editable: logos, favicon, fondo e imagen al compartir.
 *
 * Va aparte de `ServerInfo` porque son cosas distintas: uno son datos del
 * servidor (IP, rates), este es la marca del sitio.
 *
 * La lectura es pública a propósito: la pantalla de login del panel pinta el
 * logo antes de que exista sesión, así que si esto exigiera autenticación el
 * propio /admin se quedaría sin logo.
 */
export const Branding: GlobalConfig = {
  slug: 'branding',
  label: 'Marca y apariencia',
  admin: {
    group: 'Configuración',
    description: 'Logos, icono de la pestaña, fondo de la portada e imagen al compartir.',
  },
  access: {
    read: publicRead,
    update: authenticated,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Sitio',
          description: 'Lo que ve un visitante.',
          fields: [
            {
              name: 'siteLogo',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo de la barra superior',
              admin: {
                description:
                  'Reemplaza el nombre escrito. Se muestra a 32 px de alto, así que conviene un PNG con fondo transparente y bastante ancho. Si lo dejas vacío se usa el nombre del servidor.',
              },
            },
            {
              name: 'favicon',
              type: 'upload',
              relationTo: 'media',
              label: 'Icono de la pestaña',
              admin: {
                description:
                  'El iconito del navegador. Usa un PNG cuadrado de 512×512: si no es cuadrado, el navegador lo deforma.',
              },
            },
          ],
        },

        {
          label: 'Panel',
          description: 'Lo que ve tu equipo al entrar a /admin.',
          fields: [
            {
              name: 'adminLogo',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo del login',
              admin: {
                description: 'Aparece grande sobre el formulario de acceso.',
              },
            },
            {
              name: 'adminIcon',
              type: 'upload',
              relationTo: 'media',
              label: 'Icono del panel',
              admin: {
                description: 'El pequeño de la esquina, junto al menú. Cuadrado.',
              },
            },
          ],
        },

        {
          label: 'Portada',
          fields: [
            {
              name: 'heroBackground',
              type: 'upload',
              relationTo: 'media',
              label: 'Fondo de la cabecera',
              admin: {
                description:
                  'Una captura del servidor funciona bien. Apaisada y de al menos 1920 px de ancho.',
              },
            },
            {
              name: 'heroOverlay',
              type: 'number',
              label: 'Oscurecer el fondo (%)',
              defaultValue: 70,
              min: 0,
              max: 100,
              admin: {
                description:
                  'Velo negro sobre la imagen. Cuanto más clara sea la captura, más alto tiene que ir o el titular deja de leerse. Por debajo de 50 revisa que el texto siga siendo legible.',
                condition: (data) => Boolean(data?.heroBackground),
              },
            },
          ],
        },

        {
          label: 'Compartir',
          fields: [
            {
              name: 'ogImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Imagen al compartir el link',
              admin: {
                description:
                  'La que sale al pegar el link en Discord o WhatsApp. Se recorta a 1200×630. Los artículos con portada usan la suya; esta es para el resto del sitio.',
              },
            },
          ],
        },
      ],
    },
  ],
}
