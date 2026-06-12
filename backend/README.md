# Chronos Backend

API de autenticação e dados para o aplicativo Chronos Pomodoro.

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha os valores:

- `DB_HOST` - endereço do MySQL
- `DB_PORT` - porta do MySQL
- `DB_USER` - usuário do banco
- `DB_PASSWORD` - senha do banco
- `DB_NAME` - nome do banco de dados
- `JWT_SECRET` - segredo para geração de token JWT
- `CLIENT_URL` - URL do frontend (ex: `http://localhost:5173`)
- `PORT` - porta que a API vai usar

## Como rodar

```bash
cd backend
npm install
npm start
```

A API cria o banco e as tabelas automaticamente se eles ainda não existirem.

## Endpoints principais

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `GET /api/settings`
- `PUT /api/settings`
