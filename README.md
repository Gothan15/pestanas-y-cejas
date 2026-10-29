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
2. El formulario ya trae ese servicio elegido; pone nombre, día y hora.
3. Se abre WhatsApp (63 28 72 39) con el mensaje armado y el
   negocio confirma el turno en el chat.

## Correrla

```bash
npm install
cp .env.example .env.local   # y pon tu ELTOQUE_API_TOKEN
npm run dev                  # http://localhost:3000
npm run build
```

Stack: Next.js 16 + TypeScript + Tailwind CSS 4. Sin base de
datos: es una página, no un sistema.

## Fotos

- `public/fondos/`: fotos de **ambiente** (genéricas, marcadas
  como tal). Ilustran el servicio, no son trabajos de ella.
- `public/fotos/` y la galería: **solo trabajos reales** de la
  dueña. Sin fotos todavía, el marco queda «por subir».

## Lo que falta

- [ ] Zona/municipio y horario exactos (en el config salen «por confirmar»)
- [ ] Duración de cada servicio
- [ ] Fotos reales para la galería
- [ ] Token de elTOQUE en Vercel para la tasa automática
- [ ] Deploy en Vercel y enlace en su WhatsApp Business / redes

— Gothan, a partir de su plantilla de landing
