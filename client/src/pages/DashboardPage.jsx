import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>💊 Tableau de bord</h1>
          <p>Bienvenue, <strong>{user?.prenom} {user?.nom}</strong> — rôle : <code>{user?.role}</code></p>
        </div>
        <button
          onClick={handleLogout}
          style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          Se déconnecter
        </button>
      </div>

      {isAdmin && (
        <div style={{ marginTop: '1rem', padding: '12px', background: '#f0fdf4', borderRadius: '8px', color: '#166534' }}>
          ✅ Vous avez les droits <strong>admin</strong>
        </div>
      )}
    </div>
  );
}