const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_super_secret_change_me';
const TOKEN_EXPIRES_IN = '2h';
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new Database(path.join(DATA_DIR, 'app.db'));

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  passwordHash TEXT NOT NULL,
  createdAt TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  category TEXT,
  tags TEXT,
  dueDate TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  ownerId TEXT NOT NULL,
  FOREIGN KEY(ownerId) REFERENCES users(id)
);
`);

const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES = ['todo', 'in-progress', 'done'];
const CATEGORIES = ['work', 'personal', 'learning', 'home', 'health', 'finance'];
const SORT_KEYS = new Set(['title', 'priority', 'status', 'dueDate', 'createdAt']);

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
}

function authMiddleware(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function userByEmail(email) {
  return db.prepare('SELECT id, email, name, passwordHash, createdAt FROM users WHERE lower(email)=lower(?)').get(email);
}

function insertUser(u) {
  db.prepare('INSERT INTO users(id,email,name,passwordHash,createdAt) VALUES (?,?,?,?,?)').run(u.id, u.email, u.name, u.passwordHash, u.createdAt);
}

function seedTasks(count, ownerId) {
  const now = Date.now();
  const ins = db.prepare(`INSERT INTO tasks(id,title,description,status,priority,category,tags,dueDate,createdAt,updatedAt,ownerId)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  const trx = db.transaction((n) => {
    for (let i = 0; i < n; i++) {
      const createdAt = new Date(now - faker.number.int({ min: 0, max: 30 }) * 86400000);
      const dueOffsetDays = faker.number.int({ min: -10, max: 30 });
      const dueDate = new Date(createdAt.getTime() + dueOffsetDays * 86400000);
      ins.run(
        uuidv4(),
        faker.hacker.phrase(),
        faker.lorem.sentences({ min: 1, max: 3 }),
        faker.helpers.arrayElement(STATUSES),
        faker.helpers.arrayElement(PRIORITIES),
        faker.helpers.arrayElement(CATEGORIES),
        JSON.stringify(faker.helpers.arrayElements(['angular', 'ngrx', 'testing', 'bug', 'feature', 'chore', 'docs'], { min: 0, max: 3 })),
        dueDate.toISOString(),
        createdAt.toISOString(),
        createdAt.toISOString(),
        ownerId
      );
    }
  });
  trx(count);
}

function ensureDemo() {
  const existing = userByEmail('demo@demo.io');
  if (!existing) {
    const hash = bcrypt.hashSync('demo123', 10);
    const u = { id: uuidv4(), email: 'demo@demo.io', name: 'Demo User', passwordHash: hash, createdAt: new Date().toISOString() };
    insertUser(u);
    seedTasks(400, u.id);
  }
}
ensureDemo();

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password || !name) return res.status(400).json({ message: 'name, email and password are required' });
  if (userByEmail(email)) return res.status(409).json({ message: 'Email already exists' });
  const passwordHash = await bcrypt.hash(password, 10);
  const u = { id: uuidv4(), email, name, passwordHash, createdAt: new Date().toISOString() };
  insertUser(u);
  const token = signToken(u);
  res.json({ token, user: { id: u.id, email: u.email, name: u.name } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  const u = userByEmail(email || '');
  if (!u) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password || '', u.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = signToken(u);
  res.json({ token, user: { id: u.id, email: u.email, name: u.name } });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const u = db.prepare('SELECT id,email,name FROM users WHERE id=?').get(req.user.sub);
  if (!u) return res.status(404).json({ message: 'User not found' });
  res.json(u);
});

app.get('/api/tasks', authMiddleware, (req, res) => {
  let { page = '1', pageSize = '20', status, priority, category, q, dueFrom, dueTo, sortBy, sortDir } = req.query;

  const p = parseInt(String(page), 10); page = Number.isFinite(p) && p > 0 ? p : 1;
  const ps = parseInt(String(pageSize), 10); pageSize = Number.isFinite(ps) && ps > 0 ? Math.min(ps, 100) : 20;

  const sortKey = SORT_KEYS.has(String(sortBy || '').trim()) ? String(sortBy).trim() : 'createdAt';
  const dir = String(sortDir || '').trim().toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const clauses = ['ownerId = ?'];
  const params = [req.user.sub];

  if (typeof status === 'string' && status.trim() !== '') { clauses.push('status = ?'); params.push(status); }
  if (typeof priority === 'string' && priority.trim() !== '') { clauses.push('priority = ?'); params.push(priority); }
  if (typeof category === 'string' && category.trim() !== '') { clauses.push('category = ?'); params.push(category); }
  if (typeof q === 'string' && q.trim() !== '') {
    const s = `%${q.toLowerCase()}%`;
    clauses.push('(lower(title) LIKE ? OR lower(description) LIKE ?)');
    params.push(s, s);
  }
  if (typeof dueFrom === 'string' && dueFrom.trim() !== '') { clauses.push('dueDate >= ?'); params.push(new Date(dueFrom).toISOString()); }
  if (typeof dueTo === 'string' && dueTo.trim() !== '') { clauses.push('dueDate <= ?'); params.push(new Date(dueTo).toISOString()); }

  const where = `WHERE ${clauses.join(' AND ')}`;

  const total = db.prepare(`SELECT COUNT(*) AS c FROM tasks ${where}`).get(...params).c;

  const orderSql = `
    ORDER BY
      CASE WHEN ?='title' THEN title END ${dir},
      CASE WHEN ?='priority' THEN priority END ${dir},
      CASE WHEN ?='status' THEN status END ${dir},
      CASE WHEN ?='dueDate' THEN dueDate END ${dir},
      CASE WHEN ?='createdAt' THEN createdAt END ${dir},
      createdAt DESC
  `;

  const data = db.prepare(
    `SELECT * FROM tasks ${where} ${orderSql} LIMIT ? OFFSET ?`
  ).all(...params, sortKey, sortKey, sortKey, sortKey, sortKey, pageSize, (page - 1) * pageSize);

  data.forEach(t => { t.tags = t.tags ? JSON.parse(t.tags) : []; });

  res.json({ page, pageSize, total, totalPages: Math.ceil(total / pageSize), data });
});

