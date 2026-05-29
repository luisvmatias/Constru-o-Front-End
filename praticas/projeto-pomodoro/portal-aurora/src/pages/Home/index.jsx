import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export function Home() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #0b1c3c 0%, #1a386d 45%, #3c65a8 100%)",
        color: "#edf2ff",
        padding: "32px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "720px",
          borderRadius: "24px",
          padding: "40px",
          background: "rgba(8, 25, 58, 0.86)",
          boxShadow: "0 24px 80px rgba(7, 18, 42, 0.35)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            marginBottom: "16px",
            fontSize: "clamp(2.2rem, 2.8vw, 3rem)",
          }}
        >
          Bem-vindo ao Portal Aurora
        </h1>
        <p style={{ marginBottom: "30px", lineHeight: 1.8, color: "#cbd5e1" }}>
          Aqui você encontra um espaço calmo para organizar seus estudos,
          guardar ideias e recarregar seu foco antes da próxima jornada.
        </p>

        <div
          style={{
            display: "grid",
            gap: "16px",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          <article
            style={{
              padding: "20px",
              borderRadius: "18px",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <h2 style={{ marginBottom: "10px", fontSize: "1.1rem" }}>
              Luz suave
            </h2>
            <p style={{ color: "#cbd5e1" }}>
              Faça pequenas pausas e mantenha o ritmo sem perder o conforto.
            </p>
          </article>

          <article
            style={{
              padding: "20px",
              borderRadius: "18px",
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <h2 style={{ marginBottom: "10px", fontSize: "1.1rem" }}>
              Espaço focado
            </h2>
            <p style={{ color: "#cbd5e1" }}>
              Use este portal para manter a disciplina sem perder a
              criatividade.
            </p>
          </article>
        </div>

        <button
          onClick={handleLogout}
          style={{
            marginTop: "36px",
            padding: "14px 26px",
            borderRadius: "999px",
            border: "none",
            background: "linear-gradient(90deg, #8b5cf6, #38bdf8)",
            color: "#0f172a",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Sair do Portal
        </button>
      </section>
    </main>
  );
}
