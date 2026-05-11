import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const API = '/api'

const COLOR_OPTIONS = [
  { value: 'verde', label: 'Verde (Sí)', hex: '#2ECC40' },
  { value: 'rojo', label: 'Rojo (No)', hex: '#FE4375' },
  { value: 'amarillo', label: 'Amarillo (Tal vez)', hex: '#FEB402' },
  { value: 'teal', label: 'Teal', hex: '#00C8BC' },
  { value: 'naranja', label: 'Naranja', hex: '#FF7E06' },
  { value: 'rosa', label: 'Rosa', hex: '#FE4375' },
]

const PRESET_QUESTIONS = [
  {
    text: '¿Sabes cuándo son las elecciones presidenciales de 2026?',
    options: [
      { text: 'Sí, lo sé', color: 'verde' },
      { text: 'No lo sé', color: 'rojo' },
      { text: 'Más o menos', color: 'amarillo' },
    ],
  },
  {
    text: '¿Tienes tu cédula inscrita en un puesto de votación?',
    options: [
      { text: 'Sí, está inscrita', color: 'verde' },
      { text: 'No, falta inscribirla', color: 'rojo' },
      { text: 'No sé cómo verificarlo', color: 'amarillo' },
    ],
  },
  {
    text: '¿Piensas votar en las elecciones presidenciales de 2026?',
    options: [
      { text: '¡Definitivamente sí!', color: 'verde' },
      { text: 'Probablemente no', color: 'rojo' },
      { text: 'Aún no lo he decidido', color: 'amarillo' },
    ],
  },
  {
    text: '¿Conoces los derechos que tienes como votante?',
    options: [
      { text: 'Sí, los conozco bien', color: 'verde' },
      { text: 'No los conozco', color: 'rojo' },
      { text: 'Conozco algunos', color: 'amarillo' },
    ],
  },
]

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('vf_token')}` }
}

function ColorDot({ color }) {
  const c = COLOR_OPTIONS.find(o => o.value === color)
  return (
    <span
      className="color-dot"
      style={{ background: c?.hex || '#ccc', display: 'inline-block', width: '0.9rem', height: '0.9rem', borderRadius: '50%' }}
    />
  )
}

function MiniResults({ options, total }) {
  return (
    <div className="q-mini-results">
      {options.map(opt => {
        const pct = total > 0 ? Math.round((opt.vote_count / total) * 100) : 0
        const c = COLOR_OPTIONS.find(o => o.value === opt.color)
        return (
          <div className="q-mini-bar-row" key={opt.id}>
            <span className="q-mini-label">{opt.text}</span>
            <div className="q-mini-bar-bg">
              <div
                className="q-mini-bar-fill"
                style={{ width: `${pct}%`, background: c?.hex || '#ccc' }}
              />
            </div>
            <span className="q-mini-pct">{pct}%</span>
          </div>
        )
      })}
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [toast, setToast] = useState(null)

  // New question form
  const [showForm, setShowForm] = useState(false)
  const [qText, setQText] = useState('')
  const [qOptions, setQOptions] = useState([
    { text: '', color: 'verde' },
    { text: '', color: 'rojo' },
    { text: '', color: 'amarillo' },
  ])
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState('')

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchQuestions = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/questions`, { headers: authHeaders() })
      setQuestions(data)
    } catch (e) {
      if (e.response?.status === 401) {
        localStorage.removeItem('vf_token')
        navigate('/admin')
      }
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    fetchQuestions()
    const interval = setInterval(fetchQuestions, 4000)
    return () => clearInterval(interval)
  }, [fetchQuestions])

  function logout() {
    localStorage.removeItem('vf_token')
    navigate('/admin')
  }

  async function activate(id) {
    setActionLoading(id)
    try {
      await axios.post(`${API}/questions/${id}/activate`, {}, { headers: authHeaders() })
      showToast('Pregunta activada')
      fetchQuestions()
    } catch {
      showToast('Error al activar', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  async function deactivateAll() {
    setActionLoading('all')
    try {
      await axios.post(`${API}/questions/deactivate-all`, {}, { headers: authHeaders() })
      showToast('Preguntas desactivadas')
      fetchQuestions()
    } catch {
      showToast('Error', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  async function deleteQuestion(id) {
    if (!confirm('¿Eliminar esta pregunta y todos sus votos?')) return
    setActionLoading(id)
    try {
      await axios.delete(`${API}/questions/${id}`, { headers: authHeaders() })
      showToast('Pregunta eliminada')
      fetchQuestions()
    } catch {
      showToast('Error al eliminar', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  function addOption() {
    setQOptions(prev => [...prev, { text: '', color: 'teal' }])
  }

  function removeOption(i) {
    setQOptions(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateOption(i, field, value) {
    setQOptions(prev => prev.map((opt, idx) => idx === i ? { ...opt, [field]: value } : opt))
  }

  function loadPreset(preset) {
    setQText(preset.text)
    setQOptions(preset.options.map(o => ({ ...o })))
    setShowForm(true)
    setFormError('')
  }

  async function createQuestion(e) {
    e.preventDefault()
    setFormError('')
    if (!qText.trim()) return setFormError('Escribe la pregunta')
    const validOptions = qOptions.filter(o => o.text.trim())
    if (validOptions.length < 2) return setFormError('Agrega al menos 2 opciones')
    setCreating(true)
    try {
      await axios.post(`${API}/questions`, { text: qText.trim(), options: validOptions }, { headers: authHeaders() })
      showToast('Pregunta creada')
      setQText('')
      setQOptions([{ text: '', color: 'verde' }, { text: '', color: 'rojo' }, { text: '', color: 'amarillo' }])
      setShowForm(false)
      fetchQuestions()
    } catch {
      setFormError('Error al crear la pregunta')
    } finally {
      setCreating(false)
    }
  }

  const totalVotes = questions.reduce((a, q) => a + q.total_votes, 0)
  const activeQ = questions.find(q => q.is_active)

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="logo">VOTA<span>FEST</span></div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link to="/" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Inicio</Link>
          <Link to="/votar" style={{ fontSize: '0.8rem', color: 'var(--amarillo)', fontWeight: 700 }}>Ver pantalla</Link>
          <button onClick={logout} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '999px', padding: '0.3rem 0.8rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
            Salir
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 999 }}>
          <div className={`alert ${toast.type === 'error' ? 'alert-error' : 'alert-success'} bounce-in`} style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            {toast.msg}
          </div>
        </div>
      )}

      <div className="dashboard-body">
        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-number">{questions.length}</div>
            <div className="stat-label">Preguntas</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--verde)' }}>{totalVotes}</div>
            <div className="stat-label">Votos totales</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: activeQ ? 'var(--verde)' : 'var(--gris)' }}>
              {activeQ ? '●' : '○'}
            </div>
            <div className="stat-label">{activeQ ? 'Activa' : 'Sin activa'}</div>
          </div>
        </div>

        {/* Active question banner */}
        {activeQ && (
          <div style={{ background: '#f0fff2', border: '2px solid var(--verde)', borderRadius: '1rem', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--verde)', letterSpacing: '0.1em' }}>PREGUNTA ACTIVA</span>
              <button
                className="btn btn-sm"
                style={{ background: '#ffe0e8', color: 'var(--rosa)', fontWeight: 700 }}
                onClick={deactivateAll}
                disabled={actionLoading === 'all'}
              >
                Pausar
              </button>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--negro)', marginBottom: '0.8rem' }}>{activeQ.text}</div>
            <MiniResults options={activeQ.options} total={activeQ.total_votes} />
            <div style={{ fontSize: '0.75rem', color: 'var(--gris)', marginTop: '0.4rem' }}>{activeQ.total_votes} votos · Se actualiza en tiempo real</div>
          </div>
        )}

        {/* Preguntas sugeridas */}
        {questions.length === 0 && (
          <div className="panel">
            <div className="panel-title">💡 Preguntas sugeridas</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {PRESET_QUESTIONS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => loadPreset(p)}
                  style={{
                    background: '#f5f5f5',
                    border: '2px solid #e5e5e5',
                    borderRadius: '0.8rem',
                    padding: '0.8rem 1rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--negro)',
                    transition: 'border-color 0.2s',
                  }}
                >
                  {p.text}
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--gris)', marginTop: '0.2rem', fontWeight: 400 }}>
                    {p.options.map(o => o.text).join(' · ')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Create question panel */}
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showForm ? '1rem' : 0 }}>
            <div className="panel-title" style={{ marginBottom: 0 }}>➕ Nueva pregunta</div>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => setShowForm(v => !v)}
            >
              {showForm ? 'Cancelar' : 'Crear pregunta'}
            </button>
          </div>

          {!showForm && questions.length > 0 && (
            <div style={{ marginTop: '0.8rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {PRESET_QUESTIONS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => loadPreset(p)}
                  className="btn btn-sm"
                  style={{ background: '#f0f0f0', color: 'var(--negro)', fontWeight: 600 }}
                >
                  Plantilla {i + 1}
                </button>
              ))}
            </div>
          )}

          {showForm && (
            <form className="new-q-form" onSubmit={createQuestion}>
              {formError && <div className="alert alert-error">{formError}</div>}

              <div className="form-group">
                <label className="form-label">Pregunta</label>
                <textarea
                  className="textarea"
                  value={qText}
                  onChange={e => setQText(e.target.value)}
                  placeholder="¿Sabes cuándo son las elecciones de 2026?"
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Opciones de respuesta
                </label>
                <div className="options-editor">
                  {qOptions.map((opt, i) => (
                    <div className="option-row" key={i}>
                      <div
                        className="color-dot"
                        style={{ background: COLOR_OPTIONS.find(c => c.value === opt.color)?.hex || '#ccc', width: '1rem', height: '1rem', borderRadius: '50%', flexShrink: 0 }}
                      />
                      <input
                        className="form-input"
                        type="text"
                        value={opt.text}
                        onChange={e => updateOption(i, 'text', e.target.value)}
                        placeholder={`Opción ${i + 1}`}
                      />
                      <select
                        className="color-select"
                        value={opt.color}
                        onChange={e => updateOption(i, 'color', e.target.value)}
                      >
                        {COLOR_OPTIONS.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                      {qOptions.length > 2 && (
                        <button type="button" className="btn-icon" onClick={() => removeOption(i)}>✕</button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ background: '#f0f0f0', color: 'var(--negro)', marginTop: '0.5rem' }}
                  onClick={addOption}
                >
                  + Agregar opción
                </button>
              </div>

              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? 'Creando...' : 'Crear y guardar pregunta'}
              </button>
            </form>
          )}
        </div>

        {/* Questions list */}
        {questions.length > 0 && (
          <div className="panel">
            <div className="panel-title">📋 Preguntas ({questions.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {loading && questions.length === 0 && (
                <div className="text-center"><div className="spinner" /></div>
              )}
              {questions.map(q => (
                <div key={q.id} className={`q-item ${q.is_active ? 'active' : ''}`}>
                  <div className="q-item-header">
                    <div className="q-item-text">{q.text}</div>
                    {q.is_active && <span className="active-badge">Activa</span>}
                  </div>

                  <MiniResults options={q.options} total={q.total_votes} />
                  <div style={{ fontSize: '0.72rem', color: 'var(--gris)' }}>{q.total_votes} votos</div>

                  <div className="q-item-actions">
                    {!q.is_active ? (
                      <button
                        className="btn btn-sm btn-teal"
                        onClick={() => activate(q.id)}
                        disabled={actionLoading === q.id}
                      >
                        {actionLoading === q.id ? '...' : '▶ Activar'}
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm"
                        style={{ background: '#ffe0e8', color: 'var(--rosa)', fontWeight: 700 }}
                        onClick={deactivateAll}
                        disabled={actionLoading === 'all'}
                      >
                        ⏸ Pausar
                      </button>
                    )}
                    <button
                      className="btn btn-sm"
                      style={{ background: '#fff0f3', color: 'var(--rosa)', fontWeight: 700 }}
                      onClick={() => deleteQuestion(q.id)}
                      disabled={actionLoading === q.id}
                    >
                      🗑 Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QR / Share section */}
        <div className="panel" style={{ textAlign: 'center' }}>
          <div className="panel-title" style={{ justifyContent: 'center' }}>📱 Compartir con los participantes</div>
          <div style={{
            background: 'linear-gradient(135deg, var(--maroon), #3d1120)',
            borderRadius: '1rem',
            padding: '1.2rem',
            color: '#fff',
          }}>
            <div style={{ fontFamily: 'Anton, sans-serif', fontSize: '1.5rem', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
              VOTA<span style={{ color: 'var(--amarillo)' }}>FEST</span>
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.85, marginBottom: '0.8rem' }}>
              Comparte esta URL para que todos puedan votar:
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.12)',
              borderRadius: '0.6rem',
              padding: '0.6rem 0.8rem',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              wordBreak: 'break-all',
            }}>
              {window.location.origin}/votar
            </div>
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '0.8rem' }}
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/votar`)
                showToast('URL copiada al portapapeles')
              }}
            >
              📋 Copiar URL
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
