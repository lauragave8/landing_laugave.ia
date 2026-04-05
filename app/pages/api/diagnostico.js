import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// ── SCORING ──────────────────────────────────────────────
function calcularScore(data) {
  let score = 0

  const puntajeMensajes = {
    'Menos de 10': 20,
    '10 - 30': 40,
    '30 - 60': 60,
    'Más de 60': 80,
  }
  score += puntajeMensajes[data.mensajes] ?? 0

  const puntajeSector = {
    'Manufactura / Producción': 15,
    'Salud / Clínicas': 20,
    'Retail / Comercio': 10,
    'Servicios profesionales': 10,
    'Construcción / Inmobiliaria': 10,
    'Educación': 8,
  }
  score += puntajeSector[data.sector] ?? 5

  return Math.min(score, 100)
}

function calcularNivel(score) {
  if (score < 40) return 'Crítico'
  if (score <= 70) return 'Moderado'
  return 'Alto'
}

// ── OPORTUNIDADES POR SECTOR ─────────────────────────────
const OPORTUNIDADES = {
  'Manufactura / Producción': [
    'Automatización de reportes de producción y control de calidad',
    'Agente de IA para cotizaciones y seguimiento de pedidos',
    'Dashboard de inventario y alertas de stock en tiempo real',
  ],
  'Salud / Clínicas': [
    'Agente de WhatsApp para agendamiento y recordatorios de citas',
    'Procesamiento automático de historias clínicas y documentos',
    'Analítica de ocupación, cancelaciones y métricas de atención',
  ],
  'Retail / Comercio': [
    'Agente de IA para atención al cliente y cotizaciones 24/7',
    'Automatización de pedidos y notificaciones de inventario bajo',
    'Dashboard de ventas y seguimiento de clientes recurrentes',
  ],
  'Servicios profesionales': [
    'Automatización de generación y envío de propuestas',
    'Agendamiento inteligente con recordatorios automáticos',
    'Procesamiento de contratos y documentos con IA',
  ],
  'Construcción / Inmobiliaria': [
    'Seguimiento automático de etapas de obra y alertas',
    'Gestión documental con extracción de datos de planos y contratos',
    'Agente de ventas para calificación de leads inmobiliarios',
  ],
  'Educación': [
    'Automatización del proceso de inscripciones y matrículas',
    'Agente de comunicación con padres y estudiantes por WhatsApp',
    'Reportes automáticos de asistencia y rendimiento académico',
  ],
}

function getOportunidades(sector) {
  return OPORTUNIDADES[sector] ?? [
    'Agente de IA para atención al cliente por WhatsApp',
    'Automatización de tareas repetitivas de tu equipo',
    'Dashboard de métricas clave de tu negocio',
  ]
}

// ── COSTO ESTIMADO ───────────────────────────────────────
function estimarCosto(data) {
  const costoHora = 25000 // COP por hora de trabajo manual
  const horasMes = {
    'Menos de 5 horas': 20,
    '5 - 15 horas': 40,
    '15 - 30 horas': 100,
    'Más de 30 horas': 180,
  }
  const horas = horasMes[data.horas] ?? 40
  return horas * costoHora
}

