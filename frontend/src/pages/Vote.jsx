import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, XCircle, HelpCircle, ThumbsUp, Zap, Heart } from 'lucide-react'
import axios from 'axios'

const API = '/api'

// ── Temas por color ──
const THEMES = {
  verde: {
    pageBg:      '#1a7a2e',
    pageGrad:    'linear-gradient(160deg, #0f4d1c 0%, #1a7a2e 50%, #126124 100%)',
    cardBg:      'rgba(255,255,255,0.15)',
    cardBorder:  'rgba(255,255,255,0.25)',
    accent:      '#7dffaa',
    accentBright:'#2ECC40',
    text:        '#ffffff',
    textMuted:   'rgba(255,255,255,0.65)',
    label:       'rgba(255,255,255,0.5)',
    barBg:       'rgba(255,255,255,0.15)',
    bigMsg:      '¡SÍ!',
    headerBg:    'rgba(0,0,0,0.2)',
  },
  rojo: {
    pageBg:      '#c0183e',
    pageGrad:    'linear-gradient(160deg, #7a0c25 0%, #c0183e 50%, #9e1232 100%)',
    cardBg:      'rgba(255,255,255,0.15)',
    cardBorder:  'rgba(255,255,255,0.25)',
    accent:      '#ffadc4',
    accentBright:'#ff4d73',
    text:        '#ffffff',
    textMuted:   'rgba(255,255,255,0.65)',
    label:       'rgba(255,255,255,0.5)',
    barBg:       'rgba(255,255,255,0.15)',
    bigMsg:      '¡NO!',
    headerBg:    'rgba(0,0,0,0.2)',
  },
  amarillo: {
    pageBg:      '#d4900a',
    pageGrad:    'linear-gradient(160deg, #8a5c00 0%, #d4900a 50%, #b57800 100%)',
    cardBg:      'rgba(255,255,255,0.15)',
    cardBorder:  'rgba(255,255,255,0.25)',
    accent:      '#fff3c0',
    accentBright:'#FEB402',
    text:        '#ffffff',
    textMuted:   'rgba(255,255,255,0.65)',
    label:       'rgba(255,255,255,0.5)',
    barBg:       'rgba(255,255,255,0.15)',
    bigMsg:      '¡TAL VEZ!',
    headerBg:    'rgba(0,0,0,0.2)',
  },
  naranja: {
    pageBg:      '#c45a00',
    pageGrad:    'linear-gradient(160deg, #7a3800 0%, #c45a00 50%, #a04800 100%)',
    cardBg:      'rgba(255,255,255,0.15)',
    cardBorder:  'rgba(255,255,255,0.25)',
    accent:      '#ffd4a8',
    accentBright:'#FF7E06',
    text:        '#ffffff',
    textMuted:   'rgba(255,255,255,0.65)',
    label:       'rgba(255,255,255,0.5)',
    barBg:       'rgba(255,255,255,0.15)',
    bigMsg:      '¡LISTO!',
    headerBg:    'rgba(0,0,0,0.2)',
  },
  teal: {
    pageBg:      '#0a8a82',
    pageGrad:    'linear-gradient(160deg, #065550 0%, #0a8a82 50%, #087068 100%)',
    cardBg:      'rgba(255,255,255,0.15)',
    cardBorder:  'rgba(255,255,255,0.25)',
    accent:      '#a8fff9',
    accentBright:'#00C8BC',
    text:        '#ffffff',
    textMuted:   'rgba(255,255,255,0.65)',
    label:       'rgba(255,255,255,0.5)',
    barBg:       'rgba(255,255,255,0.15)',
    bigMsg:      '¡VOTADO!',
    headerBg:    'rgba(0,0,0,0.2)',
  },
  rosa: {
    pageBg:      '#c0183e',
    pageGrad:    'linear-gradient(160deg, #7a0c25 0%, #c0183e 50%, #9e1232 100%)',
    cardBg:      'rgba(255,255,255,0.15)',
    cardBorder:  'rgba(255,255,255,0.25)',
    accent:      '#ffadc4',
    accentBright:'#ff4d73',
    text:        '#ffffff',
    textMuted:   'rgba(255,255,255,0.65)',
    label:       'rgba(255,255,255,0.5)',
    barBg:       'rgba(255,255,255,0.15)',
    bigMsg:      '¡VOTADO!',
    headerBg:    'rgba(0,0,0,0.2)',
  },
}

