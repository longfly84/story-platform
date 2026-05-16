import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function UserMenu() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/', { replace: true })
  }

  if (loading) {
    return <span style={styles.muted}>Đang tải...</span>
  }

  if (!user) {
    return (
      <div style={styles.row}>
        <Link style={styles.link} to="/login">
          Đăng nhập
        </Link>
        <Link style={styles.buttonLink} to="/register">
          Đăng ký
        </Link>
      </div>
    )
  }

  return (
    <div style={styles.row}>
      <span style={styles.email}>{user.email}</span>
      <button style={styles.logoutButton} type="button" onClick={handleLogout}>
        Đăng xuất
      </button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap'
  },
  muted: {
    color: '#6b7280',
    fontSize: 14
  },
  link: {
    color: '#111827',
    textDecoration: 'none',
    fontWeight: 600
  },
  buttonLink: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 12px',
    borderRadius: 999,
    background: '#111827',
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: 14
  },
  email: {
    color: '#374151',
    fontSize: 14,
    maxWidth: 180,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  logoutButton: {
    padding: '8px 12px',
    borderRadius: 999,
    border: '1px solid #d1d5db',
    background: '#fff',
    color: '#111827',
    cursor: 'pointer',
    fontWeight: 600
  }
}