import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import styles from './styles.module.css';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [token, setToken] = useState('');
  const [viewMode, setViewMode] = useState('login');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { login, register, forgotPassword, resetPassword } = useAuth();

  useEffect(() => {
    inputRef.current?.focus();
  }, [viewMode]);

  useEffect(() => {
    const resetToken = searchParams.get('resetToken');

    if (resetToken) {
      setViewMode('reset');
      setToken(resetToken);
    }
  }, [searchParams]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  async function handleLogin(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await login(username.trim(), password);
      setMessageType('success');
      setMessage('Login realizado com sucesso!');
      navigate('/home');
    } catch (error) {
      setMessageType('error');
      setMessage(error?.error || 'Usuário ou senha inválidos.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await register(name.trim(), email.trim(), username.trim(), password);
      setMessageType('success');
      setMessage('Conta criada com sucesso! Faça login para continuar.');
      setViewMode('login');
    } catch (error) {
      setMessageType('error');
      setMessage(error?.error || 'Erro ao cadastrar usuário.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleForgotPassword(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await forgotPassword(email.trim());
      setMessageType('success');
      setMessage(
        result.resetToken
          ? `Token gerado: ${result.resetToken}`
          : 'Se o e-mail existir no sistema, um token foi enviado.',
      );
    } catch (error) {
      setMessageType('error');
      setMessage(error?.error || 'Erro ao solicitar recuperação de senha.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await resetPassword(token.trim(), password);
      setMessageType('success');
      setMessage('Senha redefinida com sucesso! Faça login para continuar.');
      setViewMode('login');
      setPassword('');
      setToken('');
    } catch (error) {
      setMessageType('error');
      setMessage(error?.error || 'Erro ao redefinir a senha.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function showRegister() {
    setViewMode('register');
    setMessage('');
  }

  function showRecoverPassword() {
    setViewMode('recover');
    setMessage('');
  }

  function showLogin() {
    setViewMode('login');
    setMessage('');
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>CHRONOS</h1>

        <p className={styles.subtitle}>
          O tempo passa... mas seus objetivos não precisam ficar para trás.
        </p>

        {viewMode === 'login' && (
          <form onSubmit={handleLogin}>
            <div className={styles.inputGroup}>
              <label htmlFor='username'>Usuário ou e-mail</label>

              <input
                ref={inputRef}
                id='username'
                type='text'
                value={username}
                onChange={event => setUsername(event.target.value)}
                placeholder='Digite seu usuário ou e-mail'
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor='password'>Senha</label>

              <input
                id='password'
                type='password'
                value={password}
                onChange={event => setPassword(event.target.value)}
                placeholder='Digite sua senha'
              />
            </div>

            <button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        )}

        {viewMode === 'register' && (
          <form onSubmit={handleRegister}>
            <div className={styles.inputGroup}>
              <label htmlFor='name'>Nome completo</label>

              <input
                ref={inputRef}
                id='name'
                type='text'
                value={name}
                onChange={event => setName(event.target.value)}
                placeholder='Digite seu nome'
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor='email'>E-mail</label>

              <input
                id='email'
                type='email'
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder='Digite seu e-mail'
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor='usernameRegister'>Usuário</label>

              <input
                id='usernameRegister'
                type='text'
                value={username}
                onChange={event => setUsername(event.target.value)}
                placeholder='Escolha um usuário'
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor='passwordRegister'>Senha</label>

              <input
                id='passwordRegister'
                type='password'
                value={password}
                onChange={event => setPassword(event.target.value)}
                placeholder='Escolha uma senha'
              />
            </div>

            <button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Cadastrar'}
            </button>
          </form>
        )}

        {viewMode === 'recover' && (
          <form onSubmit={handleForgotPassword}>
            <div className={styles.inputGroup}>
              <label htmlFor='emailRecover'>E-mail cadastrado</label>

              <input
                ref={inputRef}
                id='emailRecover'
                type='email'
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder='Digite seu e-mail'
              />
            </div>

            <button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar token'}
            </button>
          </form>
        )}

        {viewMode === 'reset' && (
          <form onSubmit={handleResetPassword}>
            <div className={styles.inputGroup}>
              <label htmlFor='resetToken'>Token de redefinição</label>

              <input
                ref={inputRef}
                id='resetToken'
                type='text'
                value={token}
                onChange={event => setToken(event.target.value)}
                placeholder='Cole o token recebido'
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor='passwordReset'>Nova senha</label>

              <input
                id='passwordReset'
                type='password'
                value={password}
                onChange={event => setPassword(event.target.value)}
                placeholder='Digite a nova senha'
              />
            </div>

            <button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Redefinindo...' : 'Redefinir senha'}
            </button>
          </form>
        )}

        <div className={styles.links}>
          {viewMode !== 'login' ? (
            <button type='button' onClick={showLogin}>
              Voltar ao login
            </button>
          ) : (
            <>
              <button type='button' onClick={showRegister}>
                Não tem conta? Cadastre-se
              </button>

              <button type='button' onClick={showRecoverPassword}>
                Esqueci minha senha
              </button>
            </>
          )}
        </div>

        {message && (
          <div className={`${styles.message} ${styles[messageType]}`}>
            <p>{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
