function getSessionId() {
  if (typeof window === 'undefined') return null
  let sid = sessionStorage.getItem('lg_session_id')
  if (!sid) {
    sid = crypto.randomUUID()
    sessionStorage.setItem('lg_session_id', sid)
  }
  return sid
}

async function sendEvento(tipo, datos = {}) {
  try {
    await fetch('/api/eventos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo,
        datos,
        session_id: getSessionId(),
        pagina: window.location.pathname,
        timestamp: new Date().toISOString(),
      }),
    })
  } catch {
    // fail silently — never bloquear la página por analytics
  }
}

function fireGtag(event, params = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, params)
  }
}

export function trackPageView() {
  fireGtag('page_view')
  sendEvento('page_view')
}

export function trackScrollDepth(pct) {
  fireGtag('scroll_depth', { depth: pct })
  sendEvento('scroll_depth', { pct })
}

export function trackCTAClick(nombre) {
  fireGtag('cta_click', { button: nombre })
  sendEvento('cta_click', { nombre })
}

export function trackDiagnosticoInicio() {
  fireGtag('diagnostico_inicio')
  sendEvento('diagnostico_inicio')
}

export function trackDiagnosticoCompletado(sector, mensajes) {
  fireGtag('diagnostico_completado', { sector, mensajes })
  sendEvento('diagnostico_completado', { sector, mensajes })
}

export function trackContactoAbierto() {
  fireGtag('contacto_abierto')
  sendEvento('contacto_abierto')
}

export function trackContactoEnviado() {
  fireGtag('contacto_enviado')
  sendEvento('contacto_enviado')
}

export function trackVSLPlay() {
  fireGtag('vsl_play')
  sendEvento('vsl_play')
}
