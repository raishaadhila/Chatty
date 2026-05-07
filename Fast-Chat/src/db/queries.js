const db = require('./index');

const products = {
  getAll: () => db.prepare('SELECT * FROM products ORDER BY category, name').all(),
  search: (term) => {
    const p = `%${term}%`;
    return db.prepare('SELECT * FROM products WHERE name LIKE ? OR category LIKE ? OR subcategory LIKE ? OR description LIKE ? OR shade LIKE ?').all(p, p, p, p, p);
  },
  getByCategory: (cat) => db.prepare('SELECT * FROM products WHERE category = ? ORDER BY name').all(cat),
};

const stock = {
  getAll: () => db.prepare(`
    SELECT p.id, p.sku, p.name, p.category, p.subcategory, p.price, p.shade,
           s.quantity, s.unit, s.reorder_threshold,
           CASE WHEN s.quantity = 0 THEN 'Out of Stock'
                WHEN s.quantity <= s.reorder_threshold THEN 'Low Stock'
                ELSE 'In Stock' END as status
    FROM products p LEFT JOIN stock s ON p.id = s.product_id
    ORDER BY p.category, p.name
  `).all(),
  getByProductId: (id) => db.prepare(`
    SELECT p.*, s.quantity, s.unit, s.reorder_threshold,
           CASE WHEN s.quantity = 0 THEN 'Out of Stock'
                WHEN s.quantity <= s.reorder_threshold THEN 'Low Stock'
                ELSE 'In Stock' END as status
    FROM products p LEFT JOIN stock s ON p.id = s.product_id WHERE p.id = ?
  `).get(id),
  update: (id, qty) => db.prepare("UPDATE stock SET quantity = ?, last_restocked = datetime('now') WHERE product_id = ?").run(qty, id),
};

const faq = {
  search: (term) => {
    const p = `%${term}%`;
    return db.prepare('SELECT * FROM faq WHERE question LIKE ? OR answer LIKE ? OR keywords LIKE ? OR category LIKE ?').all(p, p, p, p);
  },
  getAll: () => db.prepare('SELECT * FROM faq ORDER BY category').all(),
};

const promotions = {
  getActive: () => db.prepare("SELECT * FROM promotions WHERE active = 1 AND (valid_until IS NULL OR valid_until >= date('now'))").all(),
  getByCode: (code) => db.prepare("SELECT * FROM promotions WHERE code = ? AND active = 1 AND (valid_until IS NULL OR valid_until >= date('now'))").get(code),
};

const customers = {
  upsert: (chatId, name) => db.prepare(`
    INSERT INTO customers (chat_id, name) VALUES (?, ?)
    ON CONFLICT(chat_id) DO UPDATE SET name = excluded.name
  `).run(chatId, name),
  get: (chatId) => db.prepare('SELECT * FROM customers WHERE chat_id = ?').get(chatId),
};

const conversations = {
  save: (chatId, role, content) => db.prepare('INSERT INTO conversations (chat_id, role, content) VALUES (?, ?, ?)').run(chatId, role, content),
  getHistory: (chatId) => db.prepare('SELECT role, content FROM conversations WHERE chat_id = ? ORDER BY created_at DESC LIMIT 12').all(chatId).reverse(),
};

module.exports = { products, stock, faq, promotions, customers, conversations };
