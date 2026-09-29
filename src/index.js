const express = require('express');
const app = express();
app.use(express.json());

const books = [
  { id: 1, title: 'The Pragmatic Programmer', price: 29.99 },
  { id: 2, title: 'Clean Code', price: 24.99 }
];

app.get('/health', (req, res) => res.send({ status: 'ok' }));

app.get('/books', (req, res) => res.json(books));

app.get('/books/:id', (req, res) => {
  const book = books.find(b => b.id === Number(req.params.id));
  if (!book) return res.status(404).send({ error: 'Not found' });
  res.json(book);
});

app.post('/orders', (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items)) return res.status(400).send({ error: 'Invalid order' });
  const total = items.reduce((sum, it) => {
    const b = books.find(x => x.id === it.id);
    return sum + (b ? b.price * (it.qty || 1) : 0);
  }, 0);
  res.status(201).send({ orderId: Date.now(), total });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
