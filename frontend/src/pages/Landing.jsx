import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Vote, IdCard, ShieldCheck, Accessibility, Briefcase, Scale,
  BarChart3, Smartphone, BookOpen,
  CheckCircle2, XCircle, HelpCircle, ChevronDown,
  CalendarDays, Award, Megaphone, Lightbulb,
  ChevronRight, ArrowRight,
} from 'lucide-react'
import Navbar from '../components/Navbar'

// ── Countdown to May 31 2026 00:00 Colombia (UTC-5) ──
const ELECTION_DATE = new Date('2026-05-31T05:00:00Z') // UTC equiv of midnight Colombia

function useCountdown() {
  const [time, setTime] = useState(getRemaining())

  function getRemaining() {
    const diff = ELECTION_DATE - Date.now()
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, past: true }
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      past: false,
    }
  }

  useEffect(() => {
    const id = setInterval(() => setTime(getRemaining()), 1000)
    return () => clearInterval(id)
  }, [])

  return time
}

// Floating background pills data
const PILLS = [
  { text: 'SÍ',      color: '#2ECC40', x: 8,  y: 15, delay: 0,    dur: 18 },
  { text: 'NO',      color: '#FE4375', x: 82, y: 22, delay: 3,    dur: 22 },
  { text: 'TAL VEZ', color: '#FEB402', x: 55, y: 8,  delay: 1.5,  dur: 20 },
  { text: 'SÍ',      color: '#2ECC40', x: 20, y: 72, delay: 5,    dur: 25 },
  { text: 'NO',      color: '#FE4375', x: 70, y: 65, delay: 2,    dur: 19 },
  { text: 'TAL VEZ', color: '#FEB402', x: 40, y: 85, delay: 7,    dur: 23 },
  { text: 'VOTA',    color: '#00C8BC', x: 90, y: 45, delay: 4,    dur: 21 },
  { text: 'VOTA',    color: '#FF7E06', x: 5,  y: 50, delay: 6,    dur: 24 },
  { text: 'SÍ',      color: '#2ECC40', x: 60, y: 40, delay: 8,    dur: 17 },
]

const MARQUEE_ITEMS = [
  '🗳 VOTA 2026', '⚡ DEMOCRACIA', '✦ 31 MAY', '🗳 TU VOZ IMPORTA',
  '⚡ ELECCIONES', '✦ COLOMBIA', '🗳 VOTAFEST', '⚡ UPB',
]

function pad(n) { return String(n).padStart(2, '0') }

// ── Sections data ──
const rights = [
  { Icon: Vote,          color: '#FE4375', title: 'Voto libre y secreto',       desc: 'Nadie puede obligarte ni saber por quién votaste. Es tu decisión, solo tuya.' },
  { Icon: IdCard,        color: '#FF7E06', title: 'Solo necesitas tu cédula',    desc: 'Nada más. Tu cédula de ciudadanía vigente te da acceso a las urnas.' },
  { Icon: ShieldCheck,   color: '#FEB402', title: 'Sin presiones de nadie',      desc: 'Ni jefes, ni familia, ni nadie puede presionar tu voto. Es un derecho protegido.' },
  { Icon: Accessibility, color: '#2ECC40', title: 'Voto asistido disponible',    desc: 'Si tienes alguna discapacidad puedes pedir ayuda en la mesa de votación.' },
  { Icon: Briefcase,     color: '#00C8BC', title: 'Permiso laboral garantizado', desc: 'La ley te protege: tienes tiempo libre el día de elecciones para votar.' },
  { Icon: Scale,         color: '#FE4375', title: 'Tu voto vale igual',          desc: 'Sin importar quién eres, tu voto tiene exactamente el mismo peso que cualquier otro.' },
]

