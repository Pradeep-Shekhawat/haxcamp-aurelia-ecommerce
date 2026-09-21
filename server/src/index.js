import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { pool } from './db.js';
import { requireAdmin, signToken } from './auth.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS origin is not allowed'));
  },
}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'aurelia-api' }));

function cleanText(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function parseProductPayload(body) {
  const name = cleanText(body.name, 180);
  const category = cleanText(body.category, 80);
  const description = cleanText(body.description, 1000);
  const image_url = cleanText(body.image_url, 1000);
  const price = Number(body.price);
  const compare_price = body.compare_price === null || body.compare_price === '' || body.compare_price === undefined ? null : Number(body.compare_price);
  const stock = Number(body.stock);
  const rating = body.rating === undefined || body.rating === '' ? 4.7 : Number(body.rating);

  if (!name || !category || !description || !image_url) throw new Error('Name, category, description, and image URL are required.');
  if (!Number.isFinite(price) || price < 0) throw new Error('Price must be a valid non-negative number.');
  if (compare_price !== null && (!Number.isFinite(compare_price) || compare_price < 0)) throw new Error('Compare price must be a valid non-negative number.');
  if (!Number.isInteger(stock) || stock < 0) throw new Error('Stock must be a non-negative whole number.');
  if (!Number.isFinite(rating) || rating < 0 || rating > 5) throw new Error('Rating must be between 0 and 5.');

  return { name, category, description, price, compare_price, stock, image_url, rating };
}

function validateOrderStatus(status) {
  if (!ORDER_STATUSES.includes(status)) throw new Error(`Invalid order status. Use one of: ${ORDER_STATUSES.join(', ')}.`);
}

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = cleanText(req.body.email, 180).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    const result = await pool.query('SELECT id,name,email,password_hash,role FROM users WHERE email=$1', [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    return res.json({ token: signToken(user), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Login failed' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const q = cleanText(req.query.q, 120);
    const category = cleanText(req.query.category, 80);
    const values = [];
    const where = [];
    if (q) { values.push(`%${q}%`); where.push(`(name ILIKE $${values.length} OR description ILIKE $${values.length})`); }
    if (category) { values.push(category); where.push(`category=$${values.length}`); }
    const sql = `SELECT * FROM products ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC`;
    const result = await pool.query(sql, values);
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not load products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'Invalid product id' });
    const result = await pool.query('SELECT * FROM products WHERE id=$1', [id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'Product not found' });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not load product' });
  }
});

app.post('/api/products', requireAdmin, async (req, res) => {
  try {
    const product = parseProductPayload(req.body);
    const slug = (product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()).slice(0, 190);
    const result = await pool.query(`INSERT INTO products (name,slug,category,description,price,compare_price,stock,image_url,rating) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`, [product.name, slug, product.category, product.description, product.price, product.compare_price, product.stock, product.image_url, product.rating]);
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err.message || 'Could not create product' });
  }
});

app.put('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'Invalid product id' });
    const product = parseProductPayload(req.body);
    const result = await pool.query(`UPDATE products SET name=$1,category=$2,description=$3,price=$4,compare_price=$5,stock=$6,image_url=$7,rating=$8,updated_at=NOW() WHERE id=$9 RETURNING *`, [product.name, product.category, product.description, product.price, product.compare_price, product.stock, product.image_url, product.rating, id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'Product not found' });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err.message || 'Could not update product' });
  }
});

app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'Invalid product id' });
    const result = await pool.query('DELETE FROM products WHERE id=$1 RETURNING id', [id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'Product not found' });
    return res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    if (err.code === '23503') return res.status(409).json({ message: 'This product cannot be deleted because it is referenced by an existing order.' });
    return res.status(500).json({ message: 'Could not delete product' });
  }
});

app.post('/api/orders', async (req, res) => {
  const client = await pool.connect();
  try {
    const customer_name = cleanText(req.body.customer_name, 120);
    const customer_email = cleanText(req.body.customer_email, 180).toLowerCase();
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    if (!customer_name || !customer_email || !/^\S+@\S+\.\S+$/.test(customer_email) || !items.length) {
      return res.status(400).json({ message: 'Valid customer details and at least one item are required.' });
    }

    const aggregated = new Map();
    for (const item of items) {
      const productId = Number(item.product_id);
      const quantity = Number(item.quantity);
      if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return res.status(400).json({ message: 'Each order item must include a valid product id and quantity.' });
      }
      aggregated.set(productId, (aggregated.get(productId) || 0) + quantity);
    }

    await client.query('BEGIN');
    const ids = [...aggregated.keys()];
    const productResult = await client.query('SELECT id,name,price,stock FROM products WHERE id=ANY($1::int[]) FOR UPDATE', [ids]);
    const byId = new Map(productResult.rows.map((product) => [product.id, product]));

    let subtotal = 0;
    for (const [productId, quantity] of aggregated) {
      const product = byId.get(productId);
      if (!product) throw new Error(`Product ${productId} is no longer available.`);
      if (product.stock < quantity) throw new Error(`${product.name} has only ${product.stock} item${product.stock === 1 ? '' : 's'} left in stock.`);
      subtotal += Number(product.price) * quantity;
    }

    const delivery = subtotal >= 5000 ? 0 : 199;
    const total = subtotal + delivery;
    const order = await client.query(`INSERT INTO orders (customer_name,customer_email,total_amount,status) VALUES ($1,$2,$3,'Pending') RETURNING *`, [customer_name, customer_email, total]);

    for (const [productId, quantity] of aggregated) {
      const product = byId.get(productId);
      await client.query('INSERT INTO order_items (order_id,product_id,quantity,unit_price) VALUES ($1,$2,$3,$4)', [order.rows[0].id, product.id, quantity, product.price]);
      await client.query('UPDATE products SET stock=stock-$1, updated_at=NOW() WHERE id=$2', [quantity, product.id]);
    }

    await client.query('COMMIT');
    return res.status(201).json(order.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    return res.status(400).json({ message: err.message || 'Order failed' });
  } finally {
    client.release();
  }
});

