import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import mysql from "mysql2/promise";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const {
  DB_HOST = "localhost",
  DB_PORT = "3306",
  DB_USER = "root",
  DB_PASSWORD = "",
  DB_NAME = "chronosdb",
  JWT_SECRET = "change_this_secret",
  CLIENT_URL = "http://localhost:5173",
  PORT = "4000",
} = process.env;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);

const authCookieName = "chronos_token";

async function ensureDatabase() {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await connection.end();
}

await ensureDatabase();

const db = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

async function ensureTables() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(60) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      name VARCHAR(100) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      reset_token VARCHAR(255) DEFAULT NULL,
      reset_token_expires DATETIME DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      focus_minutes INT NOT NULL DEFAULT 25,
      break_minutes INT NOT NULL DEFAULT 5,
      long_break_minutes INT NOT NULL DEFAULT 15,
      notifications_enabled TINYINT(1) NOT NULL DEFAULT 1,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      completed TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);
}

await ensureTables();

function createToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "8h" },
  );
}

function sendAuthCookie(res, token) {
  res.cookie(authCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 8 * 60 * 60 * 1000,
  });
}

function authenticate(req, res, next) {
  const token = req.cookies[authCookieName];

  if (!token) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Sessão inválida" });
  }
}

app.post("/api/auth/register", async (req, res) => {
  const { username, email, password, name } = req.body;

  if (!username || !email || !password || !name) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  const [existing] = await db.query(
    "SELECT id FROM users WHERE username = ? OR email = ?",
    [username, email],
  );

  if (existing.length > 0) {
    return res.status(409).json({ error: "Usuário ou e-mail já cadastrado." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await db.query(
    "INSERT INTO users (username, email, name, password_hash) VALUES (?, ?, ?, ?)",
    [username, email, name, passwordHash],
  );

  const userId = result.insertId;

  await db.query("INSERT INTO settings (user_id) VALUES (?)", [userId]);

  const tasks = [
    ["Primeira tarefa do Pomodoro"],
    ["Ajustar seu tempo de focagem"],
    ["Experimentar o ciclo 25/5"],
  ];

  await db.query("INSERT INTO tasks (user_id, title) VALUES ? ", [
    tasks.map(([title]) => [userId, title]),
  ]);

  return res.status(201).json({ message: "Usuário registrado com sucesso." });
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Usuário e senha são obrigatórios." });
  }

  const [rows] = await db.query(
    "SELECT id, username, name, password_hash FROM users WHERE username = ? OR email = ?",
    [username, username],
  );

  const user = rows[0];

  if (!user) {
    return res.status(401).json({ error: "Usuário ou senha inválidos." });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    return res.status(401).json({ error: "Usuário ou senha inválidos." });
  }

  const token = createToken(user);
  sendAuthCookie(res, token);

  return res.json({
    user: { id: user.id, username: user.username, name: user.name },
  });
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie(authCookieName);
  res.json({ message: "Logout realizado com sucesso." });
});

app.get("/api/auth/me", authenticate, async (req, res) => {
  const [rows] = await db.query(
    "SELECT id, username, name, email FROM users WHERE id = ?",
    [req.user.userId],
  );

  if (!rows.length) {
    return res.status(401).json({ error: "Usuário não encontrado." });
  }

  return res.json({ user: rows[0] });
});

app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "E-mail é obrigatório." });
  }

  const [rows] = await db.query("SELECT id FROM users WHERE email = ?", [
    email,
  ]);

  if (!rows.length) {
    return res.json({
      message:
        "Se o e-mail existir no sistema, um token de recuperação foi gerado. Verifique a tela de redefinição.",
    });
  }

  const resetToken = crypto.randomBytes(24).toString("hex");
  const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

  await db.query(
    "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?",
    [resetToken, resetTokenExpires, rows[0].id],
  );

  return res.json({
    message: "Token de recuperação criado com sucesso.",
    resetToken,
    resetLink: `${CLIENT_URL}/?resetToken=${resetToken}`,
  });
});

app.post("/api/auth/reset-password", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res
      .status(400)
      .json({ error: "Token e nova senha são obrigatórios." });
  }

  const [rows] = await db.query(
    "SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()",
    [token],
  );

  if (!rows.length) {
    return res.status(400).json({ error: "Token inválido ou expirado." });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await db.query(
    "UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?",
    [passwordHash, rows[0].id],
  );

  return res.json({ message: "Senha redefinida com sucesso." });
});

app.get("/api/tasks", authenticate, async (req, res) => {
  const [tasks] = await db.query(
    "SELECT id, title, completed FROM tasks WHERE user_id = ? ORDER BY created_at DESC",
    [req.user.userId],
  );

  return res.json({ tasks });
});

app.post("/api/tasks", authenticate, async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Título da tarefa é obrigatório." });
  }

  await db.query("INSERT INTO tasks (user_id, title) VALUES (?, ?)", [
    req.user.userId,
    title,
  ]);

  return res.status(201).json({ message: "Tarefa criada." });
});

app.put("/api/tasks/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  const [rows] = await db.query(
    "SELECT id, completed FROM tasks WHERE id = ? AND user_id = ?",
    [id, req.user.userId],
  );

  if (!rows.length) {
    return res.status(404).json({ error: "Tarefa não encontrada." });
  }

  await db.query("UPDATE tasks SET completed = ? WHERE id = ?", [
    rows[0].completed ? 0 : 1,
    id,
  ]);

  return res.json({ message: "Tarefa atualizada." });
});

app.get("/api/settings", authenticate, async (req, res) => {
  const [rows] = await db.query(
    "SELECT focus_minutes AS focusMinutes, break_minutes AS breakMinutes, long_break_minutes AS longBreakMinutes, notifications_enabled AS notificationsEnabled FROM settings WHERE user_id = ?",
    [req.user.userId],
  );

  return res.json({ settings: rows[0] || null });
});

app.put("/api/settings", authenticate, async (req, res) => {
  const { focusMinutes, breakMinutes, longBreakMinutes, notificationsEnabled } =
    req.body;

  await db.query(
    "UPDATE settings SET focus_minutes = ?, break_minutes = ?, long_break_minutes = ?, notifications_enabled = ? WHERE user_id = ?",
    [
      focusMinutes ?? 25,
      breakMinutes ?? 5,
      longBreakMinutes ?? 15,
      notificationsEnabled ? 1 : 0,
      req.user.userId,
    ],
  );

  return res.json({ message: "Configurações atualizadas." });
});

app.listen(Number(PORT), () => {
  // eslint-disable-next-line no-console
  console.log(`API Chronos rodando em http://localhost:${PORT}`);
});
