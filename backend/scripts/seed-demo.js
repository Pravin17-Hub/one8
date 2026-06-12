import pool from '../src/config/db.js';

async function seed() {
  const existing = await pool.query(
    "SELECT id FROM products WHERE title = 'One8 Demo Headphones' LIMIT 1"
  );
  if (existing.rows.length > 0) {
    console.log('Demo products already exist. Skipping seed.');
    await pool.end();
    return;
  }

  const sellerResult = await pool.query(
    "SELECT id FROM users WHERE role IN ('SELLER', 'ADMIN') LIMIT 1"
  );
  let sellerId = sellerResult.rows[0]?.id;

  if (!sellerId) {
    const anyUser = await pool.query('SELECT id FROM users ORDER BY created_at LIMIT 1');
    sellerId = anyUser.rows[0]?.id;
    if (!sellerId) {
      console.log('No users found. Register an account first, then run: npm run seed:demo');
      await pool.end();
      return;
    }
    console.log('No seller found — attaching demo store to first registered user.');
  }

  let storeId = (
    await pool.query('SELECT id FROM stores WHERE owner_id = $1 LIMIT 1', [sellerId])
  ).rows[0]?.id;

  if (!storeId) {
    const store = await pool.query(
      `INSERT INTO stores (owner_id, name, description)
       VALUES ($1, 'One8 Demo Store', 'Sample products for testing checkout')
       RETURNING id`,
      [sellerId]
    );
    storeId = store.rows[0].id;
  }

  const products = [
    {
      title: 'One8 Demo Headphones',
      description: 'Premium wireless headphones with AI-tuned sound.',
      price: 349.0,
      stock: 25,
      score: 98,
    },
    {
      title: 'Smart Watch Pro',
      description: 'Fitness tracking and notifications on your wrist.',
      price: 199.99,
      stock: 40,
      score: 92,
    },
    {
      title: 'Minimalist Desk Lamp',
      description: 'Adjustable LED lamp for your workspace.',
      price: 79.5,
      stock: 60,
      score: 85,
    },
  ];

  for (const p of products) {
    const result = await pool.query(
      `INSERT INTO products (store_id, title, description, price, stock_quantity, status, ai_match_score)
       VALUES ($1, $2, $3, $4, $5, 'ACTIVE', $6)
       RETURNING id`,
      [storeId, p.title, p.description, p.price, p.stock, p.score]
    );
    await pool.query(
      `INSERT INTO product_images (product_id, image_url, is_primary)
       VALUES ($1, $2, true)`,
      [
        result.rows[0].id,
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      ]
    );
  }

  await pool.end();
  console.log(`Seeded ${products.length} demo products.`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
