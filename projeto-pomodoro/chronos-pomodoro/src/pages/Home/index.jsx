import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export function Home() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [settings, setSettings] = useState(null);
  const [newTask, setNewTask] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const tasksData = await api.getTasks();
      const settingsData = await api.getSettings();
      setTasks(tasksData.tasks);
      setSettings(settingsData.settings);
    } catch (error) {
      setMessage('Erro ao carregar dados, faça login novamente.');
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  async function handleAddTask(event) {
    event.preventDefault();

    if (!newTask.trim()) {
      return;
    }

    await api.addTask({ title: newTask.trim() });
    setNewTask('');
    loadData();
  }

  async function handleToggleTask(taskId) {
    await api.toggleTask(taskId);
    loadData();
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#020617',
        color: '#f8fafc',
      }}
    >
      <div style={{ width: '100%', maxWidth: '900px' }}>
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px',
          }}
        >
          <div>
            <h1>Bem-vindo, {user?.name || user?.username}</h1>
            <p>Seu Pomodoro está protegido pela sessão do backend.</p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: '12px 20px',
              border: 'none',
              borderRadius: '12px',
              background: '#38bdf8',
              color: '#020617',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </header>

        {message && (
          <div
            style={{
              marginBottom: '20px',
              padding: '16px',
              background: '#991b1b',
              borderRadius: '12px',
            }}
          >
            {message}
          </div>
        )}

        <section
          style={{
            marginBottom: '32px',
            padding: '24px',
            background: '#111827',
            borderRadius: '18px',
            boxShadow: '0 0 30px rgba(0,0,0,0.25)',
          }}
        >
          <h2>Configurações</h2>
          <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
            <div>Foco: {settings?.focusMinutes ?? 25} minutos</div>
            <div>Pausa curta: {settings?.breakMinutes ?? 5} minutos</div>
            <div>Pausa longa: {settings?.longBreakMinutes ?? 15} minutos</div>
            <div>
              Notificações:{' '}
              {settings?.notificationsEnabled ? 'Ativadas' : 'Desativadas'}
            </div>
          </div>
        </section>

        <section
          style={{
            marginBottom: '24px',
            padding: '24px',
            background: '#111827',
            borderRadius: '18px',
            boxShadow: '0 0 30px rgba(0,0,0,0.25)',
          }}
        >
          <h2>Minhas tarefas</h2>
          <form
            onSubmit={handleAddTask}
            style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}
          >
            <input
              value={newTask}
              onChange={event => setNewTask(event.target.value)}
              placeholder='Nova tarefa'
              style={{
                flexGrow: 1,
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid #334155',
                background: '#0f172a',
                color: '#f8fafc',
              }}
            />
            <button
              type='submit'
              style={{
                padding: '12px 20px',
                border: 'none',
                borderRadius: '12px',
                background: '#38bdf8',
                color: '#020617',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Adicionar
            </button>
          </form>

          {tasks.length === 0 ? (
            <p>Sem tarefas ainda. Crie sua primeira tarefa.</p>
          ) : (
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'grid',
                gap: '12px',
              }}
            >
              {tasks.map(task => (
                <li
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px',
                    borderRadius: '14px',
                    background: '#0f172a',
                  }}
                >
                  <span
                    style={{ color: task.completed ? '#6ee7b7' : '#f8fafc' }}
                  >
                    {task.completed ? '✓ ' : '• '}
                    {task.title}
                  </span>
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    style={{
                      border: 'none',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      background: task.completed ? '#f97316' : '#22c55e',
                      color: '#020617',
                      cursor: 'pointer',
                    }}
                  >
                    {task.completed ? 'Reabrir' : 'Concluir'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