app.get('/api/admin/overview', requireAdmin, async (_req, res) => {
  try {
    const [sales, orders, activeOrders, products, lowStock, inventory, topProducts, recent, statusBreakdown] = await Promise.all([
      pool.query("SELECT COALESCE(SUM(total_amount),0) AS revenue FROM orders WHERE status <> 'Cancelled'"),
      pool.query('SELECT COUNT(*)::int AS count FROM orders'),
      pool.query("SELECT COUNT(*)::int AS count FROM orders WHERE status <> 'Cancelled'"),
      pool.query('SELECT COUNT(*)::int AS count FROM products'),
      pool.query('SELECT COUNT(*)::int AS count FROM products WHERE stock <= 10'),
      pool.query('SELECT COALESCE(SUM(stock),0)::int AS units FROM products'),
      pool.query(`SELECT p.name,SUM(oi.quantity)::int AS units,SUM(oi.quantity*oi.unit_price) AS revenue FROM order_items oi JOIN products p ON p.id=oi.product_id JOIN orders o ON o.id=oi.order_id WHERE o.status <> 'Cancelled' GROUP BY p.id ORDER BY revenue DESC LIMIT 5`),
      pool.query('SELECT id,customer_name,total_amount,status,created_at FROM orders ORDER BY created_at DESC LIMIT 8'),
      pool.query(`SELECT status,COUNT(*)::int AS count FROM orders GROUP BY status ORDER BY count DESC`),
    ]);

    const [monthly, categories] = await Promise.all([
      pool.query(`SELECT TO_CHAR(months.month, 'Mon') AS month, COALESCE(SUM(CASE WHEN o.status <> 'Cancelled' THEN o.total_amount ELSE 0 END),0) AS revenue, COUNT(o.id)::int AS orders FROM generate_series(DATE_TRUNC('month', NOW()) - INTERVAL '5 months', DATE_TRUNC('month', NOW()), INTERVAL '1 month') AS months(month) LEFT JOIN orders o ON DATE_TRUNC('month', o.created_at) = months.month GROUP BY months.month ORDER BY months.month`),
      pool.query(`SELECT p.category,COALESCE(SUM(oi.quantity*oi.unit_price),0) AS revenue FROM order_items oi JOIN products p ON p.id=oi.product_id JOIN orders o ON o.id=oi.order_id WHERE o.status <> 'Cancelled' GROUP BY p.category ORDER BY revenue DESC`),
    ]);

    const totalOrders = orders.rows[0].count;
    const avgOrderValue = activeOrders.rows[0].count ? Number(sales.rows[0].revenue) / Number(activeOrders.rows[0].count) : 0;
    return res.json({
      revenue: Number(sales.rows[0].revenue), orders: totalOrders, products: products.rows[0].count, lowStock: lowStock.rows[0].count, totalInventoryUnits: inventory.rows[0].units, avgOrderValue,
      monthly: monthly.rows.map((row) => ({ month: row.month, revenue: Number(row.revenue), orders: row.orders })),
      categories: categories.rows.map((row) => ({ category: row.category, revenue: Number(row.revenue) })),
      topProducts: topProducts.rows.map((row) => ({ name: row.name, units: row.units, revenue: Number(row.revenue) })),
      statusBreakdown: statusBreakdown.rows.map((row) => ({ status: row.status, count: row.count })),
      recent: recent.rows,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not load dashboard' });
  }
});

app.get('/api/admin/orders', requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(`SELECT o.*, COALESCE(json_agg(json_build_object('product_id',oi.product_id,'name',p.name,'quantity',oi.quantity,'unit_price',oi.unit_price)) FILTER (WHERE oi.id IS NOT NULL),'[]') items FROM orders o LEFT JOIN order_items oi ON oi.order_id=o.id LEFT JOIN products p ON p.id=oi.product_id GROUP BY o.id ORDER BY o.created_at DESC`);
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not load orders' });
  }
});

app.patch('/api/admin/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ message: 'Invalid order id' });
    try { validateOrderStatus(req.body.status); } catch (err) { return res.status(400).json({ message: err.message }); }
    const result = await pool.query('UPDATE orders SET status=$1 WHERE id=$2 RETURNING *', [req.body.status, id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'Order not found' });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Could not update order' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Aurelia API running on port ${PORT}`);
});