const steps = [
  { num: '01', color: '#FE4375', bg: 'rgba(254,67,117,0.08)', border: 'rgba(254,67,117,0.25)', title: 'Inscribe tu cédula',  desc: 'Verifica que tu documento esté registrado en el puesto más cercano a donde vives.' },
  { num: '02', color: '#FF7E06', bg: 'rgba(255,126,6,0.08)',  border: 'rgba(255,126,6,0.25)',  title: 'Consulta tu puesto', desc: 'Entra a registraduria.gov.co, busca con tu cédula y anota tu puesto y mesa.' },
  { num: '03', color: '#FEB402', bg: 'rgba(254,180,2,0.08)',  border: 'rgba(254,180,2,0.25)',  title: 'El gran día',        desc: 'Lleva tu cédula original. Ubica tu mesa, recibe el tarjetón y marca tu candidato.' },
  { num: '04', color: '#2ECC40', bg: 'rgba(46,204,64,0.08)',  border: 'rgba(46,204,64,0.25)',  title: 'Deposita y listo',   desc: 'Dobla el tarjetón, deposítalo en la urna. ¡Ya ejerciste tu derecho democrático!' },
]

const faqs = [
  { q: '¿Puedo votar si tengo 18 años pero nunca he votado?',  a: 'Sí. Solo necesitas que tu cédula esté inscrita en un puesto de votación. Puedes hacerlo gratis en cualquier Registraduría.' },
  { q: '¿Qué pasa si voto en blanco?',                         a: 'El voto en blanco es totalmente válido. Si supera el 50% de los votos válidos, se repiten las elecciones con nuevos candidatos.' },
  { q: '¿Me pueden obligar a revelar mi voto?',                a: 'Nunca. El voto es secreto por ley. Ningún empleador, familiar o autoridad puede obligarte a decir por quién votaste.' },
  { q: '¿Qué hago si no me dejan votar?',                      a: 'Tienes derecho a votar. Pide el libro de reclamaciones en el puesto y contacta a la Procuraduría o la Registraduría.' },
]

