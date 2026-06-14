# Chronos Backend

API de autenticação e dados para o aplicativo Chronos Pomodoro.

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha os valores:

- `DATABASE_URL` - string de conexão MySQL
- `JWT_SECRET` - segredo para geração de token JWT
- `CLIENT_URL` - URL do frontend (ex: `http://localhost:5173`)
- `PORT` - porta que a API vai usar

## Como rodar

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm start
```

Para desenvolvimento com recarga automática, instale um observador de arquivos ou use `npm run dev`.

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha os valores. O backend espera um MySQL disponível em `DATABASE_URL`.

## Como testar os fluxos principais

1. Abra o frontend em `projeto-pomodoro/chronos-pomodoro` e execute `npm install` e `npm run dev`.
2. No navegador, use a tela de login para:
   - cadastrar uma nova conta via `Cadastrar`
   - fazer login com usuário ou e-mail e senha
   - acessar a tela principal do Pomodoro após autenticação
3. No app, as rotas `/api/tasks` e `/api/settings` só funcionam com usuário autenticado.
4. Para recuperar senha:
   - em `Esqueci minha senha`, envie o e-mail cadastrado
   - copie o `resetToken` exibido pelo backend na mensagem
   - cole o token em `Redefinir senha` e informe a nova senha
5. Para encerrar sessão, use o botão `Logout` na tela inicial.

## Como funciona

O backend usa Express para a API e Prisma como ORM para MySQL. O Prisma gera o client a partir do arquivo `prisma/schema.prisma`.

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
