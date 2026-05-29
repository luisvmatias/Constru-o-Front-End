import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { MOCK_USER } from '../../mocks/auth'
import { useAuth } from '../../contexts/AuthContext'

import styles from './styles.module.css'

export function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [viewMode, setViewMode] = useState('login')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const inputRef = useRef(null)

  const navigate = useNavigate()

  const { login } = useAuth()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('')
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [message])

  function handleLogin(event) {
    event.preventDefault()

    setIsSubmitting(true)

    setTimeout(() => {
      if (
        username === MOCK_USER.username &&
        password === MOCK_USER.password
      ) {
        login()

        setMessage('Login realizado com sucesso!')

        navigate('/home')
      } else {
        setMessage('Usuário ou senha inválidos.')
      }

      setIsSubmitting(false)
    }, 800)
  }

  function handleRegister() {
    setViewMode('register')

    setMessage('Tela de cadastro em desenvolvimento.')
  }

  function handleRecoverPassword() {
    setViewMode('recover')

    setMessage('Tela de recuperação em desenvolvimento.')
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>CHRONOS</h1>

        <p className={styles.subtitle}>
          O tempo passa... mas seus objetivos não precisam ficar para trás.
        </p>

        <form onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <label htmlFor="username">Usuário</label>

            <input
              ref={inputRef}
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Digite seu usuário"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Senha</label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Digite sua senha"
            />
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className={styles.links}>
          <button type="button" onClick={handleRegister}>
            Não tem conta? Cadastre-se
          </button>

          <button type="button" onClick={handleRecoverPassword}>
            Esqueci minha senha
          </button>
        </div>

        {message && (
          <div className={styles.message}>
            <p>{message}</p>
          </div>
        )}

        {viewMode === 'register' && (
          <div className={styles.viewModeBox}>
            <h3>Cadastro</h3>

            <p>
              Futuramente você poderá criar sua conta aqui.
            </p>
          </div>
        )}

        {viewMode === 'recover' && (
          <div className={styles.viewModeBox}>
            <h3>Recuperar Senha</h3>

            <p>
              Fluxo de recuperação será implementado futuramente.
            </p>
          </div>
        )}

        <div className={styles.credentials}>
          <span>Usuário: chronos</span>
          <span>Senha: 123456</span>
        </div>
      </div>
    </div>
  )
}