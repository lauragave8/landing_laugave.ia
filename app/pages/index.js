import { useState, useEffect } from 'react'
import Head from 'next/head'
import {
  trackPageView, trackScrollDepth, trackCTAClick,
  trackDiagnosticoInicio, trackDiagnosticoCompletado,
  trackContactoAbierto, trackContactoEnviado, trackVSLPlay,
} from '../utils/analytics'

const TOTAL_STEPS = 9

const QUIZ_QUESTIONS = [
  {
    field: 'sector',
    question: '¿A qué sector pertenece tu empresa?',
    opts: [
      { label: '🏭 Manufactura / Producción', value: 'Manufactura / Producción' },
      { label: '🏥 Salud / Clínicas', value: 'Salud / Clínicas' },
      { label: '⚖️ Servicios profesionales', value: 'Servicios profesionales' },
      { label: '🏪 Retail / Comercio', value: 'Retail / Comercio' },
      { label: '🏗️ Construcción / Inmobiliaria', value: 'Construcción / Inmobiliaria' },
      { label: '🎓 Educación', value: 'Educación' },
      { label: '✦ Otro', value: 'Otro' },
    ],
  },
  {
    field: 'empleados',
    question: '¿Cuántas personas trabajan en tu empresa?',
    opts: [
      { label: '1 – 5 personas', value: '1-5 personas' },
      { label: '6 – 20 personas', value: '6-20 personas' },
      { label: '21 – 50 personas', value: '21-50 personas' },
      { label: 'Más de 50', value: 'Más de 50' },
    ],
  },
  {
    field: 'rol',
    question: '¿Cuál es tu rol en la empresa?',
    opts: [
      { label: 'Dueño / Gerente general', value: 'Dueño / Gerente general' },
      { label: 'Gerente administrativo', value: 'Gerente administrativo' },
      { label: 'Coordinador operativo', value: 'Coordinador operativo' },
      { label: 'Otro', value: 'Otro' },
    ],
  },
  {
    field: 'mensajes',
    question: '¿Cuántos mensajes o solicitudes reciben al día por WhatsApp o correo?',
    opts: [
      { label: 'Menos de 10', value: 'Menos de 10' },
      { label: '10 – 30', value: '10 - 30' },
      { label: '30 – 60', value: '30 - 60' },
      { label: 'Más de 60', value: 'Más de 60' },
    ],
  },
  {
    field: 'horas',
    question: '¿Cuántas horas a la semana dedican a tareas manuales y repetitivas?',
    opts: [
      { label: 'Menos de 5 horas', value: 'Menos de 5 horas' },
      { label: '5 – 15 horas', value: '5 - 15 horas' },
      { label: '15 – 30 horas', value: '15 - 30 horas' },
      { label: 'Más de 30 horas', value: 'Más de 30 horas' },
    ],
  },
  {
    field: 'ventas',
    question: '¿Cuántas ventas estimas que pierdes al mes por no responder a tiempo o no dar seguimiento?',
    opts: [
      { label: 'Ninguna', value: 'Ninguna' },
      { label: '1 – 3 ventas', value: '1 - 3 ventas' },
      { label: '3 – 10 ventas', value: '3 - 10 ventas' },
      { label: 'Más de 10 ventas', value: 'Más de 10 ventas' },
    ],
  },
  {
    field: 'herramientas',
    question: '¿Qué herramientas digitales usa tu empresa hoy?',
    singleCol: true,
    opts: [
      { label: 'Solo WhatsApp y Excel', value: 'Solo WhatsApp y Excel' },
      { label: 'Tenemos algún software básico', value: 'Tenemos algún software básico' },
      { label: 'Varias herramientas pero no conectadas', value: 'Varias herramientas pero no conectadas' },
      { label: 'Sistemas robustos pero quiero más automatización', value: 'Sistemas robustos pero quiero más automatización' },
    ],
  },
  {
    field: 'urgencia',
    question: 'Si encontraras la solución correcta, ¿en cuánto tiempo estarías listo para implementarla?',
    opts: [
      { label: 'Lo estoy evaluando', value: 'Lo estoy evaluando' },
      { label: 'En 1 – 3 meses', value: 'En 1 - 3 meses' },
      { label: 'En menos de un mes', value: 'En menos de un mes' },
      { label: 'Ahora mismo', value: 'Ahora mismo' },
    ],
  },
]