// ── EMAIL HTML ────────────────────────────────────────────
function buildEmailHtml({ nombre, score, nivel, oportunidades, costoEstimado }) {
  const color = nivel === 'Alto' ? '#1D9E75' : nivel === 'Moderado' ? '#EF9F27' : '#E05C5C'
  const waLink = `https://wa.me/${process.env.WHATSAPP_BUSINESS_NUMBER}?text=Hola+Laura%2C+quiero+el+diagn%C3%B3stico+completo`

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0E0E0C;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0E0E0C;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#161614;border-radius:16px;border:1px solid rgba(255,255,255,0.07);overflow:hidden;max-width:100%;">

        <!-- Header -->
        <tr><td style="background:#1D9E75;padding:28px 36px;">
          <p style="margin:0;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:#0E0E0C;opacity:.7;">Laura Gave · IA para tu empresa</p>
          <h1 style="margin:8px 0 0;font-size:22px;color:#0E0E0C;font-weight:700;">Tu diagnóstico de automatización</h1>
        </td></tr>

        <!-- Saludo -->
        <tr><td style="padding:32px 36px 0;">
          <p style="margin:0;font-size:15px;color:#F2F0EB;line-height:1.7;">Hola <strong>${nombre}</strong>,</p>
          <p style="margin:12px 0 0;font-size:14px;color:rgba(242,240,235,0.6);line-height:1.8;">Aquí está el resultado de tu diagnóstico de automatización. Analizamos tus respuestas y esto es lo que encontramos:</p>
        </td></tr>

        <!-- Score -->
        <tr><td style="padding:24px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#1E1E1C;border-radius:12px;border:1px solid rgba(255,255,255,0.07);">
            <tr><td style="padding:24px;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:rgba(242,240,235,0.4);">Tu score de automatización</p>
              <p style="margin:0;font-size:56px;font-weight:700;color:${color};line-height:1;">${score}</p>
              <p style="margin:4px 0 0;font-size:13px;font-weight:600;color:${color};">Nivel ${nivel}</p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Oportunidades -->
        <tr><td style="padding:0 36px 24px;">
          <p style="margin:0 0 14px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:rgba(242,240,235,0.4);">Tus 3 oportunidades más urgentes</p>
          ${oportunidades.map((op, i) => `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
            <tr>
              <td width="28" valign="top" style="padding-top:2px;">
                <div style="width:20px;height:20px;background:#1D9E75;border-radius:50%;text-align:center;line-height:20px;font-size:11px;font-weight:700;color:#0E0E0C;">${i + 1}</div>
              </td>
              <td style="padding-left:10px;font-size:13px;color:rgba(242,240,235,0.7);line-height:1.6;">${op}</td>
            </tr>
          </table>`).join('')}
        </td></tr>

        <!-- Costo estimado -->
        <tr><td style="padding:0 36px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(29,158,117,0.08);border:1px solid rgba(29,158,117,0.2);border-radius:10px;padding:20px;">
            <tr><td style="padding:20px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#5DCAA5;">Costo estimado del problema</p>
              <p style="margin:0;font-size:28px;font-weight:700;color:#5DCAA5;">$${costoEstimado.toLocaleString('es-CO')} COP/mes</p>
              <p style="margin:6px 0 0;font-size:12px;color:rgba(93,202,165,0.7);">en horas de trabajo manual que podrían automatizarse</p>
            </td></tr>
          </table>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:0 36px 36px;text-align:center;">
          <a href="${waLink}" style="display:inline-block;background:#1D9E75;color:#0E0E0C;font-size:15px;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;">
            Quiero el diagnóstico completo →
          </a>
          <p style="margin:16px 0 0;font-size:11px;color:rgba(242,240,235,0.26);line-height:1.6;">
            Laura Gave · Consultoría en IA y Automatización · Medellín, Colombia
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── NOTIFICACIÓN WHATSAPP (Cloud API) ────────────────────
async function notificarWhatsApp({ nombre, sector, score, nivel, email, whatsapp }) {
  const mensaje = `🔔 *Nuevo lead — Diagnóstico IA*\n\n👤 *Nombre:* ${nombre}\n🏢 *Sector:* ${sector}\n📧 *Email:* ${email}\n📱 *WhatsApp:* ${whatsapp || 'No indicado'}\n\n📊 *Score:* ${score}/100\n🎯 *Nivel:* ${nivel}\n\n_Responder en las próximas horas para máxima conversión._`

  await fetch(
    `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: process.env.WHATSAPP_RECIPIENT_NUMBER,
        type: 'text',
        text: { body: mensaje },
      }),
    }
  )
}

// ── HANDLER PRINCIPAL ─────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { nombre, email, whatsapp, sector, empleados, rol, mensajes, horas, ventas, herramientas, urgencia } = req.body

  if (!nombre || !email || !sector) {
    return res.status(400).json({ error: 'Faltan campos requeridos' })
  }

  const score = calcularScore({ mensajes, sector })
  const nivel = calcularNivel(score)
  const oportunidades = getOportunidades(sector)
  const costoEstimado = estimarCosto({ horas })

  const resultado = { score, nivel, top3_oportunidades: oportunidades, costo_estimado_mensual: costoEstimado }

  // Guardar lead en Supabase
  try {
    await supabase.from('leads').insert([{
      nombre, email, whatsapp, sector, empleados, rol,
      mensajes, horas, ventas, herramientas, urgencia,
      score, nivel,
      created_at: new Date().toISOString(),
    }])
  } catch (err) {
    console.error('Supabase insert error:', err)
  }

  // Enviar email al lead
  try {
    await resend.emails.send({
      from: 'Laura Gave <diagnostico@lauragave.com>',
      to: email,
      subject: 'Tu diagnóstico de automatización — Laura Gave',
      html: buildEmailHtml({ nombre, score, nivel, oportunidades, costoEstimado }),
    })
  } catch (err) {
    console.error('Resend error:', err)
  }

  // Notificar por WhatsApp
  try {
    await notificarWhatsApp({ nombre, sector, score, nivel, email, whatsapp })
  } catch (err) {
    console.error('WhatsApp notify error:', err)
  }

  return res.status(200).json(resultado)
}
