import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { pool } from './db.js';

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const products = [
  ['Aurelia Air Buds Pro','aurelia-air-buds-pro','Audio','Immersive wireless earbuds with adaptive noise cancellation and a compact charging case.',8999,10999,24,'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=85',4.8],
  ['Aurelia Pulse Watch','aurelia-pulse-watch','Wearables','Minimal fitness smartwatch with AMOLED display, sleep tracking and 7-day battery.',12999,14999,17,'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85',4.7],
  ['Aurelia Core Laptop','aurelia-core-laptop','Computing','Slim productivity laptop designed for everyday creators and developers.',69999,74999,8,'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85',4.9],
  ['Aurelia Arc Headphones','aurelia-arc-headphones','Audio','Premium over-ear headphones with rich sound, comfort and long battery life.',15999,17999,12,'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85',4.8],
  ['Aurelia One Phone','aurelia-one-phone','Mobile','Flagship-inspired smartphone experience with a vivid display and pro camera system.',54999,59999,6,'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85',4.6],
  ['Aurelia Dock Mini','aurelia-dock-mini','Accessories','Compact USB-C desk dock for a clean, productive workstation.',5499,6499,31,'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=900&q=85',4.5]
];

async function main() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in server/.env before running the seed script.');
  if (ADMIN_PASSWORD.length < 8) throw new Error('ADMIN_PASSWORD must be at least 8 characters long.');

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await pool.query(`INSERT INTO users (name,email,password_hash,role) VALUES ($1,$2,$3,'admin') ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash`, ['Aurelia Admin', ADMIN_EMAIL, passwordHash]);

  for (const product of products) {
    await pool.query(`INSERT INTO products (name,slug,category,description,price,compare_price,stock,image_url,rating) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (slug) DO NOTHING`, product);
  }

  const existingOrders = await pool.query('SELECT COUNT(*)::int AS count FROM orders');
  if (existingOrders.rows[0].count === 0) {
    const productRows = await pool.query('SELECT id,slug,price FROM products');
    const bySlug = new Map(productRows.rows.map((row) => [row.slug, row]));
    const demoOrders = [
      { name:'Aarav Mehta', email:'aarav.demo@example.com', status:'Delivered', months:5, items:[['aurelia-core-laptop',1]] },
      { name:'Ishita Shah', email:'ishita.demo@example.com', status:'Delivered', months:4, items:[['aurelia-air-buds-pro',2],['aurelia-dock-mini',1]] },
      { name:'Rohan Kulkarni', email:'rohan.demo@example.com', status:'Shipped', months:3, items:[['aurelia-pulse-watch',1],['aurelia-arc-headphones',1]] },
      { name:'Neha Joshi', email:'neha.demo@example.com', status:'Processing', months:2, items:[['aurelia-one-phone',1]] },
      { name:'Kabir Malhotra', email:'kabir.demo@example.com', status:'Pending', months:1, items:[['aurelia-dock-mini',2],['aurelia-air-buds-pro',1]] },
      { name:'Sana Kapoor', email:'sana.demo@example.com', status:'Cancelled', months:0, items:[['aurelia-core-laptop',1]] }
    ];
    for (const order of demoOrders) {
      let subtotal = 0;
      const resolved = order.items.map(([slug, quantity]) => {
        const product = bySlug.get(slug);
        if (!product) throw new Error(`Seed product missing: ${slug}`);
        subtotal += Number(product.price) * quantity;
        return { product, quantity };
      });
      const delivery = subtotal >= 5000 ? 0 : 199;
      const total = subtotal + delivery;
      const createdAt = order.months === 0 ? `NOW() - INTERVAL '10 days'` : `NOW() - INTERVAL '${order.months} months'`;
      const orderResult = await pool.query(`INSERT INTO orders (customer_name,customer_email,total_amount,status,created_at) VALUES ($1,$2,$3,$4,${createdAt}) RETURNING id`, [order.name, order.email, total, order.status]);
      for (const item of resolved) await pool.query('INSERT INTO order_items (order_id,product_id,quantity,unit_price) VALUES ($1,$2,$3,$4)', [orderResult.rows[0].id, item.product.id, item.quantity, item.product.price]);
    }
    console.log('Demo orders seeded for dashboard analytics.');
  }

  console.log(`Seed complete. Admin: ${ADMIN_EMAIL}`);
  await pool.end();
}

main().catch(async (err) => { console.error(err); await pool.end(); process.exit(1); });