const SERVICIOS = [
  { num: '01', icon: '💬', color: '#1D9E75', name: 'Agente de IA en WhatsApp', desc: 'Responde preguntas, cotiza productos y califica leads automáticamente — 24/7, sin que tú intervengas en cada mensaje.' },
  { num: '02', icon: '📊', color: '#5DCAA5', name: 'Dashboard y analítica de datos', desc: 'Transforma tus datos dispersos en un tablero que se actualiza solo. Toma decisiones con información real, no con intuición.' },
  { num: '03', icon: '⚙️', color: '#1D9E75', name: 'Automatización de procesos', desc: 'Elimina las tareas repetitivas que consumen horas de tu equipo. Reportes, ingresos de datos, notificaciones — sin intervención humana.' },
  { num: '04', icon: '📄', color: '#5DCAA5', name: 'Procesamiento de documentos', desc: 'Facturas, contratos, formularios físicos — extraídos, clasificados y registrados automáticamente usando visión artificial.' },
  { num: '05', icon: '🏗️', color: '#1D9E75', name: 'App a la medida', desc: 'Para procesos muy específicos que ninguna herramienta genérica puede resolver. Desarrollo personalizado con IA integrada.' },
  { num: '06', icon: '🔍', color: '#5DCAA5', name: 'Diagnóstico con ROI', desc: 'Mapeo completo de tus procesos, cuantificación del costo actual y propuesta de las 3 oportunidades de automatización de mayor impacto.' },
]

const PROCESO = [
  { num: '01', label: 'Diagnóstico', title: 'Entiendo tu negocio en 30 minutos', desc: 'Hablamos por videollamada. Identifico qué procesos te cuestan más tiempo y dinero. Calculo el ROI potencial de cada solución. Sin compromiso.', time: 'Semana 1 · Gratis' },
  { num: '02', label: 'Propuesta', title: 'Precio fijo, alcance claro, fecha comprometida', desc: 'En 48 horas recibes la propuesta con el problema, la solución específica para tu empresa y el ROI estimado. Sin letra pequeña.', time: 'Semana 1 · 48h después del diagnóstico' },
  { num: '03', label: 'Implementación', title: 'Construyo en fases cortas — ves el progreso', desc: 'Demos cada semana. No esperas meses para ver algo funcionar. Tú ves el avance, puedes dar feedback y ajustar en cada paso.', time: 'Semanas 2–4' },
  { num: '04', label: 'Soporte continuo', title: 'Acompañamiento mensual para que siempre funcione', desc: 'Retainer mensual accesible: mantenimiento, ajustes, mejoras con datos reales. No desaparezco después de entregar.', time: 'Mes 2 en adelante · Desde $1.5M COP/mes' },
]

const FAQ = [
  { q: '¿Necesito saber de tecnología para trabajar contigo?', a: 'No. Mi trabajo es exactamente traducir el lenguaje técnico al lenguaje del negocio. Tú me dices qué problema tienes — yo entrego la solución funcionando. No necesitas entender cómo funciona por dentro.' },
  { q: '¿Cuánto cuesta implementar una solución?', a: 'Cada empresa es diferente, y el precio también lo es. No vendo soluciones genéricas — cada implementación parte de entender exactamente qué problema tiene tu empresa y qué impacto tendrá en tus cifras. El criterio siempre es el mismo: que recuperes la inversión en los primeros 3 meses. El diagnóstico inicial es el primer paso para tener ese número con certeza.' },
  { q: '¿Qué pasa si algo falla después de implementarlo?', a: 'El retainer mensual incluye mantenimiento y soporte. Si algo falla, lo resuelvo. No estás solo después de la entrega — esa es la diferencia entre contratar una consultora de verdad y pagar por un servicio de una sola vez.' },
  { q: '¿En cuánto tiempo se nota el impacto?', a: 'Las soluciones más simples (agente de WhatsApp, automatización de reportes) se notan desde la primera semana. Las más complejas en 3 a 6 semanas. Si en el primer mes no ves un cambio visible, algo está mal — y lo corrijo.' },
  { q: '¿Solo trabajas con empresas colombianas o también internacionales?', a: 'Trabajo con empresas de Colombia y de cualquier país de habla hispana. Todo el proceso es 100% remoto — diagnóstico, implementación y soporte se hacen por videollamada y comunicación digital. He trabajado con empresas en varias ciudades de Colombia y la metodología funciona igual sin importar la ubicación.' },
]

