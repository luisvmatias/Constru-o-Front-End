import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { MOCK_USER } from "../../mocks/auth";
import { useAuth } from "../../context/AuthContext";

import styles from "./styles.module.css";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [viewMode, setViewMode] = useState("login");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  function handleLogin(event) {
    event.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      if (username === MOCK_USER.username && password === MOCK_USER.password) {
        login();
        setMessage("Login bem-sucedido. Bem-vindo ao Portal Aurora!");
        navigate("/desk");
      } else {
        setMessage("Nome de usuário ou senha não conferem.");
      }

      setIsSubmitting(false);
    }, 700);
  }

  function handleRegister() {
    setViewMode("register");
    setMessage("Cadastro em construção. Em breve tudo estará pronto.");
  }

  function handleRecoverPassword() {
    setViewMode("recover");
    setMessage("Recuperação de acesso ainda está em desenvolvimento.");
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span>Portal</span>
          <h1>Aurora</h1>
        </div>

        <p className={styles.subtitle}>
          Entre no seu espaço pessoal para organizar estudos, ideias e metas.
        </p>

        <form onSubmit={handleLogin} className={styles.form}>
          <label className={styles.inputGroup} htmlFor="username">
            <span>Usuário</span>
            <input
              ref={inputRef}
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Seu nome de entrada"
            />
          </label>

          <label className={styles.inputGroup} htmlFor="password">
            <span>Senha</span>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Senha secreta"
            />
          </label>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Conectando..." : "Entrar"}
          </button>
        </form>

        <div className={styles.actions}>
          <button type="button" onClick={handleRegister}>
            Quero criar uma conta
          </button>
          <button type="button" onClick={handleRecoverPassword}>
            Esqueci a senha
          </button>
        </div>

        {message && (
          <div className={styles.message}>
            <p>{message}</p>
          </div>
        )}

        {viewMode === "register" && (
          <div className={styles.infoBox}>
            <h3>Cadastro</h3>
            <p>Este fluxo será liberado em breve para novos usuários.</p>
          </div>
        )}

        {viewMode === "recover" && (
          <div className={styles.infoBox}>
            <h3>Recuperar senha</h3>
            <p>Em breve poderemos ajudar você a redefinir suas credenciais.</p>
          </div>
        )}

        <div className={styles.credentials}>
          <span>Usuário: aurora</span>
          <span>Senha: luz1234</span>
        </div>
      </div>
    </div>
  );
}
