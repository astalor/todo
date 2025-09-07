const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_super_secret_change_me';
const TOKEN_EXPIRES_IN = '2h';

const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES = ['todo', 'in-progress', 'done'];
const CATEGORIES = ['work', 'personal', 'learning', 'home', 'health', 'finance'];

const db = { users: [], tasks: [] };

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

function seedTasks(count, ownerId) {
  const tasks = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const createdAt = new Date(now - faker.number.int({ min: 0, max: 30 }) * 86400000);
    const dueOffsetDays = faker.number.int({ min: -10, max: 30 });
    const dueDate = new Date(createdAt.getTime() + dueOffsetDays * 86400000);
    tasks.push({
      id: uuidv4(),
      title: faker.hacker.phrase(),
      description: faker.lorem.sentences({ min: 1, max: 3 }),
      status: faker.helpers.arrayElement(STATUSES),
      priority: faker.helpers.arrayElement(PRIORITIES),
      category: faker.helpers.arrayElement(CATEGORIES),
      tags: faker.helpers.arrayElements(['angular', 'ngrx', 'testing', 'bug', 'feature', 'chore', 'docs'], { min: 0, max: 3 }),
      dueDate: dueDate.toISOString(),
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
      ownerId
    });
  }
  return tasks;
}

function distinct(values) {
  return Array.from(new Set(values)).filter(v => v != null);
}

function ensureSeedForUser(userId, n = 400) {
  if (!db.tasks.some(t => t.ownerId === userId)) {
    db.tasks = db.tasks.concat(seedTasks(n, userId));
  }
}

(function bootstrap() {
  const hash = bcrypt.hashSync('demo123', 10);
  const demoUser = { id: uuidv4(), email: 'demo@demo.io', name: 'Demo User', passwordHash: hash, createdAt: new Date().toISOString() };
  db.users.push(demoUser);
  db.tasks = seedTasks(400, demoUser.id);
})();

app.post('/api/public/seed-by-email', (req, res) => {
  const { email, n } = req.body || {};
  if (!email) return res.status(400).json({ message: 'email required' });
  const user = db.users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
  if (!user) return res.status(404).json({ message: 'User not found' });
  const count = parseInt(n, 10) || 400;
  const before = db.tasks.filter(t => t.ownerId === user.id).length;
  db.tasks = db.tasks.filter(t => t.ownerId !== user.id).concat(seedTasks(count, user.id));
  const after = db.tasks.filter(t => t.ownerId === user.id).length;
  res.json({ seeded: count, userId: user.id, email: user.email, before, after });
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password || !name) return res.status(400).json({ message: 'name, email and password are required' });
  if (db.users.some(u => u.email.toLowerCase() === String(email).toLowerCase())) return res.status(409).json({ message: 'Email already exists' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: uuidv4(), email, name, passwordHash, createdAt: new Date().toISOString() };
  db.users.push(user);
  const token = signToken(user);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = db.users.find(u => u.email.toLowerCase() === String(email || '').toLowerCase());
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password || '', user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = signToken(user);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = db.users.find(u => u.id === req.user.sub);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ id: user.id, email: user.email, name: user.name });
});

app.get('/api/tasks', authMiddleware, (req, res) => {
  let {
    page = '1',
    pageSize = '20',
    status,
    priority,
    category,
    q,
    dueFrom,
    dueTo,
    sortBy = 'createdAt',
    sortDir = 'desc'
  } = req.query;

  page = parseInt(page, 10) || 1;
  pageSize = Math.min(100, parseInt(pageSize, 10) || 20);
  sortDir = (String(sortDir).toLowerCase() === 'asc') ? 'asc' : 'desc';

  let items = db.tasks.filter(t => t.ownerId === req.user.sub);

  if (status) items = items.filter(t => t.status === status);
  if (priority) items = items.filter(t => t.priority === priority);
  if (category) items = items.filter(t => t.category === category);
  if (q) {
    const s = String(q).toLowerCase();
    items = items.filter(t => t.title.toLowerCase().includes(s) || (t.description || '').toLowerCase().includes(s));
  }
  if (dueFrom) {
    const from = new Date(dueFrom).getTime();
    items = items.filter(t => t.dueDate && new Date(t.dueDate).getTime() >= from);
  }
  if (dueTo) {
    const to = new Date(dueTo).getTime();
    items = items.filter(t => t.dueDate && new Date(t.dueDate).getTime() <= to);
  }

  const validSort = new Set(['title', 'priority', 'status', 'dueDate', 'createdAt']);
  if (!validSort.has(sortBy)) sortBy = 'createdAt';
  items.sort((a, b) => {
    const av = a[sortBy];
    const bv = b[sortBy];
    if (av === bv) return 0;
    return (av > bv ? 1 : -1) * (sortDir === 'asc' ? 1 : -1);
  });

  const total = items.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const data = items.slice(start, end);

  res.json({ page, pageSize, total, totalPages: Math.ceil(total / pageSize), data });
});