export default function Home() {
  // Nav
  const [navOpen, setNavOpen] = useState(false)

  // Quiz
  const [quizStep, setQuizStep] = useState(1)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizDirection, setQuizDirection] = useState('forward')
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizLoading, setQuizLoading] = useState(false)
  const [quizError, setQuizError] = useState('')
  const [diagIniciado, setDiagIniciado] = useState(false)

  // Step 9 fields
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')

  // Modal contacto
  const [modalOpen, setModalOpen] = useState(false)
  const [contactNombre, setContactNombre] = useState('')
  const [contactContacto, setContactContacto] = useState('')
  const [contactTema, setContactTema] = useState('')
  const [contactSent, setContactSent] = useState(false)
  const [contactLoading, setContactLoading] = useState(false)

  // FAQ
  const [faqOpen, setFaqOpen] = useState(null)

  // On mount: page view, fade-up observer, scroll depth
  useEffect(() => {
    trackPageView()

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) }
      })
    }, { threshold: 0.08 })
    document.querySelectorAll('.fade-up').forEach(el => obs.observe(el))

    const depths = new Set()
    const onScroll = () => {
      const total = document.body.scrollHeight - window.innerHeight
      if (total <= 0) return
      const pct = Math.round((window.scrollY / total) * 100)
      for (const d of [25, 50, 75, 100]) {
        if (pct >= d && !depths.has(d)) { depths.add(d); trackScrollDepth(d) }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { obs.disconnect(); window.removeEventListener('scroll', onScroll) }
  }, [])

  // Quiz actions
  function selectOpt(field, value) {
    if (!diagIniciado) { trackDiagnosticoInicio(); setDiagIniciado(true) }
    setQuizAnswers(prev => ({ ...prev, [field]: value }))
    setQuizDirection('forward')
    setTimeout(() => setQuizStep(prev => prev + 1), 280)
  }

  function goBack() {
    setQuizDirection('back')
    setQuizStep(prev => prev - 1)
  }

  async function handleQuizSubmit(e) {
    e.preventDefault()
    setQuizLoading(true)
    setQuizError('')
    trackDiagnosticoCompletado(quizAnswers.sector, quizAnswers.mensajes)
    try {
      const res = await fetch('/api/diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...quizAnswers, nombre, email, whatsapp }),
      })
      if (!res.ok) throw new Error()
      setQuizSubmitted(true)
    } catch {
      setQuizError('Hubo un error, intenta de nuevo.')
    } finally {
      setQuizLoading(false)
    }
  }

  // Modal contacto
  function openModal() { setModalOpen(true); trackContactoAbierto() }
  function closeModal() { setModalOpen(false) }

  async function handleContact(e) {
    e.preventDefault()
    setContactLoading(true)
    trackContactoEnviado()
    try {
      await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: contactNombre, contacto: contactContacto, tema: contactTema }),
      })
      setContactSent(true)
      setTimeout(closeModal, 2000)
    } catch {
      // fail silently
    } finally {
      setContactLoading(false)
    }
  }

  const progress = Math.round((quizStep / TOTAL_STEPS) * 100)
  const currentQ = QUIZ_QUESTIONS[quizStep - 1]

  return (
    <>
      <Head>
        <title>Laura Gave — IA para tu Empresa</title>
        <meta name="description" content="Consultoría en IA y automatización para PYMEs colombianas. Descubre cuánto pierde tu empresa hoy." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* NAV */}
      <nav>
        <a href="#" className="nav-logo">Laura<span>.</span>Gave</a>
        <div className={`nav-links${navOpen ? ' open' : ''}`}>
          <a href="#servicios" onClick={() => setNavOpen(false)}>Servicios</a>
          <a href="#proceso" onClick={() => setNavOpen(false)}>Proceso</a>
          <a
            href="#diagnostico"
            className="nav-cta"
            onClick={() => { setNavOpen(false); trackCTAClick('nav_diagnostico') }}
          >
            Diagnóstico gratis
          </a>
        </div>
        <button className="nav-mob" onClick={() => setNavOpen(o => !o)}>☰</button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg-grid" />
        <div className="hero-glow" />
        <div className="hero-glow2" />
        <div className="hero-inner">

          {/* Copy */}
          <div className="hero-copy">
            <div className="hero-eyebrow fade-up">Laura Gave · IA para tu empresa</div>
            <h1 className="hero-title fade-up" style={{ transitionDelay: '.1s' }}>
              Tu empresa pierde dinero<br />cada día que <em>no automatiza</em>
            </h1>
            <p className="hero-sub fade-up" style={{ transitionDelay: '.2s' }}>
              Descubre en 5 minutos qué procesos están frenando tu negocio y cuánto dinero pierdes cada mes por no tener IA trabajando para ti.
            </p>
            <div className="hero-actions fade-up" style={{ transitionDelay: '.3s' }}>
              <a href="#diagnostico" className="btn-primary" onClick={() => trackCTAClick('hero_diagnostico')}>
                Hacer el diagnóstico gratis <span>→</span>
              </a>
              <a href="#proceso" className="btn-secondary">
                Ver cómo funciona <span className="btn-arrow">→</span>
              </a>
            </div>
            <div className="hero-stats fade-up" style={{ transitionDelay: '.4s' }}>
              <div>
                <div className="hero-stat-num">3 sem</div>
                <div className="hero-stat-label">Primera entrega<br />en producción</div>
              </div>
              <div>
                <div className="hero-stat-num">−80%</div>
                <div className="hero-stat-label">Tareas manuales<br />eliminadas</div>
              </div>
              <div>
                <div className="hero-stat-num">&lt;$10</div>
                <div className="hero-stat-label">Costo operativo<br />mensual (USD)</div>
              </div>
            </div>
          </div>

          {/* VSL */}
          <div className="hero-vsl fade-up" style={{ transitionDelay: '.25s' }}>
            <div className="vsl-frame-hero" onClick={trackVSLPlay}>
              <div className="vsl-glow-ring" />
              <div className="vsl-inner">
                <div className="vsl-play">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M7 5L20 12L7 19V5Z" fill="#0E0E0C" />
                  </svg>
                </div>
                <div className="vsl-title">Mira cómo funciona</div>
                <div className="vsl-sub">Agrega tu video aquí cuando esté listo</div>
              </div>
              <div className="vsl-badge">⏱ ~8 min</div>
            </div>
          </div>

        </div>
      </section>

      {/* SERVICIOS */}
      <section className="section dark" id="servicios">
        <div className="sec-label fade-up">Lo que hago</div>
        <h2 className="sec-title fade-up">Soluciones de IA<br />para tu operación</h2>
        <p className="sec-sub fade-up">Implementaciones a la medida, no soluciones genéricas. Cada proyecto parte de entender exactamente qué le cuesta a tu empresa.</p>
        <div className="svc-grid fade-up">
          {SERVICIOS.map(s => (
            <div className="svc-card" key={s.num}>
              <div className="svc-accent" style={{ background: s.color }} />
              <span className="svc-icon">{s.icon}</span>
              <div className="svc-num">{s.num}</div>
              <div className="svc-name">{s.name}</div>
              <div className="svc-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTORES */}
      <section className="section" id="sectores">
        <div className="sec-label fade-up">Sectores</div>
        <h2 className="sec-title fade-up">Empresas que atiendo</h2>
        <p className="sec-sub fade-up">Foco en PYMEs colombianas entre 5 y 50 empleados — nacionales e internacionales.</p>
        <div className="sector-grid fade-up">
          <div className="sector-card nicho">
            <div className="sector-icon">🏥</div>
            <div className="sector-name">Salud y bienestar</div>
            <div className="sector-desc">Clínicas, consultorios, laboratorios. Agendamiento, recordatorios, analítica de citas.</div>
          </div>
          <div className="sector-card">
            <div className="sector-icon">🏭</div>
            <div className="sector-name">Manufactura</div>
            <div className="sector-desc">Fábricas medianas. Cotizaciones, control de pedidos, reportes de producción.</div>
          </div>
          <div className="sector-card">
            <div className="sector-icon">🏪</div>
            <div className="sector-name">Retail y comercio</div>
            <div className="sector-desc">Distribuidoras y tiendas. Atención al cliente, inventario, pedidos automatizados.</div>
          </div>
          <div className="sector-card">
            <div className="sector-icon">⚖️</div>
            <div className="sector-name">Servicios profesionales</div>
            <div className="sector-desc">Contadores, abogados, consultores. Documentos, agendamiento, reportes.</div>
          </div>
          <div className="sector-card">
            <div className="sector-icon">🏗️</div>
            <div className="sector-name">Construcción</div>
            <div className="sector-desc">Constructoras y arquitectura. Seguimiento de obra y gestión documental.</div>
          </div>
          <div className="sector-card">
            <div className="sector-icon">🎓</div>
            <div className="sector-name">Educación privada</div>
            <div className="sector-desc">Colegios e institutos. Inscripciones, seguimiento y comunicación.</div>
          </div>
        </div>
        <div className="nota blue fade-up" style={{ maxWidth: '680px', margin: '0 auto' }}>
          <strong>¿Tu sector no aparece aquí?</strong>
          Si tienes entre 5 y 50 empleados, recibes consultas por WhatsApp y manejas datos en Excel — probablemente puedo ayudarte. Haz el diagnóstico y lo sabemos con certeza.
        </div>
      </section>

      {/* PROCESO */}
      <section className="section dark" id="proceso">
        <div className="sec-label fade-up">El proceso</div>
        <h2 className="sec-title fade-up">De conversación<br />a resultados en 4 semanas</h2>
        <p className="sec-sub fade-up">Sin tecnicismos, sin grandes equipos, sin esperas de meses.</p>
        <div className="proceso-steps fade-up">
          {PROCESO.map(s => (
            <div className="proceso-step" key={s.num}>
              <div className="ps-num">{s.num}</div>
              <div className="ps-body">
                <div className="ps-label">{s.label}</div>
                <div className="ps-title">{s.title}</div>
                <div className="ps-desc">{s.desc}</div>
                <div className="ps-time">{s.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="nota green fade-up" style={{ maxWidth: '680px', margin: '32px auto 0' }}>
          <strong>Lo que nunca hago</strong>
          No vendo proyectos de 6 meses antes de mostrar nada. No propongo herramientas caras que no necesitas. Si al final del diagnóstico la IA no aplica a tu negocio ahora, te lo digo — y te digo qué sí aplicaría.
        </div>
      </section>

      {/* DIAGNÓSTICO QUIZ */}
      <section className="section dark" id="diagnostico">
        <div className="diag-wrap">
          <div className="sec-label fade-up">Diagnóstico gratuito</div>
          <h2 className="sec-title fade-up">Descubre cuánto pierde<br />tu empresa hoy</h2>
          <p className="sec-sub fade-up" style={{ marginBottom: 0 }}>
            Responde 8 preguntas rápidas y recibe un reporte personalizado con las oportunidades de automatización más urgentes para tu empresa.
          </p>

          <div className="quiz-wrap fade-up">
            {!quizSubmitted ? (
              <>
                {/* Barra de progreso */}
                <div className="quiz-progress-header">
                  <span className="quiz-step-label">Paso {quizStep} de {TOTAL_STEPS}</span>
                </div>
                <div className="quiz-progress-track">
                  <div className="quiz-progress-bar" style={{ width: `${progress}%` }} />
                </div>

                {/* Contenido del paso — key fuerza remount y re-anima */}
                <div
                  key={`${quizStep}-${quizDirection}`}
                  className={`quiz-step-animate${quizDirection === 'back' ? ' go-back' : ''}`}
                >
                  {quizStep < TOTAL_STEPS && currentQ ? (
                    <>
                      <div className="quiz-q">{currentQ.question}</div>
                      <div className={`quiz-opts${currentQ.singleCol ? ' single-col' : ''}`}>
                        {currentQ.opts.map(opt => (
                          <button
                            key={opt.value}
                            className={`quiz-opt${quizAnswers[currentQ.field] === opt.value ? ' selected' : ''}`}
                            onClick={() => selectOpt(currentQ.field, opt.value)}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    /* Paso 9 — formulario de contacto */
                    <>
                      <div className="quiz-q">Tu diagnóstico está casi listo</div>
                      <div className="quiz-hint">¿Dónde enviamos tu reporte personalizado?</div>
                      <form className="quiz-final-form" onSubmit={handleQuizSubmit}>
                        <div className="form-row" style={{ marginBottom: 0 }}>
                          <label className="form-label">Nombre completo</label>
                          <input
                            className="form-input" type="text" placeholder="Carlos Restrepo" required
                            value={nombre} onChange={e => setNombre(e.target.value)}
                          />
                        </div>
                        <div className="form-row" style={{ marginBottom: 0 }}>
                          <label className="form-label">Correo electrónico</label>
                          <input
                            className="form-input" type="email" placeholder="carlos@empresa.com" required
                            value={email} onChange={e => setEmail(e.target.value)}
                          />
                        </div>
                        <div className="form-row" style={{ marginBottom: 0 }}>
                          <label className="form-label">
                            WhatsApp{' '}
                            <span style={{ color: 'var(--hint)', fontWeight: 400 }}>(recomendado)</span>
                          </label>
                          <input
                            className="form-input" type="tel" placeholder="+57 300 000 0000"
                            value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                          />
                        </div>
                        {quizError && (
                          <div style={{ color: '#EF9F27', fontSize: 13, textAlign: 'center' }}>{quizError}</div>
                        )}
                        <button type="submit" className="form-submit" disabled={quizLoading}>
                          {quizLoading ? 'Procesando...' : 'Ver mi diagnóstico →'}
                        </button>
                        <div className="form-privacy">
                          Tu información es confidencial. Recibirás tu reporte en menos de 24 horas.
                        </div>
                      </form>
                    </>
                  )}
                </div>

                {/* Botón atrás */}
                {quizStep > 1 && (
                  <div className="quiz-nav">
                    <button className="quiz-back-btn" onClick={goBack}>← Atrás</button>
                  </div>
                )}
              </>
            ) : (
              /* Pantalla de confirmación */
              <div className="quiz-confirm">
                <div className="quiz-check-circle">
                  <svg className="quiz-check-svg" viewBox="0 0 24 24">
                    <polyline className="quiz-check-path" points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="quiz-confirm-title">Tu reporte está en camino</div>
                <div className="quiz-confirm-sub">
                  Revisa tu correo en los próximos minutos.<br />
                  Te contactaré personalmente para agendar tu diagnóstico completo.
                </div>
              </div>
            )}
          </div>

          <div className="contact-divider"><span>¿Prefieres simplemente hablar?</span></div>
          <button className="btn-contact-alt" onClick={openModal}>
            No deseo el diagnóstico, pero sí ponerme en contacto →
          </button>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <div className="sec-label fade-up">Preguntas frecuentes</div>
        <h2 className="sec-title fade-up">Resolvemos tus dudas</h2>
        <div className="faq-wrap fade-up">
          {FAQ.map((item, i) => (
            <div key={i} className={`faq-item${faqOpen === i ? ' open' : ''}`}>
              <div className="faq-q" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                {item.q}
                <span className="faq-icon">+</span>
              </div>
              <div className="faq-a">{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <a href="#" className="footer-logo">Laura<span>.</span>Gave</a>
          <div className="footer-links">
            <a href="#servicios">Servicios</a>
            <a href="#proceso">Proceso</a>
            <a href="#diagnostico">Diagnóstico</a>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--hint)' }}>Medellín, Colombia</div>
        </div>
        <div className="footer-copy">© 2026 Laura Gave · Consultoría en IA y Automatización para PYMEs</div>
      </footer>

      {/* MODAL CONTACTO */}
      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="modal-box">
            <button className="modal-close" onClick={closeModal}>✕</button>
            <div className="modal-title">Hablemos</div>
            <div className="modal-sub">Déjame tus datos y te contacto en menos de 24 horas para conocer más sobre tu empresa.</div>
            {!contactSent ? (
              <form onSubmit={handleContact}>
                <div className="form-row">
                  <label className="form-label">Nombre</label>
                  <input className="form-input" type="text" placeholder="Tu nombre" required value={contactNombre} onChange={e => setContactNombre(e.target.value)} />
                </div>
                <div className="form-row">
                  <label className="form-label">Correo o WhatsApp</label>
                  <input className="form-input" type="text" placeholder="correo@empresa.com o +57 300..." required value={contactContacto} onChange={e => setContactContacto(e.target.value)} />
                </div>
                <div className="form-row">
                  <label className="form-label">¿Sobre qué quieres hablar? (opcional)</label>
                  <input className="form-input" type="text" placeholder="Ej: tengo una clínica y quiero automatizar citas" value={contactTema} onChange={e => setContactTema(e.target.value)} />
                </div>
                <button type="submit" className="form-submit" disabled={contactLoading} style={{ marginTop: '8px' }}>
                  {contactLoading ? 'Enviando...' : 'Enviar y esperar contacto →'}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--teal-soft)', fontSize: 15 }}>
                ✓ Recibido — te contacto pronto
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
