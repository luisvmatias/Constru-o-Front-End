import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';

export function Home() {
  const { logout } = useAuth();

  const navigate = useNavigate();

  function handleLogout() {
    logout();

    navigate('/');
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#020617',
        color: '#f8fafc',
      }}
    >
      <h1>Bem-vindo ao Chronos Pomodoro</h1>

      <p>O tempo agora está do seu aliado.</p>

      <button
        onClick={handleLogout}
        style={{
          marginTop: '20px',
          width: '200px',
          height: '46px',
          border: 'none',
          borderRadius: '10px',
          background: '#38bdf8',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        Sair
      </button>
    </div>
  );
}