const NEUTRAL = {
  pageBg:      '#f0f0f0',
  pageGrad:    '#f0f0f0',
  cardBg:      '#ffffff',
  cardBorder:  'transparent',
  accent:      '#FE4375',
  accentBright:'#FE4375',
  text:        '#1A1A1A',
  textMuted:   '#888',
  label:       '#FE4375',
  barBg:       '#f0f0f0',
  bigMsg:      '',
  headerBg:    '#6B2535',
}

const COLOR_BARS = {
  verde: '#2ECC40', rojo: '#FE4375', amarillo: '#FEB402',
  teal: '#00C8BC', naranja: '#FF7E06', rosa: '#FE4375',
}

function ColorIcon({ color, size = 20 }) {
  const p = { size, strokeWidth: 2.5 }
  if (color === 'verde')    return <CheckCircle2 {...p} />
  if (color === 'rojo')     return <XCircle      {...p} />
  if (color === 'amarillo') return <HelpCircle   {...p} />
  if (color === 'teal')     return <ThumbsUp     {...p} />
  if (color === 'naranja')  return <Zap          {...p} />
  return <Heart {...p} />
}

function getVoterId() {
  let id = localStorage.getItem('vf_voter_id')
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('vf_voter_id', id) }
  return id
}

function hasVoted(qId)   { return localStorage.getItem(`vf_voted_${qId}`) === 'true' }
function getColor(qId)   { return localStorage.getItem(`vf_color_${qId}`) || null }
function saveVote(qId, c){ localStorage.setItem(`vf_voted_${qId}`, 'true'); localStorage.setItem(`vf_color_${qId}`, c) }

function ResultBar({ option, total, th }) {
  const pct = total > 0 ? Math.round((option.vote_count / total) * 100) : 0
  const [w, setW] = useState(0)
  useEffect(() => { const t = setTimeout(() => setW(pct), 80); return () => clearTimeout(t) }, [pct])

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.35rem' }}>
        <span style={{ fontSize:'0.9rem', fontWeight:700, color: th.text }}>{option.text}</span>
        <span style={{ fontSize:'0.9rem', fontWeight:800, color: th.accent }}>{pct}%</span>
      </div>
      <div style={{ height:'0.85rem', borderRadius:'999px', background: th.barBg, overflow:'hidden' }}>
        <div style={{
          height:'100%', width:`${w}%`, borderRadius:'999px',
          background: COLOR_BARS[option.color] || th.accentBright,
          transition:'width 0.9s cubic-bezier(0.4,0,0.2,1)',
          boxShadow:`0 0 8px ${COLOR_BARS[option.color] || th.accentBright}60`,
        }} />
      </div>
      <span style={{ fontSize:'0.7rem', color: th.textMuted, marginTop:'0.2rem', display:'block' }}>
        {option.vote_count} {option.vote_count === 1 ? 'voto' : 'votos'}
      </span>
    </div>
  )
}

