import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

// Sesión del panel privado (/panel): una sola clave compartida
// (la de la dueña), guardada en la variable de entorno
// PANEL_CLAVE. Al entrar, se entrega una cookie httpOnly con un
// JWT firmado con una clave derivada de PANEL_CLAVE: si la
// dueña cambia su clave, las sesiones viejas dejan de valer.

export const COOKIE_PANEL = "panel_sesion";
const DURACION_SESION = "7d";

/** La clave del panel, o null si el panel no está configurado. */
export function clavePanel(): string | null {
  const clave = process.env.PANEL_CLAVE;
  return clave && clave.length > 0 ? clave : null;
}

async function claveFirma(): Promise<Uint8Array> {
  const clave = clavePanel();
  if (!clave) throw new Error("PANEL_CLAVE no está configurada");
  // Derivamos una clave de firma distinta de la clave de acceso
  // en sí, para no usar la misma cadena con dos fines.
  const datos = new TextEncoder().encode(`pestanas-panel:${clave}`);
  const hash = await crypto.subtle.digest("SHA-256", datos);
  return new Uint8Array(hash);
}

/** Crea el token de sesión (válido 7 días). */
export async function crearTokenSesion(): Promise<string> {
  return new SignJWT({ panel: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(DURACION_SESION)
    .sign(await claveFirma());
}

/** ¿El token de sesión es válido y sigue vigente? */
export async function tokenSesionValido(token: string | undefined): Promise<boolean> {
  if (!token || !clavePanel()) return false;
  try {
    const { payload } = await jwtVerify(token, await claveFirma(), {
      algorithms: ["HS256"],
    });
    return payload.panel === true;
  } catch {
    return false;
  }
}

/** ¿La petición actual trae una sesión de panel válida? */
export async function haySesionPanel(): Promise<boolean> {
  const store = await cookies();
  return tokenSesionValido(store.get(COOKIE_PANEL)?.value);
}

/** Guarda la cookie de sesión en la respuesta (login correcto). */
export async function guardarCookieSesion(token: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_PANEL, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

/** Borra la cookie de sesión (salir del panel). */
export async function borrarCookieSesion(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_PANEL);
}
