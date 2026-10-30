# Pestañas & Cejas — página oficial

La página oficial del negocio de cejas y pestañas, con reserva por
WhatsApp. Nació clonando mi plantilla de landing
(`Gothan15/plantilla-landing`): mismo código, y todo lo de este
negocio — nombre, WhatsApp, servicios y precios — vive en un solo
archivo, `src/config/negocio.ts`.

**WhatsApp / citas: 63 28 72 39** · Pago en CUP, al cambio del día.

## Precios: en USD en el código, en CUP en la página

La dueña cobra en CUP «al cambio», y su lista oficial está en USD
(guardada en `docs/precios-oficiales-2026-10-29.jpg`). Como el CUP
se mueve mucho y el USD no, la lista **no se guarda en CUP**:

| Servicio | USD | CUP aprox. (a 860) |
|---|---|---|
| Desmaquillar | 0.50 | 430 |
| Pestañas de punto | 3 | 2 580 |
| Retoque | 0.90–2 | 770–1 720 |
| Retiro | 0.70 | 600 |
| Depilación de cejas | 0.90 | 770 |
| Tinte | 0.70 | 600 |
| Laminado | 2 | 1 720 |
| Cejas 4K | 3 | 2 580 |

### ¿Cómo se actualiza sola la tasa? ¿Scraping a elTOQUE?

Se podría scrapear la página de tasas de elTOQUE, pero **no lo
hago así**, por tres motivos: el HTML puede cambiar cualquier día
y romper la página en silencio, puede chocar con su protección
anti-bots, y el propio elTOQUE ofrece una **API oficial de tasas**
(`tasas.eltoque.com`) pensada para esto y explica que el scraping
indiscriminado puede afectar a su sitio.

Lo que hace esta página (`src/lib/tasa.ts` + `src/lib/precios.ts`):

1. Los precios viven **solo en USD** en `src/config/negocio.ts`.
2. En el **servidor** (nunca en el navegador, para no exponer el
   token), Next pide la tasa USD/CUP a la API de elTOQUE con el
   token de `ELTOQUE_API_TOKEN` (ver `.env.example`).
3. La respuesta se cachea **una hora** (`cacheLife('hours')`): no
   se pide la tasa en cada visita, solo unas veces al día.
4. Cada precio se convierte (`USD × tasa`) y se redondea a la
   decena de CUP más cercana: 0.90 USD a 860 son 774 → **770 CUP**.
5. Si no hay token o la API falla, se usa la **tasa de respaldo**
   del config (860 CUP, 29-oct-2026) y la página lo dice. Nunca
   se queda sin precios ni se rompe.

Para activar la tasa automática en producción: crea el token en
la API de elTOQUE y pon `ELTOQUE_API_TOKEN` en Vercel
(Settings → Environment Variables). Sin token, la página funciona
igual, con la tasa de respaldo.

## Cómo funciona la reserva

1. La clienta toca «Reservar» en un servicio.
2. El formulario ya trae ese servicio elegido; pone nombre, elige
   día y toca una hora de la rejilla de turnos.
3. Los turnos ya ocupados salen oscuros y no se pueden tocar
   (ver la sección del panel, abajo).
4. Se abre WhatsApp (63 28 72 39) con el mensaje armado y el
   negocio confirma el turno en el chat.

## Horarios ocupados y el panel de la dueña

Esto lo pidió la dueña y es la «versión ligera» a propósito: la
reserva sigue siendo por WhatsApp (así trabaja ella), pero la
página dejó de ser ciega. Antes cualquiera podía pedir un día y
una hora que ya estaban cogidos, porque la web no guardaba nada.

Ahora hay una base de datos mínima con **solo los horarios
ocupados** (fecha + hora + una nota opcional; ningún dato de
clientas vive aquí):

- **`GET /api/disponibilidad`** (público): devuelve los fecha/hora
  ocupados de un rango. El formulario pinta esos turnos oscuros,
  tachados y sin poder elegirse; si ese día no se trabaja, lo
  avisa y no muestra rejilla. Si la consulta falla, se ofrecen
  todos los turnos y la clienta confirma el suyo por WhatsApp,
  como antes: la página nunca se rompe por esto.
- **`/panel`** (privado): la dueña entra con su clave, elige el
  día y toca las horas para ocuparlas o liberarlas, con una nota
  opcional (por ejemplo el nombre de la clienta, para acordarse).
  Abajo ve la lista de próximos horarios ocupados y puede
  quitarlos. Está pensado para el móvil y sin tecnicismos.

Variables que necesita (ver `.env.example`):

- `DATABASE_URL`: el PostgreSQL donde vive la tabla de bloqueos.
- `PANEL_CLAVE`: la clave con la que entra la dueña. La sesión va
  en una cookie firmada (jose) que dura 7 días; si se cambia la
  clave, las sesiones abiertas dejan de valer.

**El horario es provisional.** Los días y horas que se ofrecen
salen de `negocio.agenda` en `src/config/negocio.ts` (hoy: lunes
a sábado, 09:00–18:00, turnos de 1 hora) y son un punto de
partida: la dueña aún no pasa su horario real, y cuando lo haga
se cambia solo ahí, sin tocar más código.

**Al desplegar** hace falta un PostgreSQL: vale uno gratis de
[Neon](https://neon.tech). Se pone su cadena en `DATABASE_URL`
(en Vercel, como variable de entorno) y se crea la tabla una vez
con `npx prisma db push` (o `migrate` si algún día hace falta
historial de cambios). Sin base de datos, el resto de la página
funciona igual; solo la disponibilidad no se puede comprobar.

## Correrla

```bash
npm install
cp .env.example .env.local   # pon ELTOQUE_API_TOKEN, DATABASE_URL y PANEL_CLAVE
npx prisma db push           # crea la tabla de horarios ocupados
npm run dev                  # http://localhost:3000
npm run build
```

Stack: Next.js 16 + TypeScript + Tailwind CSS 4 + Prisma 6 /
PostgreSQL (solo para los horarios ocupados del panel).

## Fotos

- `public/fondos/`: fotos de **ambiente** (genéricas, marcadas
  como tal). Ilustran el servicio, no son trabajos de ella.
- `public/fotos/` y la galería: **solo trabajos reales** de la
  dueña. Sin fotos todavía, el marco queda «por subir».

## Lo que falta

- [ ] Zona/municipio y horario exactos (en el config salen «por confirmar»; la agenda usa un horario provisional en `negocio.agenda` hasta que la dueña pase el suyo)
- [ ] Duración de cada servicio
- [ ] Fotos reales para la galería
- [ ] Token de elTOQUE en Vercel para la tasa automática
- [ ] Deploy en Vercel y enlace en su WhatsApp Business / redes

— Gothan, a partir de su plantilla de landing