app.post('/api/tasks', authMiddleware, (req, res) => {
  const { title, description, status = 'todo', priority = 'medium', category, tags = [], dueDate } = req.body || {};
  if (!title) return res.status(400).json({ message: 'title is required' });
  if (priority && !PRIORITIES.includes(priority)) return res.status(400).json({ message: 'invalid priority' });
  if (status && !STATUSES.includes(status)) return res.status(400).json({ message: 'invalid status' });
  const now = new Date().toISOString();
  const id = uuidv4();
  db.prepare(`INSERT INTO tasks(id,title,description,status,priority,category,tags,dueDate,createdAt,updatedAt,ownerId)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(
    id, title, description || '', status, priority, category || null, JSON.stringify(Array.isArray(tags) ? tags : []),
    dueDate ? new Date(dueDate).toISOString() : null, now, now, req.user.sub
  );
  const task = db.prepare('SELECT * FROM tasks WHERE id=?').get(id);
  task.tags = task.tags ? JSON.parse(task.tags) : [];
  res.status(201).json(task);
});

app.get('/api/tasks/:id', authMiddleware, (req, res) => {
  const t = db.prepare('SELECT * FROM tasks WHERE id=? AND ownerId=?').get(String(req.params.id), req.user.sub);
  if (!t) return res.status(404).json({ message: 'Task not found' });
  t.tags = t.tags ? JSON.parse(t.tags) : [];
  res.json(t);
});

app.put('/api/tasks/:id', authMiddleware, (req, res) => {
  const taskId = String(req.params.id);
  const existing = db.prepare('SELECT * FROM tasks WHERE id=? AND ownerId=?').get(taskId, req.user.sub);
  if (!existing) return res.status(404).json({ message: 'Task not found' });
  const allowed = ['title', 'description', 'status', 'priority', 'category', 'tags', 'dueDate'];
  const updates = { ...existing };
  for (const k of allowed) {
    if (k in req.body) {
      if (k === 'priority' && !PRIORITIES.includes(req.body[k])) return res.status(400).json({ message: 'invalid priority' });
      if (k === 'status' && !STATUSES.includes(req.body[k])) return res.status(400).json({ message: 'invalid status' });
      updates[k] = k === 'dueDate' && req.body[k] ? new Date(req.body[k]).toISOString() : k === 'tags' ? JSON.stringify(Array.isArray(req.body[k]) ? req.body[k] : []) : req.body[k];
    }
  }
  updates.updatedAt = new Date().toISOString();
  db.prepare(`UPDATE tasks SET title=?,description=?,status=?,priority=?,category=?,tags=?,dueDate=?,updatedAt=? WHERE id=? AND ownerId=?`)
    .run(updates.title, updates.description, updates.status, updates.priority, updates.category, updates.tags, updates.dueDate, updates.updatedAt, taskId, req.user.sub);
  const t = db.prepare('SELECT * FROM tasks WHERE id=?').get(taskId);
  t.tags = t.tags ? JSON.parse(t.tags) : [];
  res.json(t);
});

app.delete('/api/tasks/:id', authMiddleware, (req, res) => {
  const r = db.prepare('DELETE FROM tasks WHERE id=? AND ownerId=?').run(String(req.params.id), req.user.sub);
  if (!r.changes) return res.status(404).json({ message: 'Task not found' });
  res.json({ deleted: true, id: req.params.id });
});

app.get('/api/meta/categories', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT DISTINCT category FROM tasks WHERE ownerId=? AND category IS NOT NULL ORDER BY category').all(req.user.sub);
  res.json({ categories: rows.map(r => r.category) });
});

app.get('/api/meta/tags', authMiddleware, (req, res) => {
  const rows = db.prepare("SELECT tags FROM tasks WHERE ownerId=? AND tags IS NOT NULL AND tags <> ''").all(req.user.sub);
  const set = new Set();
  rows.forEach(r => {
    try { JSON.parse(r.tags).forEach(t => set.add(t)); } catch {}
  });
  res.json({ tags: Array.from(set).sort() });
});

app.get('/api/stats', authMiddleware, (req, res) => {
  const total = db.prepare('SELECT COUNT(*) c FROM tasks WHERE ownerId=?').get(req.user.sub).c;
  const byStatus = {};
  ['todo','in-progress','done'].forEach(s => { byStatus[s] = db.prepare('SELECT COUNT(*) c FROM tasks WHERE ownerId=? AND status=?').get(req.user.sub, s).c; });
  const byPriority = {};
  ['low','medium','high'].forEach(p => { byPriority[p] = db.prepare('SELECT COUNT(*) c FROM tasks WHERE ownerId=? AND priority=?').get(req.user.sub, p).c; });
  const cats = db.prepare('SELECT category, COUNT(*) c FROM tasks WHERE ownerId=? AND category IS NOT NULL GROUP BY category').all(req.user.sub);
  const byCategory = {};
  cats.forEach(r => byCategory[r.category] = r.c);
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const endOfDay = new Date(new Date(startOfDay).getTime() + 86400000 - 1).toISOString();
  const sevenEnd = new Date(new Date(startOfDay).getTime() + 7 * 86400000 - 1).toISOString();
  const dueToday = db.prepare('SELECT COUNT(*) c FROM tasks WHERE ownerId=? AND dueDate IS NOT NULL AND dueDate >= ? AND dueDate <= ?').get(req.user.sub, startOfDay, endOfDay).c;
  const upcoming7Days = db.prepare('SELECT COUNT(*) c FROM tasks WHERE ownerId=? AND dueDate IS NOT NULL AND dueDate > ? AND dueDate <= ?').get(req.user.sub, endOfDay, sevenEnd).c;
  const overdue = db.prepare('SELECT COUNT(*) c FROM tasks WHERE ownerId=? AND dueDate IS NOT NULL AND dueDate < ? AND status <> ?').get(req.user.sub, startOfDay, 'done').c;
  const completed = byStatus['done'] || 0;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;
  const tagCounts = {};
  db.prepare("SELECT tags FROM tasks WHERE ownerId=? AND tags IS NOT NULL AND tags <> ''").all(req.user.sub).forEach(r => {
    try { JSON.parse(r.tags).forEach(t => tagCounts[t] = (tagCounts[t] || 0) + 1); } catch {}
  });
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([tag, count]) => ({ tag, count }));
  const dateRangeRowMin = db.prepare('SELECT createdAt d FROM tasks WHERE ownerId=? ORDER BY createdAt ASC LIMIT 1').get(req.user.sub);
  const dateRangeRowMax = db.prepare('SELECT createdAt d FROM tasks WHERE ownerId=? ORDER BY createdAt DESC LIMIT 1').get(req.user.sub);
  res.json({
    total,
    byStatus,
    byPriority,
    byCategory,
    overdue,
    dueToday,
    upcoming7Days,
    completionRate,
    topTags,
    dateRange: { minCreatedAt: dateRangeRowMin ? dateRangeRowMin.d : null, maxCreatedAt: dateRangeRowMax ? dateRangeRowMax.d : null }
  });
});


app.post('/api/admin/seed', authMiddleware, (req, res) => {
  const n = parseInt(req.query.n, 10) || 400;
  db.prepare('DELETE FROM tasks WHERE ownerId=?').run(req.user.sub);
  seedTasks(n, req.user.sub);
  res.json({ seeded: n });
});

app.post('/api/public/seed-by-email', (req, res) => {
  const { email, n } = req.body || {};
  if (!email) return res.status(400).json({ message: 'email required' });
  const u = userByEmail(email);
  if (!u) return res.status(404).json({ message: 'User not found' });
  const count = parseInt(n, 10) || 400;
  const before = db.prepare('SELECT COUNT(*) c FROM tasks WHERE ownerId=?').get(u.id).c;
  db.prepare('DELETE FROM tasks WHERE ownerId=?').run(u.id);
  seedTasks(count, u.id);
  const after = db.prepare('SELECT COUNT(*) c FROM tasks WHERE ownerId=?').get(u.id).c;
  res.json({ seeded: count, userId: u.id, email: u.email, before, after });
});

app.listen(PORT, () => {
  console.log(`[dev-api] listening on http://localhost:${PORT}`);
  console.log(`Auth demo: POST /api/auth/login { email: "demo@demo.io", password: "demo123" }`);
});
