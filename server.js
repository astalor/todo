// server.js
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
  categories TEXT,
  tags TEXT,
  dueDate TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  ownerId TEXT NOT NULL,
  FOREIGN KEY(ownerId) REFERENCES users(id)
);
`);
const cols = db.prepare('PRAGMA table_info(tasks)').all().map(r => r.name);
if (!cols.includes('categories')) db.exec('ALTER TABLE tasks ADD COLUMN categories TEXT');

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
  const ins = db.prepare(`INSERT INTO tasks(id,title,description,status,priority,category,categories,tags,dueDate,createdAt,updatedAt,ownerId)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
  const trx = db.transaction((n) => {
    for (let i = 0; i < n; i++) {
      const createdAt = new Date(now - faker.number.int({ min: 0, max: 30 }) * 86400000);
      const dueOffsetDays = faker.number.int({ min: -10, max: 30 });
      const dueDate = new Date(createdAt.getTime() + dueOffsetDays * 86400000);
      const catsArr = faker.helpers.arrayElements(CATEGORIES, { min: 1, max: 2 });
      const firstCat = catsArr[0] || null;
      ins.run(
        uuidv4(),
        faker.hacker.phrase(),
        faker.lorem.sentences({ min: 1, max: 3 }),
        faker.helpers.arrayElement(STATUSES),
        faker.helpers.arrayElement(PRIORITIES),
        firstCat,
        JSON.stringify(catsArr),
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
  let { page = '1', pageSize = '20', status, priority, category, tags, q, dueFrom, dueTo, sortBy, sortDir, excludeDone } = req.query;
  const p = parseInt(String(page), 10); page = Number.isFinite(p) && p > 0 ? p : 1;
  const ps = parseInt(String(pageSize), 10); pageSize = Number.isFinite(ps) && ps > 0 ? Math.min(ps, 100) : 20;
  const sortKey = SORT_KEYS.has(String(sortBy || '').trim()) ? String(sortBy).trim() : 'createdAt';
  const dir = String(sortDir || '').trim().toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const clauses = ['ownerId = ?'];
  const params = [req.user.sub];

  if (typeof status === 'string' && status.trim() !== '') { clauses.push('status = ?'); params.push(status); }
  if (typeof priority === 'string' && priority.trim() !== '') { clauses.push('priority = ?'); params.push(priority); }
  if (String(excludeDone || '').toLowerCase() === 'true') { clauses.push('status <> ?'); params.push('done'); }
  if (typeof q === 'string' && q.trim() !== '') {
    const s = `%${q.toLowerCase()}%`;
    clauses.push('(lower(title) LIKE ? OR lower(description) LIKE ?)');
    params.push(s, s);
  }
  if (typeof dueFrom === 'string' && dueFrom.trim() !== '') { clauses.push('dueDate >= ?'); params.push(new Date(dueFrom).toISOString()); }
  if (typeof dueTo === 'string' && dueTo.trim() !== '') { clauses.push('dueDate <= ?'); params.push(new Date(dueTo).toISOString()); }

  if (typeof category === 'string' && category.trim() !== '') {
    const cats = String(category).split(',').map(s => s.trim()).filter(Boolean);
    if (cats.length) {
      clauses.push(`EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(categories) THEN categories ELSE json_array(category) END) je WHERE je.value IN (${cats.map(() => '?').join(',')}))`);
      params.push(...cats);
    }
  }

  if (typeof tags === 'string' && tags.trim() !== '') {
    const tgs = String(tags).split(',').map(s => s.trim()).filter(Boolean);
    if (tgs.length) {
      clauses.push(`(SELECT COUNT(DISTINCT je.value) FROM json_each(CASE WHEN json_valid(tags) THEN tags ELSE '[]' END) je WHERE je.value IN (${tgs.map(() => '?').join(',')})) = ?`);
      params.push(...tgs, tgs.length);
    }
  }

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

  data.forEach(t => {
    t.tags = t.tags ? JSON.parse(t.tags) : [];
    if (t.categories && t.categories.trim() !== '' && t.categories.trim() !== 'null') {
      try { t.categories = JSON.parse(t.categories); } catch { t.categories = []; }
    } else {
      t.categories = t.category ? [t.category] : [];
    }
  });

  res.json({ page, pageSize, total, totalPages: Math.ceil(total / pageSize), data });
});

app.post('/api/tasks', authMiddleware, (req, res) => {
  const { title, description, status = 'todo', priority = 'medium', category, categories = [], tags = [], dueDate } = req.body || {};
  if (!title) return res.status(400).json({ message: 'title is required' });
  if (priority && !PRIORITIES.includes(priority)) return res.status(400).json({ message: 'invalid priority' });
  if (status && !STATUSES.includes(status)) return res.status(400).json({ message: 'invalid status' });
  const catsArr = Array.isArray(categories) ? categories : (category ? [category] : []);
  const mainCat = catsArr[0] || null;
  const now = new Date().toISOString();
  const id = uuidv4();
  db.prepare(`INSERT INTO tasks(id,title,description,status,priority,category,categories,tags,dueDate,createdAt,updatedAt,ownerId)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    id,
    title,
    description || '',
    status,
    priority,
    mainCat,
    JSON.stringify(catsArr),
    JSON.stringify(Array.isArray(tags) ? tags : []),
    dueDate ? new Date(dueDate).toISOString() : null,
    now,
    now,
    req.user.sub
  );
  const task = db.prepare('SELECT * FROM tasks WHERE id=?').get(id);
  task.tags = task.tags ? JSON.parse(task.tags) : [];
  task.categories = task.categories ? JSON.parse(task.categories) : (task.category ? [task.category] : []);
  res.status(201).json(task);
});

app.get('/api/tasks/:id', authMiddleware, (req, res) => {
  const t = db.prepare('SELECT * FROM tasks WHERE id=? AND ownerId=?').get(String(req.params.id), req.user.sub);
  if (!t) return res.status(404).json({ message: 'Task not found' });
  t.tags = t.tags ? JSON.parse(t.tags) : [];
  t.categories = t.categories ? JSON.parse(t.categories) : (t.category ? [t.category] : []);
  res.json(t);
});

app.put('/api/tasks/:id', authMiddleware, (req, res) => {
  const taskId = String(req.params.id);
  const existing = db.prepare('SELECT * FROM tasks WHERE id=? AND ownerId=?').get(taskId, req.user.sub);
  if (!existing) return res.status(404).json({ message: 'Task not found' });
  const allowed = ['title', 'description', 'status', 'priority', 'category', 'categories', 'tags', 'dueDate'];
  const updates = { ...existing };
  for (const k of allowed) {
    if (k in req.body) {
      if (k === 'priority' && !PRIORITIES.includes(req.body[k])) return res.status(400).json({ message: 'invalid priority' });
      if (k === 'status' && !STATUSES.includes(req.body[k])) return res.status(400).json({ message: 'invalid status' });
      if (k === 'tags') updates.tags = JSON.stringify(Array.isArray(req.body.tags) ? req.body.tags : []);
      else if (k === 'categories') {
        const arr = Array.isArray(req.body.categories) ? req.body.categories : [];
        updates.categories = JSON.stringify(arr);
        updates.category = arr[0] || null;
      } else if (k === 'category') {
        updates.category = req.body.category || null;
        const arr = updates.categories ? JSON.parse(updates.categories) : [];
        if (!arr.length && updates.category) updates.categories = JSON.stringify([updates.category]);
      } else if (k === 'dueDate') updates.dueDate = req.body.dueDate ? new Date(req.body.dueDate).toISOString() : null;
      else updates[k] = req.body[k];
    }
  }
  updates.updatedAt = new Date().toISOString();
  db.prepare(`UPDATE tasks SET title=?,description=?,status=?,priority=?,category=?,categories=?,tags=?,dueDate=?,updatedAt=? WHERE id=? AND ownerId=?`)
    .run(updates.title, updates.description, updates.status, updates.priority, updates.category || null, updates.categories || JSON.stringify([]), updates.tags || JSON.stringify([]), updates.dueDate || null, updates.updatedAt, taskId, req.user.sub);
  const t = db.prepare('SELECT * FROM tasks WHERE id=?').get(taskId);
  t.tags = t.tags ? JSON.parse(t.tags) : [];
  t.categories = t.categories ? JSON.parse(t.categories) : (t.category ? [t.category] : []);
  res.json(t);
});

app.delete('/api/tasks/:id', authMiddleware, (req, res) => {
  const r = db.prepare('DELETE FROM tasks WHERE id=? AND ownerId=?').run(String(req.params.id), req.user.sub);
  if (!r.changes) return res.status(404).json({ message: 'Task not found' });
  res.json({ deleted: true, id: req.params.id });
});

app.get('/api/meta/categories', authMiddleware, (req, res) => {
  const rows = db.prepare(`
    SELECT value AS category, COUNT(*) c
    FROM tasks, json_each(CASE WHEN json_valid(categories) THEN categories ELSE json_array(category) END)
    WHERE ownerId=?
    GROUP BY value
    ORDER BY c DESC
  `).all(req.user.sub);
  res.json({ categories: rows.map(r => r.category) });
});

app.get('/api/meta/tags', authMiddleware, (req, res) => {
  const rows = db.prepare("SELECT tags FROM tasks WHERE ownerId=? AND tags IS NOT NULL AND tags <> ''").all(req.user.sub);
  const set = new Set();
  rows.forEach(r => { try { JSON.parse(r.tags).forEach(t => set.add(t)); } catch {} });
  res.json({ tags: Array.from(set).sort() });
});

app.get('/api/stats', authMiddleware, (req, res) => {
  const total = db.prepare('SELECT COUNT(*) c FROM tasks WHERE ownerId=?').get(req.user.sub).c;
  const byStatus = {};
  STATUSES.forEach(s => { byStatus[s] = db.prepare('SELECT COUNT(*) c FROM tasks WHERE ownerId=? AND status=?').get(req.user.sub, s).c; });
  const byPriority = {};
  PRIORITIES.forEach(p => { byPriority[p] = db.prepare('SELECT COUNT(*) c FROM tasks WHERE ownerId=? AND priority=?').get(req.user.sub, p).c; });
  const cats = db.prepare(`
    SELECT value AS category, COUNT(*) c
    FROM tasks, json_each(CASE WHEN json_valid(categories) THEN categories ELSE json_array(category) END)
    WHERE ownerId=?
    GROUP BY value
  `).all(req.user.sub);
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
