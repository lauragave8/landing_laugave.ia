import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { tipo, datos, session_id, pagina, timestamp } = req.body

  if (!tipo || !session_id) {
    return res.status(400).json({ error: 'Faltan campos requeridos' })
  }

  try {
    await supabase.from('eventos').insert([{
      tipo,
      datos: datos ?? {},
      session_id,
      pagina: pagina ?? '/',
      timestamp: timestamp ?? new Date().toISOString(),
    }])
  } catch (err) {
    console.error('Supabase eventos error:', err)
    return res.status(500).json({ error: 'Error guardando evento' })
  }

  return res.status(200).json({ ok: true })
}
