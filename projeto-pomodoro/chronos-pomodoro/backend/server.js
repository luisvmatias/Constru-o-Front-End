import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

dotenv.config();

const {
  DATABASE_URL,
  JWT_SECRET = 'change_this_secret',
  CLIENT_URL = 'http://localhost:5173',
  PORT = '4000',
} = process.env;

if (!DATABASE_URL) {
  throw new Error('A variável DATABASE_URL não está definida no .env');
}

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);

const authCookieName = 'chronos_token';

function createToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '8h' },
  );
}

function sendAuthCookie(res, token) {
  res.cookie(authCookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000,
  });
}

function authenticate(req, res, next) {
  const token = req.cookies[authCookieName];

  if (!token) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Sessão inválida' });
  }
}

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, name } = req.body;

  if (!username || !email || !password || !name) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (existingUser) {
    return res.status(409).json({ error: 'Usuário ou e-mail já cadastrado.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      username,
      email,
      name,
      passwordHash,
      settings: {
        create: {},
      },
      tasks: {
        create: [
          { title: 'Primeira tarefa do Pomodoro' },
          { title: 'Ajustar seu tempo de focagem' },
          { title: 'Experimentar o ciclo 25/5' },
        ],
      },
    },
  });

  return res.status(201).json({ message: 'Usuário registrado com sucesso.' });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email: username }],
    },
  });

  if (!user) {
    return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
  }

  const token = createToken(user);
  sendAuthCookie(res, token);

  return res.json({
    user: { id: user.id, username: user.username, name: user.name },
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie(authCookieName);
  return res.json({ message: 'Logout realizado com sucesso.' });
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { id: true, username: true, name: true, email: true },
  });

  if (!user) {
    return res.status(401).json({ error: 'Usuário não encontrado.' });
  }

  return res.json({ user });
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'E-mail é obrigatório.' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.json({
      message:
        'Se o e-mail existir no sistema, um token de recuperação foi gerado. Verifique a tela de redefinição.',
    });
  }

  const resetToken = crypto.randomBytes(24).toString('hex');
  const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({
    where: { email },
    data: {
      resetToken,
      resetTokenExpires,
    },
  });

  return res.json({
    message: 'Token de recuperação criado com sucesso.',
    resetToken,
  });
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res
      .status(400)
      .json({ error: 'Token e nova senha são obrigatórios.' });
  }

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpires: {
        gte: new Date(),
      },
    },
  });

  if (!user) {
    return res.status(400).json({ error: 'Token inválido ou expirado.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpires: null,
    },
  });

  return res.json({ message: 'Senha redefinida com sucesso.' });
});

app.get('/api/tasks', authenticate, async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: { userId: req.user.userId },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ tasks });
});

app.post('/api/tasks', authenticate, async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Título da tarefa é obrigatório.' });
  }

  const task = await prisma.task.create({
    data: {
      title,
      user: { connect: { id: req.user.userId } },
    },
  });

  return res.status(201).json({ task });
});

app.put('/api/tasks/:id', authenticate, async (req, res) => {
  const taskId = Number(req.params.id);

  const task = await prisma.task.findFirst({
    where: { id: taskId, userId: req.user.userId },
  });

  if (!task) {
    return res.status(404).json({ error: 'Tarefa não encontrada.' });
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: { completed: !task.completed },
  });

  return res.json({ task: updatedTask });
});

app.get('/api/settings', authenticate, async (req, res) => {
  const settings = await prisma.setting.findUnique({
    where: { userId: req.user.userId },
  });

  if (!settings) {
    return res.status(404).json({ error: 'Configurações não encontradas.' });
  }

  return res.json({ settings });
});

app.put('/api/settings', authenticate, async (req, res) => {
  const { focusMinutes, breakMinutes, longBreakMinutes, notificationsEnabled } =
    req.body;

  const settings = await prisma.setting.update({
    where: { userId: req.user.userId },
    data: {
      focusMinutes: focusMinutes ?? undefined,
      breakMinutes: breakMinutes ?? undefined,
      longBreakMinutes: longBreakMinutes ?? undefined,
      notificationsEnabled: notificationsEnabled ?? undefined,
    },
  });

  return res.json({ settings });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

app.listen(Number(PORT), () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