function IconBox({ Icon, color }) {
  return (
    <div style={{ width:'2.4rem', height:'2.4rem', borderRadius:'0.6rem', background: color+'18', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <Icon size={18} color={color} strokeWidth={2} />
    </div>
  )
}

// ── Countdown unit block ──
function CountUnit({ value, label }) {
  return (
    <div className="cd-unit">
      <div className="cd-box">
        <span className="cd-top">{pad(value)}</span>
        <div className="cd-fold" />
        <span className="cd-bot">{pad(value)}</span>
      </div>
      <span className="cd-label">{label}</span>
    </div>
  )
}

export default function Landing() {
  const { days, hours, minutes, seconds, past } = useCountdown()

  return (
    <div className="land-root">
      <Navbar />

      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      <section className="land-hero">
        <div className="hero-grid-overlay" />

        {/* Floating vote pills */}
        <div className="hero-pills-layer" aria-hidden="true">
          {PILLS.map((p, i) => (
            <div
              key={i}
              className="hero-pill"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                color: p.color,
                borderColor: p.color + '40',
                background: p.color + '0d',
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.dur}s`,
              }}
            >
              {p.text}
            </div>
          ))}
        </div>

        <div className="land-hero-inner">

          {/* Badge */}
          <div className="land-hero-badge">
            <span className="badge-dot" />
            UPB · Evento Académico · Elecciones 2026
          </div>

          {/* Logo */}
          <div className="land-logo-wrap">
            <span className="land-logo-vota">VOTA</span>
            <span className="land-logo-fest">FEST</span>
          </div>

          {/* Marquee strip */}
          <div className="hero-marquee-wrap" aria-hidden="true">
            <div className="hero-marquee-track">
              {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                <span key={i} className="hero-marquee-item">{item}</span>
              ))}
            </div>
          </div>

          {/* Countdown */}
          {!past ? (
            <div className="cd-wrap">
              <div className="cd-eyebrow">
                <CalendarDays size={13} strokeWidth={2} />
                Faltan para la primera vuelta
              </div>
              <div className="cd-row">
                <CountUnit value={days}    label="días" />
                <span className="cd-sep">:</span>
                <CountUnit value={hours}   label="horas" />
                <span className="cd-sep">:</span>
                <CountUnit value={minutes} label="min" />
                <span className="cd-sep">:</span>
                <CountUnit value={seconds} label="seg" />
              </div>
              <div className="cd-date-tag">31 de mayo, 2026 · Colombia</div>
            </div>
          ) : (
            <div className="cd-past">¡Las elecciones ya pasaron! 🗳</div>
          )}

          {/* CTA */}
          <div className="land-hero-btns">
            <Link to="/votar" className="land-btn-main">
              <Vote size={18} strokeWidth={2.5} />
              ¡Participar en VotaFest!
            </Link>
            <a href="#derechos" className="land-btn-ghost">
              Ver mis derechos <ChevronDown size={14} style={{ display:'inline', verticalAlign:'middle' }} />
            </a>
          </div>

        </div>

        <div className="land-hero-scroll">
          <div className="scroll-pill"><ChevronDown size={16} /></div>
        </div>
      </section>

      {/* ── QUÉ ES ── */}
      <section className="land-section land-que">
        <div className="land-section-inner">
          <div className="land-chip" style={{ background:'rgba(254,67,117,0.10)', color:'#FE4375' }}>
            <Megaphone size={12} style={{ display:'inline', marginRight:4 }} />
            ¿Qué es VotaFest?
          </div>
          <h2 className="land-h2">La democracia<br /><span className="h2-highlight">es un festival</span></h2>
          <p className="land-lead">Una experiencia interactiva creada por la UPB para que los jóvenes se conecten con las elecciones presidenciales de 2026 de una forma diferente.</p>

          <div className="que-cards">
            {[
              { Icon: Megaphone,  color:'#FE4375', title:'Evento en vivo',   desc:'Responde encuestas en tiempo real y ve los resultados de tu comunidad al instante.' },
              { Icon: BarChart3,  color:'#FF7E06', title:'Datos reales',     desc:'Gráficas con los votos de todos los participantes actualizándose en vivo frente a ti.' },
              { Icon: BookOpen,   color:'#FEB402', title:'Educación cívica', desc:'Aprende tus derechos electorales y entiende el proceso democrático colombiano.' },
              { Icon: Smartphone, color:'#00C8BC', title:'Desde tu celular', desc:'Sin apps ni descargas. Escanea, entra y vota directamente desde tu teléfono.' },
            ].map(({ Icon, color, title, desc }) => (
              <div className="que-card" key={title} style={{ '--qc': color }}>
                <div style={{ background: color+'15', borderRadius:'0.6rem', width:'2.4rem', height:'2.4rem', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'0.8rem' }}>
                  <Icon size={18} color={color} strokeWidth={2} />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FECHA ── */}
      <section className="land-date-section">
        <div className="land-date-inner">
          <div className="date-glow-card">
            <div className="dgc-eyebrow">
              <CalendarDays size={13} style={{ display:'inline', marginRight:5, verticalAlign:'middle' }} />
              Colombia · Primera vuelta presidencial
            </div>
            <div className="dgc-date">31<span>MAY</span>2026</div>
            <div className="dgc-sub">¿Ya estás listo para ejercer tu voto?</div>
            <div className="dgc-chips">
              <div className="dgc-chip">
                <CalendarDays size={15} color="#FEB402" />
                <span className="dc-text"><strong>Jun 2026</strong>Segunda vuelta</span>
              </div>
              <div className="dgc-chip">
                <Award size={15} color="#FEB402" />
                <span className="dc-text"><strong>7 Ago 2026</strong>Posesión presidencial</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DERECHOS ── */}
      <section className="land-section" id="derechos">
        <div className="land-section-inner">
          <div className="land-chip" style={{ background:'rgba(46,204,64,0.10)', color:'#1fa832' }}>
            <ShieldCheck size={12} style={{ display:'inline', marginRight:4 }} />
            Tus derechos
          </div>
          <h2 className="land-h2">Conoce tus derechos<br /><span className="h2-highlight">como votante</span></h2>
          <p className="land-lead">Nadie puede quitarte lo que la ley te garantiza. Conócelos antes de votar.</p>
          <div className="rights-grid">
            {rights.map(({ Icon, color, title, desc }) => (
              <div className="right-card" key={title} style={{ '--rc': color }}>
                <IconBox Icon={Icon} color={color} />
                <div className="rc-body"><strong>{title}</strong><span>{desc}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PASOS ── */}
      <section className="land-section land-steps-section">
        <div className="land-section-inner">
          <div className="land-chip" style={{ background:'rgba(255,126,6,0.10)', color:'#FF7E06' }}>
            <CheckCircle2 size={12} style={{ display:'inline', marginRight:4 }} />
            Paso a paso
          </div>
          <h2 className="land-h2">¿Cómo votar el<br /><span className="h2-highlight">día de elecciones?</span></h2>
          <p className="land-lead">4 pasos y ya ejerciste tu derecho democrático.</p>
          <div className="steps-timeline">
            {steps.map((s, i) => (
              <div className="step-tl" key={i}>
                <div className="stl-left">
                  <div className="stl-num" style={{ background: s.color }}>{s.num}</div>
                  {i < steps.length - 1 && <div className="stl-line" style={{ background: `linear-gradient(${s.color}, ${steps[i+1].color})` }} />}
                </div>
                <div className="stl-card" style={{ '--sc': s.color, background: s.bg, borderColor: s.border }}>
                  <strong>{s.title}</strong><span>{s.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIP ── */}
      <section className="land-section" style={{ paddingTop:0 }}>
        <div className="land-section-inner">
          <div className="tip-card">
            <div className="tip-icon-wrap"><Lightbulb size={20} color="#b56800" strokeWidth={2} /></div>
            <div className="tip-body">
              <strong>¿Sabías esto sobre el voto en blanco?</strong>
              <p>El voto en blanco tiene efectos jurídicos reales. Si supera el <strong>50% de los votos válidos</strong>, se repiten las elecciones con nuevos candidatos. No votar y votar en blanco son cosas muy distintas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="land-section land-faq-section">
        <div className="land-section-inner">
          <div className="land-chip" style={{ background:'rgba(0,200,188,0.10)', color:'#008f87' }}>
            <HelpCircle size={12} style={{ display:'inline', marginRight:4 }} />
            Preguntas frecuentes
          </div>
          <h2 className="land-h2">Respuestas<br /><span className="h2-highlight">que necesitas</span></h2>
          <div className="faq-list">
            {faqs.map((f, i) => (
              <details className="faq-item" key={i}>
                <summary className="faq-q">
                  <span>{f.q}</span>
                  <ChevronRight size={16} className="faq-arrow" />
                </summary>
                <div className="faq-a">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="land-cta-section">
        <div className="land-cta-inner">
          <div className="cta-icon-wrap">
            <Vote size={32} color="#FEB402" strokeWidth={1.8} />
          </div>
          <h2 className="cta-title">¿LISTO PARA<br />PARTICIPAR?</h2>
          <p className="cta-sub">Únete al VotaFest y demuestra que la juventud colombiana tiene voz</p>
          <Link to="/votar" className="land-btn-main land-btn-xl">
            Ir a votar ahora <ArrowRight size={18} strokeWidth={2.5} />
          </Link>
          <p className="cta-note">Sin registro · Anónimo · Resultados en vivo</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="land-footer">
        <div className="lf-logo">VOTA<span>FEST</span></div>
        <p>Evento académico · Universidad Pontificia Bolivariana · 2026</p>
        <p>Fomentando la participación democrática estudiantil</p>
        <div className="lf-links">
          <Link to="/votar">Votar</Link>
          <a href="https://www.registraduria.gov.co" target="_blank" rel="noopener noreferrer">Registraduría</a>
          <Link to="/admin">Administrar</Link>
        </div>
        <div className="lf-bottom">Hecho con amor en Medellín para Colombia</div>
      </footer>
    </div>
  )
}
