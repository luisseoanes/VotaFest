import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const API = '/api'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const form = new URLSearchParams()
      form.append('username', username)
      form.append('password', password)
      const { data } = await axios.post(`${API}/token`, form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      localStorage.setItem('vf_token', data.access_token)
      navigate('/admin/dashboard')
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="vota">VOTA</div>
          <div className="fest">FEST</div>
          <p>Panel de Administración</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error mb-2">{error}</div>}

          <div className="form-group">
            <label className="form-label">Usuario</label>
            <input
              className="form-input"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full mt-2"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar al panel'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.2rem' }}>
          <Link to="/" style={{ fontSize: '0.8rem', color: 'var(--gris)', fontWeight: 600 }}>
            ← Volver al inicio
          </Link>
        </div>

        <div style={{ marginTop: '1rem', padding: '0.8rem', background: '#f5f5f5', borderRadius: '0.7rem', fontSize: '0.75rem', color: '#888', textAlign: 'center' }}>
          Usuario: <strong>admin</strong> · Contraseña: <strong>votafest2026</strong>
        </div>
      </div>
    </div>
  )
}