app.post('/api/tasks', authMiddleware, (req, res) => {
  const { title, description, status = 'todo', priority = 'medium', category, tags = [], dueDate } = req.body || {};
  if (!title) return res.status(400).json({ message: 'title is required' });
  if (priority && !PRIORITIES.includes(priority)) return res.status(400).json({ message: 'invalid priority' });
  if (status && !STATUSES.includes(status)) return res.status(400).json({ message: 'invalid status' });

  const now = new Date().toISOString();
  const task = {
    id: uuidv4(),
    title,
    description: description || '',
    status,
    priority,
    category: category || null,
    tags: Array.isArray(tags) ? tags : [],
    dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    createdAt: now,
    updatedAt: now,
    ownerId: req.user.sub
  };
  db.tasks.unshift(task);
  res.status(201).json(task);
});

app.get('/api/tasks/:id', authMiddleware, (req, res) => {
  const task = db.tasks.find(t => t.id === req.params.id && t.ownerId === req.user.sub);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
});

app.put('/api/tasks/:id', authMiddleware, (req, res) => {
  const idx = db.tasks.findIndex(t => t.id === req.params.id && t.ownerId === req.user.sub);
  if (idx < 0) return res.status(404).json({ message: 'Task not found' });

  const allowed = ['title', 'description', 'status', 'priority', 'category', 'tags', 'dueDate'];
  const updated = { ...db.tasks[idx] };
  for (const key of allowed) {
    if (key in req.body) {
      if (key === 'priority' && !PRIORITIES.includes(req.body[key])) return res.status(400).json({ message: 'invalid priority' });
      if (key === 'status' && !STATUSES.includes(req.body[key])) return res.status(400).json({ message: 'invalid status' });
      updated[key] = key === 'dueDate' && req.body[key] ? new Date(req.body[key]).toISOString() : req.body[key];
    }
  }
  updated.updatedAt = new Date().toISOString();
  db.tasks[idx] = updated;
  res.json(updated);
});

app.delete('/api/tasks/:id', authMiddleware, (req, res) => {
  const idx = db.tasks.findIndex(t => t.id === req.params.id && t.ownerId === req.user.sub);
  if (idx < 0) return res.status(404).json({ message: 'Task not found' });
  const [removed] = db.tasks.splice(idx, 1);
  res.json({ deleted: true, id: removed.id });
});

app.get('/api/meta/categories', authMiddleware, (req, res) => {
  const items = db.tasks.filter(t => t.ownerId === req.user.sub);
  const categories = distinct(items.map(t => t.category).filter(Boolean)).sort();
  res.json({ categories });
});

app.get('/api/meta/tags', authMiddleware, (req, res) => {
  const items = db.tasks.filter(t => t.ownerId === req.user.sub);
  const tagSet = new Set();
  for (const t of items) {
    if (Array.isArray(t.tags)) for (const tag of t.tags) tagSet.add(tag);
  }
  const tags = Array.from(tagSet).sort();
  res.json({ tags });
});

app.get('/api/stats', authMiddleware, (req, res) => {
  const items = db.tasks.filter(t => t.ownerId === req.user.sub);
  const total = items.length;
  const byStatus = STATUSES.reduce((acc, s) => ((acc[s] = items.filter(t => t.status === s).length), acc), {});
  const byPriority = PRIORITIES.reduce((acc, p) => ((acc[p] = items.filter(t => t.priority === p).length), acc), {});
  const categories = {};
  for (const c of distinct(items.map(t => t.category))) categories[c] = items.filter(t => t.category === c).length;
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfDay = startOfDay + 86400000 - 1;
  const dueToday = items.filter(t => t.dueDate && new Date(t.dueDate).getTime() >= startOfDay && new Date(t.dueDate).getTime() <= endOfDay).length;
  const upcoming7DaysTo = startOfDay + 7 * 86400000 - 1;
  const upcoming7Days = items.filter(t => t.dueDate && new Date(t.dueDate).getTime() > endOfDay && new Date(t.dueDate).getTime() <= upcoming7DaysTo).length;
  const overdue = items.filter(t => t.dueDate && new Date(t.dueDate).getTime() < startOfDay && t.status !== 'done').length;
  const completed = byStatus['done'] || 0;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;
  const tagCounts = {};
  for (const t of items) {
    if (Array.isArray(t.tags)) for (const tag of t.tags) tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  }
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([tag, count]) => ({ tag, count }));
  res.json({
    total,
    byStatus,
    byPriority,
    byCategory: categories,
    overdue,
    dueToday,
    upcoming7Days,
    completionRate,
    topTags,
    dateRange: {
      minCreatedAt: items.length ? items.reduce((a, t) => (a < t.createdAt ? a : t.createdAt), items[0].createdAt) : null,
      maxCreatedAt: items.length ? items.reduce((a, t) => (a > t.createdAt ? a : t.createdAt), items[0].createdAt) : null
    }
  });
});

app.post('/api/admin/seed', authMiddleware, (req, res) => {
  const n = parseInt(req.query.n, 10) || 400;
  db.tasks = db.tasks.filter(t => t.ownerId !== req.user.sub).concat(seedTasks(n, req.user.sub));
  res.json({ seeded: n });
});

app.listen(PORT, () => {
  console.log(`[dev-api] listening on http://localhost:${PORT}`);
  console.log(`Auth demo: POST /api/auth/login { email: "demo@demo.io", password: "demo123" }`);
});
