import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { nombre, contacto, tema } = req.body

  if (!nombre || !contacto) {
    return res.status(400).json({ error: 'Faltan campos requeridos' })
  }

  // Guardar en Supabase
  try {
    await supabase.from('contactos').insert([{
      nombre,
      contacto,
      tema: tema || '',
      created_at: new Date().toISOString(),
    }])
  } catch (err) {
    console.error('Supabase contacto error:', err)
  }

  // Notificar a Laura por email
  try {
    await resend.emails.send({
      from: 'Laura Gave <notificaciones@lauragave.com>',
      to: process.env.NOTIFICATION_EMAIL,
      subject: `Nuevo contacto directo — ${nombre}`,
      html: `
        <div style="font-family:sans-serif;background:#0E0E0C;color:#F2F0EB;padding:32px;border-radius:12px;">
          <h2 style="color:#5DCAA5;margin-top:0;">Nuevo mensaje de contacto</h2>
          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>Contacto:</strong> ${contacto}</p>
          <p><strong>Tema:</strong> ${tema || 'No especificado'}</p>
        </div>
      `,
    })
  } catch (err) {
    console.error('Resend contacto error:', err)
  }

  return res.status(200).json({ ok: true })
}
