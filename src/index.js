const express = require('express');
const session = require('express-session');
const app = express();
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false
}));
app.use(express.static('public'));

const books = [
  {
    id: 1,
    title: 'The Pragmatic Programmer',
    price: 29.99,
    description: 'Timeless pragmatic advice for software developers — practical techniques and career guidance.'
  },
  {
    id: 2,
    title: 'Clean Code',
    price: 24.99,
    description: 'A handbook of agile software craftsmanship: write readable, maintainable code.'
  }
];

const orders = []; // in-memory orders
const users = []; // simple in-memory user store { id, username, password }

app.get('/health', (req, res) => res.send({ status: 'ok' }));

app.get('/books', (req, res) => res.json(books));

// return current session user info (if any)
app.get('/me', (req, res) => {
  if (req.session && req.session.user) return res.json({ user: req.session.user });
  return res.json({ user: null });
});

app.get('/books/:id', (req, res) => {
  const book = books.find(b => b.id === Number(req.params.id));
  if (!book) return res.status(404).send({ error: 'Not found' });
  res.json(book);
});

function requireAuth(req, res, next){
  if (req.session && req.session.user) return next();
  return res.status(401).send({ error: 'Unauthorized' });
}

app.post('/signin', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).send({ error: 'Invalid credentials' });
  req.session.user = { id: user.id, username: user.username };
  res.send({ ok: true, user: req.session.user });
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send({ error: 'Missing fields' });
  if (users.find(u => u.username === username)) return res.status(409).send({ error: 'User exists' });
  const user = { id: Date.now(), username, password };
  users.push(user);
  req.session.user = { id: user.id, username: user.username };
  res.status(201).send({ ok: true, user: req.session.user });
});

app.get('/signout', (req, res) => {
  // destroy session and redirect to login
  if (req.session) {
    req.session.destroy(()=>{
      res.clearCookie('connect.sid');
      res.redirect('/login.html');
    });
  } else {
    res.redirect('/login.html');
  }
});

app.post('/orders', requireAuth, (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items)) return res.status(400).send({ error: 'Invalid order' });
  const total = items.reduce((sum, it) => {
    const b = books.find(x => x.id === it.id);
    return sum + (b ? b.price * (it.qty || 1) : 0);
  }, 0);
  const order = { orderId: Date.now(), userId: req.session.user.id, items, total };
  orders.push(order);
  res.status(201).send(order);
});

app.get('/orders', requireAuth, (req, res) => {
  const mine = orders.filter(o => o.userId === req.session.user.id);
  res.json(mine);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
