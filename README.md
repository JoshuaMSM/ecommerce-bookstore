# Bookstore Backend (Demo)

A minimal Node.js + Express backend for an eCommerce bookstore demo.

Quick start:

```bash
npm install
npm start
```

Endpoints:
- `GET /health` - health check
- `GET /books` - list books
- `GET /books/:id` - get book details
- `POST /orders` - create a simple order `{ "items": [{ "id": 1, "qty": 2 }] }`

Static UI:
- Open `public/index.html` via the running server: http://localhost:3000/

New endpoints:
- `GET /orders` - list created orders (in-memory)
- `POST /orders` - returns full order object `{ orderId, items, total }`

Video script available in `VIDEO_SCRIPT.md`.