export default function Vote() {
  const [question, setQuestion]     = useState(null)
  const [loading, setLoading]       = useState(true)
  const [voting, setVoting]         = useState(false)
  const [voted, setVoted]           = useState(false)
  const [votedColor, setVotedColor] = useState(null)  // 'verde' | 'rojo' | etc.
  const [results, setResults]       = useState(null)
  const [error, setError]           = useState('')
  const [lastQId, setLastQId]       = useState(null)
  const [splash, setSplash]         = useState(false)
  const pollRef = useRef(null)

  // Derived theme — recomputed every render, no stale state
  const th = (voted && votedColor && THEMES[votedColor]) ? THEMES[votedColor] : NEUTRAL

  const fetchQuestion = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/active-question`)
      if (!data) { setQuestion(null); setLoading(false); return }

      if (data.id !== lastQId) {
        setLastQId(data.id)
        const already = hasVoted(data.id)
        const color   = getColor(data.id)
        setVoted(already)
        setVotedColor(already ? color : null)
        setResults(already ? data : null)
        setError('')
        setSplash(false)
      } else if (voted) {
        setResults(data)
      }
      setQuestion(data)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [lastQId, voted])

  useEffect(() => {
    fetchQuestion()
    pollRef.current = setInterval(fetchQuestion, 3000)
    return () => clearInterval(pollRef.current)
  }, [fetchQuestion])

  async function handleVote(optionId, color) {
    if (voting || voted) return
    setVoting(true)
    setError('')
    try {
      const { data } = await axios.post(`${API}/vote`, { option_id: optionId, voter_id: getVoterId() })
      saveVote(question.id, color)
      // Apply theme FIRST, then show splash
      setVotedColor(color)
      setVoted(true)
      setResults(data)
      setSplash(true)
      setTimeout(() => setSplash(false), 1400)
    } catch (e) {
      const msg = e.response?.data?.detail || 'Error al registrar el voto'
      if (msg.includes('Ya registraste')) {
        saveVote(question.id, color)
        setVotedColor(color)
        setVoted(true)
        setResults(question)
      } else {
        setError(msg)
      }
    } finally {
      setVoting(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: th.pageGrad,
      display: 'flex', flexDirection: 'column',
      transition: 'background 0.7s ease',
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Texture overlay when voted */}
      {voted && votedColor && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
      )}

      {/* Splash */}
      {splash && (
        <div style={{
          position:'fixed', inset:0, zIndex:999,
          display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'1rem',
          background: th.pageGrad,
          animation:'splashFade 1.4s ease forwards',
        }}>
          <div style={{
            width:'6rem', height:'6rem', borderRadius:'1.5rem',
            background:'rgba(255,255,255,0.2)', border:'2px solid rgba(255,255,255,0.35)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color:'#fff', animation:'splashBounce 0.45s ease',
          }}>
            <ColorIcon color={votedColor} size={48} />
          </div>
          <div style={{
            fontFamily:'Anton, sans-serif',
            fontSize:'clamp(3.5rem, 20vw, 7rem)',
            letterSpacing:'0.04em', color:'#fff', lineHeight:1,
            animation:'splashBounce 0.45s ease 0.08s both',
          }}>
            {th.bigMsg}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        background: th.headerBg,
        backdropFilter:'blur(12px)',
        borderBottom:'1px solid rgba(255,255,255,0.1)',
        padding:'0.9rem 1rem',
        transition:'background 0.7s ease',
        position:'relative', zIndex:10,
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', maxWidth:520, margin:'0 auto', width:'100%' }}>
          <Link to="/" style={{ fontFamily:'Anton, sans-serif', fontSize:'1.5rem', color:'#fff', letterSpacing:'0.05em', textDecoration:'none' }}>
            VOTA<span style={{ color: voted ? th.accent : '#FEB402' }}>FEST</span>
          </Link>
          <span style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.5)', fontWeight:600 }}>
            Elecciones 2026
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', padding:'1.5rem 1rem 2rem', maxWidth:520, margin:'0 auto', width:'100%', position:'relative', zIndex:1 }}>

        {loading ? (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div className="spinner" style={{ borderTopColor: voted ? '#fff' : 'var(--rosa)', borderColor: voted ? 'rgba(255,255,255,0.2)' : 'rgba(254,67,117,0.2)' }} />
          </div>

        ) : !question ? (
          <div className="vote-waiting fade-in">
            <div className="pulse-ring">⏳</div>
            <div>
              <h2 style={{ fontFamily:'Anton, sans-serif', fontSize:'1.8rem', color:'var(--maroon)', letterSpacing:'0.03em' }}>ESPERANDO PREGUNTA</h2>
              <p style={{ color:'var(--gris)', fontSize:'0.9rem', marginTop:'0.4rem' }}>El presentador está preparando la siguiente pregunta...</p>
            </div>
            <p style={{ fontSize:'0.8rem', color:'#bbb' }}>Se actualizará automáticamente</p>
            <Link to="/" className="btn btn-outline" style={{ marginTop:'0.5rem' }}>← Volver al inicio</Link>
          </div>

        ) : (
          <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:'1rem' }}>

            {/* Confirmed banner */}
            {voted && !splash && (
              <div style={{
                display:'flex', alignItems:'center', gap:'0.6rem',
                background:'rgba(255,255,255,0.15)',
                border:'1.5px solid rgba(255,255,255,0.3)',
                color:'#fff', borderRadius:'0.8rem', padding:'0.7rem 1.1rem',
                fontSize:'0.9rem', fontWeight:700, backdropFilter:'blur(8px)',
              }} className="bounce-in">
                <span style={{ display:'flex', color:'#fff' }}><ColorIcon color={votedColor} size={18} /></span>
                <span>¡Gracias! Tu voto fue registrado</span>
              </div>
            )}

            {error && (
              <div className="alert alert-error">{error}</div>
            )}

            {/* Main card */}
            <div style={{
              background: th.cardBg,
              border: `1.5px solid ${th.cardBorder}`,
              backdropFilter: voted ? 'blur(16px)' : 'none',
              borderRadius:'1.4rem',
              padding:'1.8rem 1.4rem',
              boxShadow: voted
                ? '0 8px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)'
                : '0 4px 24px rgba(0,0,0,0.1)',
              transition:'all 0.7s ease',
              width:'100%',
            }}>

              <div style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color: th.label, marginBottom:'0.6rem' }}>
                Pregunta activa
              </div>

              <div style={{ fontSize:'1.2rem', fontWeight:700, color: th.text, lineHeight:1.4, marginBottom:'1.6rem', transition:'color 0.7s ease' }}>
                {question.text}
              </div>

              {!voted ? (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                  {question.options.map(opt => (
                    <button
                      key={opt.id}
                      className={`option-btn ${opt.color}`}
                      onClick={() => handleVote(opt.id, opt.color)}
                      disabled={voting}
                    >
                      <span style={{ display:'flex', flexShrink:0 }}><ColorIcon color={opt.color} size={20} /></span>
                      <span>{opt.text}</span>
                    </button>
                  ))}
                  {voting && <div style={{ textAlign:'center', padding:'0.5rem' }}><div className="spinner" style={{ width:'1.5rem', height:'1.5rem' }} /></div>}
                </div>
              ) : (
                <div className="fade-in">
                  <div style={{ fontFamily:'Anton, sans-serif', fontSize:'1.1rem', color: th.accent, marginBottom:'1.2rem', letterSpacing:'0.08em' }}>
                    RESULTADOS EN VIVO
                  </div>
                  {(results || question).options.map(opt => (
                    <ResultBar key={opt.id} option={opt} total={(results || question).total_votes} th={th} />
                  ))}
                  <div style={{ textAlign:'center', fontSize:'0.78rem', color: th.textMuted, marginTop:'0.6rem', fontWeight:600 }}>
                    {(results || question).total_votes} {(results||question).total_votes===1?'voto':'votos'} · Actualizando en vivo
                  </div>
                </div>
              )}
            </div>

            <div style={{ textAlign:'center' }}>
              <p style={{ fontSize:'0.75rem', color: th.textMuted }}>Solo puedes votar una vez por pregunta</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
