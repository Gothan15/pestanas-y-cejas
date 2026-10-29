import Image from "next/image";
import { negocio } from "@/config/negocio";
import Servicios from "@/components/Servicios";
import ReservaForm from "@/components/ReservaForm";
import Reveal from "@/components/Reveal";
import { whatsappConfigurado } from "@/lib/whatsapp";
import { obtenerTasaUSD } from "@/lib/tasa";

const S = negocio.secciones;

function CabeceraSeccion({
  indice,
  titulo,
  nota,
}: {
  indice: string;
  titulo: string;
  nota?: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b-2 border-tinta pb-4">
      <div>
        <p className="text-[11px] font-bold tracking-[0.24em] text-acento uppercase">{indice}</p>
        <h2 className="font-display mt-1 text-4xl sm:text-5xl">{titulo}</h2>
      </div>
      {nota ? <p className="max-w-xs text-sm leading-6 text-tinta/60">{nota}</p> : null}
    </div>
  );
}

export default async function Home() {
  const t = negocio.heroTitulo;
  const tasa = await obtenerTasaUSD();
  return (
    <main className="bg-papel text-tinta">
      {/* Barra superior */}
      <header className="sticky top-0 z-40 border-b border-tinta/15 bg-papel/92 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <a href="#" className="font-display text-xl leading-none">
            {negocio.nombre}
            <span className="mt-0.5 block font-sans text-[10px] font-bold tracking-[0.22em] text-tinta/55 uppercase">
              {negocio.rubro}
            </span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
            <a className="hover:text-acento" href="#servicios">Servicios</a>
            <a className="hover:text-acento" href="#galeria">Trabajos</a>
            <a className="hover:text-acento" href="#como">Cómo reservar</a>
          </nav>
          <a
            href="#reservar"
            className="bg-tinta px-5 py-2.5 text-sm font-bold text-papel transition hover:bg-acento"
          >
            Reservar
          </a>
        </div>
      </header>

      {/* HERO editorial asimétrico */}
      {S.hero ? (
        <section className="grano overflow-hidden">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 pt-10 pb-16 sm:px-8 lg:grid-cols-12 lg:pt-16 lg:pb-20">
            <div className="lg:col-span-7">
              <p className="anim-entra flex items-center gap-3 text-[11px] font-bold tracking-[0.24em] text-acento uppercase">
                <span className="inline-block h-px w-10 bg-acento" aria-hidden />
                {negocio.rubro} · {negocio.zona}
              </p>
              <h1 className="anim-entra-1 font-display mt-5 text-[clamp(3.1rem,9vw,6.4rem)] leading-[0.94]">
                {t.antes}
                <br />
                <em className="text-acento italic">{t.italica}</em> {t.despues}
              </h1>
              <p className="anim-entra-2 mt-6 max-w-md text-base leading-7 text-tinta/70">{negocio.descripcion}</p>
              <div className="anim-entra-2 mt-8 flex flex-wrap items-center gap-5">
                <a
                  href="#reservar"
                  className="bg-tinta px-7 py-3.5 font-bold text-papel shadow-[6px_6px_0_0_var(--acento)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0_0_var(--acento)]"
                >
                  Reservar mi turno
                </a>
                <a href="#servicios" className="font-semibold underline decoration-2 underline-offset-4 hover:text-acento">
                  Ver servicios y precios ↓
                </a>
              </div>
              <dl className="anim-entra-2 mt-12 grid grid-cols-2 gap-4 border-t border-linea pt-5 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-[11px] font-bold tracking-[0.18em] text-tinta/50 uppercase">Zona</dt>
                  <dd className="mt-1 font-semibold">{negocio.zona}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold tracking-[0.18em] text-tinta/50 uppercase">Horario</dt>
                  <dd className="mt-1 font-semibold">{negocio.horario}</dd>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <dt className="text-[11px] font-bold tracking-[0.18em] text-tinta/50 uppercase">Reserva</dt>
                  <dd className="mt-1 font-semibold">Por WhatsApp, en el momento</dd>
                </div>
              </dl>
            </div>

            <div className="lg:col-span-5">
              <div className="relative">
              <figure className="anim-entra-1 rotate-[-1.2deg] border border-tinta/25 bg-[#fffdf6] p-2 shadow-[14px_14px_0_0_rgba(33,24,18,0.12)]">
                <Image
                  src={negocio.fondos.hero}
                  alt="El estudio en una mañana de trabajo"
                  width={1200}
                  height={900}
                  className="aspect-[4/3] w-full object-cover"
                  priority
                />
                <figcaption className="flex items-baseline justify-between px-1 pt-2 pb-1 text-xs text-tinta/60">
                  <span>El estudio, trabajando</span>
                  <span className="font-display italic">foto de ambiente</span>
                </figcaption>
              </figure>
              <figure className="absolute -bottom-12 -left-3 w-40 rotate-[2.5deg] border border-tinta/25 bg-[#fffdf6] p-1.5 shadow-[10px_10px_0_0_rgba(33,24,18,0.12)] sm:-left-8 sm:w-52">
                <Image
                  src={negocio.fondos.detalle}
                  alt="Detalle de una aplicación de pestañas"
                  width={800}
                  height={800}
                  className="aspect-square w-full object-cover"
                />
                <figcaption className="px-1 pt-1.5 pb-0.5 text-[11px] text-tinta/60">
                  Detalle · diseño de cejas
                </figcaption>
              </figure>
              </div>
              <p className="font-display mt-20 rotate-[-3deg] text-lg text-acento italic sm:text-xl">
                ✳ {negocio.notaHero}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* Marquesina */}
      {S.cinta ? (
        <div className="overflow-hidden bg-tinta py-3 text-papel" aria-hidden>
          <div className="anim-cinta flex w-max items-center gap-8 whitespace-nowrap">
            {[...negocio.cinta, ...negocio.cinta, ...negocio.cinta, ...negocio.cinta].map((txt, i) => (
              <span key={i} className="flex items-center gap-8 text-sm font-bold tracking-[0.22em] uppercase">
                {txt} <span className="text-dorado">✦</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* SERVICIOS — índice editorial */}
      {S.servicios ? (
        <section id="servicios" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 sm:px-8 lg:py-24">
          <CabeceraSeccion
            indice="01 — Servicios"
            titulo="Servicios y precios"
            nota="Sin tarjetas iguales ni letra pequeña: el servicio, lo que dura y lo que cuesta. Toca «Reservar» y el formulario ya sale con ese servicio elegido."
          />
          <Reveal>
            <Servicios tasa={tasa} />
          </Reveal>
        </section>
      ) : null}

      {/* GALERÍA — tira de fotos */}
      {S.galeria ? (
        <section id="galeria" className="scroll-mt-24 border-y border-linea bg-crema/50 py-16 lg:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <CabeceraSeccion
              indice="02 — Trabajos"
              titulo="Trabajos reales"
              nota="Esta tira es solo para fotos reales del negocio. Mientras no estén, los marcos se quedan esperando: aquí no se pone el trabajo de otra persona."
            />
          </div>
          <Reveal>
            <div className="tira flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2 sm:px-8 lg:justify-center">
              {negocio.galeria.map((f, i) => (
                <figure key={i} className="w-[230px] shrink-0 snap-start sm:w-[260px]">
                  <div
                    className={`relative flex items-center justify-center overflow-hidden border border-tinta/25 bg-crema ${
                      f.formato === "vertical" ? "aspect-[3/4]" : "aspect-[4/3] mt-8"
                    }`}
                    style={
                      f.src
                        ? undefined
                        : {
                            backgroundImage:
                              "repeating-linear-gradient(45deg, rgba(33,24,18,0.05) 0 10px, transparent 10px 20px)",
                          }
                    }
                  >
                    {f.src ? (
                      <Image src={f.src} alt={f.alt} fill className="object-cover" sizes="260px" />
                    ) : (
                      <span className="font-display px-6 text-center text-lg text-tinta/45 italic">
                        foto real
                        <br />
                        por subir
                      </span>
                    )}
                    <span className="font-display absolute top-2 left-3 text-sm text-tinta/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <figcaption className="pt-2 text-sm font-semibold">
                    {f.pie}
                    <span className="block text-xs font-normal text-tinta/55">{f.alt}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Reveal>
        </section>
      ) : null}

      {/* CÓMO RESERVAR */}
      {S.comoReservar ? (
        <section id="como" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 sm:px-8 lg:py-24">
          <CabeceraSeccion indice="03 — Cómo reservar" titulo="Reservar es así de corto" />
          <Reveal>
            <div className="grid border-y border-linea sm:grid-cols-3 sm:divide-x sm:divide-linea">
              {negocio.pasos.map((p, i) => (
                <div key={p.titulo} className="border-t border-linea p-6 first:border-t-0 sm:border-t-0 sm:p-8">
                  <span className="font-display text-6xl text-dorado">{i + 1}</span>
                  <h3 className="font-display mt-3 text-2xl">{p.titulo}</h3>
                  <p className="mt-2 text-sm leading-6 text-tinta/65">{p.texto}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>
      ) : null}

      {/* FRASE */}
      {S.frase ? (
        <section className="px-5 pb-20 sm:px-8">
          <Reveal>
            <blockquote className="mx-auto max-w-3xl text-center">
              <p className="font-display text-3xl leading-snug italic sm:text-[2.6rem] sm:leading-[1.25]">
                «{negocio.frase}»
              </p>
              <cite className="mt-5 block text-xs font-bold tracking-[0.22em] text-tinta/55 uppercase not-italic">
                — {negocio.fraseAutor}
              </cite>
            </blockquote>
          </Reveal>
        </section>
      ) : null}

      {/* RESERVAR */}
      {S.reservar ? (
        <section id="reservar" className="grano scroll-mt-24 border-t border-linea">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:py-24">
            <div className="lg:col-span-5">
              <p className="text-[11px] font-bold tracking-[0.24em] text-acento uppercase">04 — Reserva</p>
              <h2 className="font-display mt-1 text-4xl sm:text-5xl">Aparta tu turno</h2>
              <p className="mt-4 max-w-sm leading-7 text-tinta/70">
                Rellena la ficha y se abre WhatsApp con el mensaje ya escrito. El negocio te confirma el turno en el
                mismo chat.
              </p>
              <dl className="mt-8 text-sm">
                <div className="flex justify-between gap-6 border-t border-linea py-3">
                  <dt className="font-bold tracking-[0.14em] text-tinta/55 uppercase">Zona</dt>
                  <dd className="text-right font-semibold">{negocio.zona}</dd>
                </div>
                <div className="flex justify-between gap-6 border-t border-linea py-3">
                  <dt className="font-bold tracking-[0.14em] text-tinta/55 uppercase">Horario</dt>
                  <dd className="text-right font-semibold">{negocio.horario}</dd>
                </div>
                <div className="flex justify-between gap-6 border-t border-b border-linea py-3">
                  <dt className="font-bold tracking-[0.14em] text-tinta/55 uppercase">WhatsApp</dt>
                  <dd className="text-right font-semibold">
                    {whatsappConfigurado() ? "63 28 72 39" : "Por confirmar"}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="lg:col-span-7">
              <Reveal>
                <ReservaForm />
              </Reveal>
            </div>
          </div>
        </section>
      ) : null}

      {/* RETOQUES */}
      {S.retoques ? (
        <section className="bg-tinta text-papel">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 sm:px-8">
            {negocio.retoques.map((r) => (
              <div key={r.servicio}>
                <p className="text-[11px] font-bold tracking-[0.24em] text-papel/60 uppercase">
                  Retoque de {r.servicio.toLowerCase()}
                </p>
                <p className="font-display mt-2 text-5xl text-[#d9a441] sm:text-6xl">{r.cada}</p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-papel/65">
                  Aparta el retoque al salir de tu cita y no dejas que el trabajo se venza.
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* PIE */}
      <footer className="bg-tinta text-papel">
        <div className="mx-auto max-w-6xl border-t border-papel/15 px-5 py-12 sm:px-8">
          <p className="font-display text-4xl sm:text-6xl">{negocio.nombre}</p>
          <div className="mt-6 flex flex-wrap gap-x-10 gap-y-2 text-sm text-papel/70">
            <span>{negocio.rubro}</span>
            <span>{negocio.zona}</span>
            <span>{negocio.horario}</span>
            {negocio.redes.instagram ? (
              <a className="underline underline-offset-4" href={negocio.redes.instagram}>
                Instagram
              </a>
            ) : null}
          </div>
          <p className="mt-10 text-xs leading-5 text-papel/45">
            {negocio.moneda.notaPago} Los precios en CUP de esta página se calculan solos desde la lista en USD
            con la tasa del día; la lista oficial está en src/config/negocio.ts.
          </p>
        </div>
      </footer>

      {/* Botón fijo de reserva en móvil */}
      <a
        href="#reservar"
        className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full border border-papel/40 bg-tinta px-7 py-3 font-bold whitespace-nowrap text-papel shadow-[0_10px_30px_rgba(33,24,18,0.35)] sm:hidden"
      >
        Reservar cita
      </a>
      <div className="h-16 sm:hidden" aria-hidden />
    </main>
  );
}
