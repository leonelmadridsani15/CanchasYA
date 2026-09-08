import { useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { TABLES, STORAGE_BUCKET, FORMATOS, fechaCorta } from '../../lib/constants'

export default function PartidoPasado({ reserva, alGuardar }) {
  const inputFoto = useRef(null)
  const resultado = reserva.resultado_partido
  const cancha = reserva.cancha ?? {}

  // Subida de foto al bucket de Storage (equivalente a subir_foto_partido)
  async function subirFoto(event) {
    const archivo = event.target.files?.[0]
    if (!archivo) return

    const extension = archivo.name.split('.').pop()
    const ruta = `partidos/${reserva.id}/${Date.now()}.${extension}`

    const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(ruta, archivo, {
      cacheControl: '3600',
      upsert: false,
    })
    if (uploadError) {
      alert('No pudimos subir la foto: ' + uploadError.message)
      return
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(ruta)
    await supabase.from(TABLES.fotoPartido).insert({
      resultado_id: resultado.id,
      foto_url: data.publicUrl,
    })
    alGuardar?.()
  }

  const colorGoles = (propias, rival) => (propias > rival ? 'text-emerald-600' : 'text-white')

  return (
    <article className="overflow-hidden rounded-2xl border border-emerald-900/50 bg-emerald-950 text-white shadow-lg transition-all hover:border-emerald-400">
      {/* Cabecera del marcador */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-900/50 bg-emerald-900/60 px-6 py-3.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {fechaCorta(reserva.fecha)} · {cancha.nombre}
        </span>
        <span className="rounded-full bg-emerald-900/60 px-3 py-1 text-[11px] font-bold text-slate-600">
          {FORMATOS[cancha.formato_juego] ?? cancha.formato_juego} · Finalizado
        </span>
      </div>

      {/* Marcador gigante de TV */}
      <div className="px-6 pb-4 pt-8">
        <div className="flex flex-col items-center justify-center gap-5 text-center sm:flex-row sm:gap-6">
          <div className="flex-1">
            <span className="font-display text-lg font-bold text-slate-600">{resultado.equipo_a}</span>
          </div>
          <div className="flex items-stretch gap-2">
            <span className="flex w-16 items-center justify-center rounded-xl bg-white px-3 py-2 ring-1 ring-inset ring-emerald-900/50">
              <b className={`font-display text-4xl font-extrabold ${colorGoles(resultado.goles_a, resultado.goles_b)}`}>
                {resultado.goles_a}
              </b>
            </span>
            <span className="flex items-center font-display text-3xl font-extrabold text-slate-500">–</span>
            <span className="flex w-16 items-center justify-center rounded-xl bg-white px-3 py-2 ring-1 ring-inset ring-emerald-900/50">
              <b className={`font-display text-4xl font-extrabold ${colorGoles(resultado.goles_b, resultado.goles_a)}`}>
                {resultado.goles_b}
              </b>
            </span>
          </div>
          <div className="flex-1">
            <span className="font-display text-lg font-bold text-slate-600">{resultado.equipo_b}</span>
          </div>
        </div>
      </div>

      {/* MVP */}
      {resultado.mvp_partido && (
        <div className="px-6 pb-2 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-semibold text-amber-400">
            ⭐ MVP: {resultado.mvp_partido}
          </span>
        </div>
      )}

      {/* Notas (pizarra) + fotos */}
      <div className="px-6 pb-6 pt-4">
        <div
          className="rounded-2xl bg-white/70 p-5 ring-1 ring-inset ring-emerald-900/50"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(148,163,184,.08) 1px, transparent 0)', backgroundSize: '18px 18px' }}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Notas del encuentro</p>
            {/* Botón de subida de foto */}
            <input ref={inputFoto} type="file" accept="image/*" className="hidden" onChange={subirFoto} />
            <button
              type="button"
              onClick={() => inputFoto.current?.click()}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-emerald-900/60 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-emerald-600 hover:text-emerald-600"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              Subir foto
            </button>
          </div>

          {resultado.notas && <p className="mt-3 text-sm leading-6 text-slate-600">{resultado.notas}</p>}

          {/* Miniaturas de fotos */}
          {(resultado.fotos ?? []).length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {resultado.fotos.map((foto) => (
                <img
                  key={foto.id}
                  src={foto.foto_url}
                  alt="Foto del partido"
                  className="aspect-square w-full rounded-xl object-cover ring-1 ring-emerald-900/30"
                  loading="lazy"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
