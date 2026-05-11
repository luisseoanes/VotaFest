import { Link, useNavigate } from 'react-router-dom'

export default function Navbar({ showAdmin = false }) {
  const navigate = useNavigate()
  const isLogged = !!localStorage.getItem('vf_token')

  function logout() {
    localStorage.removeItem('vf_token')
    navigate('/admin')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        VOTA<span>FEST</span>
      </Link>
      <div className="navbar-links">
        <Link to="/votar" className="btn-vote" style={{
          background: 'var(--rosa)',
          color: '#fff',
          padding: '0.4rem 1rem',
          borderRadius: '999px',
          fontWeight: 700,
          fontSize: '0.85rem'
        }}>
          Votar
        </Link>
        {isLogged ? (
          <>
            <Link to="/admin/dashboard" style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}>
              Panel
            </Link>
            <button onClick={logout} style={{ background: 'none', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}>
              Salir
            </button>
          </>
        ) : (
          <Link to="/admin" style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}>
            Admin
          </Link>
        )}
      </div>
    </nav>
  )
}
