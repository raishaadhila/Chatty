const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Fresh DB
const dbPath = path.join(dataDir, 'store.db');
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    price REAL NOT NULL,
    description TEXT,
    shade TEXT,
    weight_ml TEXT
  );

  CREATE TABLE stock (
    product_id INTEGER PRIMARY KEY REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 0,
    unit TEXT DEFAULT 'pcs',
    reorder_threshold INTEGER DEFAULT 20,
    last_restocked TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact TEXT,
    category TEXT,
    lead_time_days INTEGER DEFAULT 3,
    min_order_qty INTEGER DEFAULT 50
  );

  CREATE TABLE customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id TEXT UNIQUE NOT NULL,
    name TEXT,
    phone TEXT,
    total_orders INTEGER DEFAULT 0,
    last_order_date TEXT,
    notes TEXT
  );

  CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER REFERENCES customers(id),
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    payment_status TEXT DEFAULT 'unpaid',
    total_amount REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    notes TEXT
  );

  CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL
  );

  CREATE TABLE promotions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL,
    discount_value REAL NOT NULL,
    min_purchase REAL DEFAULT 0,
    valid_until TEXT,
    active INTEGER DEFAULT 1
  );

  CREATE TABLE faq (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    keywords TEXT
  );

  CREATE TABLE conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// ── PRODUCTS (Emina) ──────────────────────────────────────────────
const insertProduct = db.prepare(
  'INSERT INTO products (sku, name, category, subcategory, price, description, shade, weight_ml) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
);

const products = [
  // Face
  ['EMN-FC-001', 'Emina Bare with Me Cushion Foundation', 'Face', 'Foundation', 89000, 'Lightweight cushion foundation with SPF 30 PA+++, natural finish, buildable coverage', 'N10 Porcelain', '15g'],
  ['EMN-FC-002', 'Emina Bare with Me Cushion Foundation', 'Face', 'Foundation', 89000, 'Lightweight cushion foundation with SPF 30 PA+++, natural finish, buildable coverage', 'N20 Ivory', '15g'],
  ['EMN-FC-003', 'Emina Bare with Me Cushion Foundation', 'Face', 'Foundation', 89000, 'Lightweight cushion foundation with SPF 30 PA+++, natural finish, buildable coverage', 'W10 Sand', '15g'],
  ['EMN-FC-004', 'Emina Sun Protection Moisturizer SPF 30', 'Face', 'Skincare', 45000, 'Daily moisturizer with SPF 30 PA++ protection, lightweight, non-greasy', null, '20ml'],
  ['EMN-FC-005', 'Emina Bright Stuff Moisturizing Cream', 'Face', 'Skincare', 39000, 'Brightening moisturizer with niacinamide, suitable for all skin types', null, '20ml'],
  ['EMN-FC-006', 'Emina Bright Stuff Face Wash', 'Face', 'Skincare', 29000, 'Gentle brightening face wash with vitamin C, removes impurities without stripping moisture', null, '50ml'],
  ['EMN-FC-007', 'Emina Acne Solution Face Wash', 'Face', 'Skincare', 29000, 'Salicylic acid face wash for acne-prone skin, controls oil and prevents breakouts', null, '50ml'],
  ['EMN-FC-008', 'Emina Creamatte Foundation', 'Face', 'Foundation', 69000, 'Full coverage matte foundation, long-lasting up to 12 hours, controls oil', 'Porcelain 01', '30ml'],
  ['EMN-FC-009', 'Emina Creamatte Foundation', 'Face', 'Foundation', 69000, 'Full coverage matte foundation, long-lasting up to 12 hours, controls oil', 'Natural 02', '30ml'],
  ['EMN-FC-010', 'Emina Pressed Powder', 'Face', 'Powder', 49000, 'Finely milled pressed powder, controls shine, natural finish', 'Light Beige', '9g'],
  ['EMN-FC-011', 'Emina Pressed Powder', 'Face', 'Powder', 49000, 'Finely milled pressed powder, controls shine, natural finish', 'Natural Beige', '9g'],
  ['EMN-FC-012', 'Emina Cheek Lit Blush On', 'Face', 'Blush', 55000, 'Silky blush with a natural flush, buildable color, long-lasting', 'Peach Lit', '5g'],
  ['EMN-FC-013', 'Emina Cheek Lit Blush On', 'Face', 'Blush', 55000, 'Silky blush with a natural flush, buildable color, long-lasting', 'Rose Lit', '5g'],
  ['EMN-FC-014', 'Emina Highlight & Contour Stick', 'Face', 'Contour', 65000, 'Dual-ended stick for easy highlight and contour, blendable formula', 'Universal', '8g'],

  // Lips
  ['EMN-LP-001', 'Emina Lip Coat', 'Lips', 'Liquid Lipstick', 39000, 'Long-lasting matte liquid lipstick, comfortable wear, highly pigmented', 'First Crush', '4ml'],
  ['EMN-LP-002', 'Emina Lip Coat', 'Lips', 'Liquid Lipstick', 39000, 'Long-lasting matte liquid lipstick, comfortable wear, highly pigmented', 'Blushing Bride', '4ml'],
  ['EMN-LP-003', 'Emina Lip Coat', 'Lips', 'Liquid Lipstick', 39000, 'Long-lasting matte liquid lipstick, comfortable wear, highly pigmented', 'Berry Smoothie', '4ml'],
  ['EMN-LP-004', 'Emina Lip Coat', 'Lips', 'Liquid Lipstick', 39000, 'Long-lasting matte liquid lipstick, comfortable wear, highly pigmented', 'Chili Pepper', '4ml'],
  ['EMN-LP-005', 'Emina Glossy Stain', 'Lips', 'Lip Gloss', 45000, 'Sheer glossy lip stain, moisturizing, non-sticky, buildable color', 'Coral Crush', '4ml'],
  ['EMN-LP-006', 'Emina Glossy Stain', 'Lips', 'Lip Gloss', 45000, 'Sheer glossy lip stain, moisturizing, non-sticky, buildable color', 'Pink Lemonade', '4ml'],
  ['EMN-LP-007', 'Emina Lip Balm', 'Lips', 'Lip Care', 25000, 'Moisturizing tinted lip balm with vitamin E, SPF 15', 'Strawberry', '3.5g'],
  ['EMN-LP-008', 'Emina Lip Balm', 'Lips', 'Lip Care', 25000, 'Moisturizing tinted lip balm with vitamin E, SPF 15', 'Vanilla', '3.5g'],

  // Eyes
  ['EMN-EY-001', 'Emina Eye Xpert Mascara', 'Eyes', 'Mascara', 55000, 'Volumizing and lengthening mascara, smudge-proof, easy to remove', 'Black', '8ml'],
  ['EMN-EY-002', 'Emina Eyebrow Pencil', 'Eyes', 'Brow', 35000, 'Precise eyebrow pencil with spoolie brush, natural hair-stroke finish', 'Dark Brown', '0.3g'],
  ['EMN-EY-003', 'Emina Eyebrow Pencil', 'Eyes', 'Brow', 35000, 'Precise eyebrow pencil with spoolie brush, natural hair-stroke finish', 'Soft Brown', '0.3g'],
  ['EMN-EY-004', 'Emina Eye Shadow Palette - Dreamy', 'Eyes', 'Eyeshadow', 79000, '9-pan eyeshadow palette with matte and shimmer shades, highly pigmented', 'Dreamy', '9g'],
  ['EMN-EY-005', 'Emina Eye Shadow Palette - Earthy', 'Eyes', 'Eyeshadow', 79000, '9-pan eyeshadow palette with warm earthy tones, matte and shimmer', 'Earthy', '9g'],
  ['EMN-EY-006', 'Emina Eyeliner Pencil', 'Eyes', 'Eyeliner', 29000, 'Smooth gliding eyeliner pencil, long-lasting, smudge-proof', 'Black', '0.3g'],

  // Skincare
  ['EMN-SK-001', 'Emina Bright Stuff Toner', 'Skincare', 'Toner', 35000, 'Brightening toner with niacinamide and vitamin C, balances skin pH', null, '100ml'],
  ['EMN-SK-002', 'Emina Acne Solution Toner', 'Skincare', 'Toner', 35000, 'Salicylic acid toner for acne-prone skin, unclogs pores, reduces redness', null, '100ml'],
  ['EMN-SK-003', 'Emina Bright Stuff Serum', 'Skincare', 'Serum', 55000, 'Brightening serum with 10% niacinamide, fades dark spots, evens skin tone', null, '20ml'],
  ['EMN-SK-004', 'Emina Micellar Water', 'Skincare', 'Cleanser', 39000, 'Gentle micellar water removes makeup and impurities, no-rinse formula', null, '100ml'],
  ['EMN-SK-005', 'Emina Sheet Mask - Brightening', 'Skincare', 'Mask', 15000, 'Single-use brightening sheet mask with vitamin C and niacinamide', null, '20ml'],
  ['EMN-SK-006', 'Emina Sheet Mask - Hydrating', 'Skincare', 'Mask', 15000, 'Single-use hydrating sheet mask with hyaluronic acid and aloe vera', null, '20ml'],
];

// ── STOCK ─────────────────────────────────────────────────────────
const stockData = {
  'EMN-FC-001': [85, 'pcs', 15], 'EMN-FC-002': [120, 'pcs', 15], 'EMN-FC-003': [60, 'pcs', 15],
  'EMN-FC-004': [200, 'pcs', 30], 'EMN-FC-005': [180, 'pcs', 30], 'EMN-FC-006': [250, 'pcs', 30],
  'EMN-FC-007': [220, 'pcs', 30], 'EMN-FC-008': [90, 'pcs', 20], 'EMN-FC-009': [75, 'pcs', 20],
  'EMN-FC-010': [140, 'pcs', 25], 'EMN-FC-011': [130, 'pcs', 25], 'EMN-FC-012': [95, 'pcs', 20],
  'EMN-FC-013': [80, 'pcs', 20], 'EMN-FC-014': [65, 'pcs', 15],
  'EMN-LP-001': [300, 'pcs', 50], 'EMN-LP-002': [280, 'pcs', 50], 'EMN-LP-003': [260, 'pcs', 50],
  'EMN-LP-004': [240, 'pcs', 50], 'EMN-LP-005': [150, 'pcs', 30], 'EMN-LP-006': [140, 'pcs', 30],
  'EMN-LP-007': [200, 'pcs', 40], 'EMN-LP-008': [190, 'pcs', 40],
  'EMN-EY-001': [110, 'pcs', 20], 'EMN-EY-002': [160, 'pcs', 30], 'EMN-EY-003': [145, 'pcs', 30],
  'EMN-EY-004': [70, 'pcs', 15], 'EMN-EY-005': [65, 'pcs', 15], 'EMN-EY-006': [180, 'pcs', 30],
  'EMN-SK-001': [170, 'pcs', 30], 'EMN-SK-002': [155, 'pcs', 30], 'EMN-SK-003': [120, 'pcs', 25],
  'EMN-SK-004': [200, 'pcs', 30], 'EMN-SK-005': [0, 'pcs', 50], 'EMN-SK-006': [12, 'pcs', 50],
};

// ── SUPPLIERS ─────────────────────────────────────────────────────
const suppliers = [
  ['PT Paragon Technology & Innovation', 'paragon@emina.co.id', 'All Products', 7, 100],
  ['Distributor Kosmetik Jaya', 'djaya@gmail.com', 'Face & Lips', 3, 50],
  ['Toko Kosmetik Nusantara', 'tkn@gmail.com', 'Skincare', 2, 30],
];

// ── PROMOTIONS ────────────────────────────────────────────────────
const promotions = [
  ['EMINA10', '10% off all products', 'percent', 10, 50000, '2026-12-31', 1],
  ['SKINCARE20', '20% off skincare category', 'percent', 20, 100000, '2026-06-30', 1],
  ['FREESHIP', 'Free shipping for orders above Rp 150.000', 'shipping', 100, 150000, '2026-12-31', 1],
  ['NEWCUSTOMER', 'Rp 25.000 off for first order', 'fixed', 25000, 0, '2026-12-31', 1],
  ['LIPS5', 'Buy 3 lip products get Rp 15.000 off', 'fixed', 15000, 0, '2026-05-31', 0],
];

// ── FAQ ───────────────────────────────────────────────────────────
const faqs = [
  ['Ordering', 'How do I order?', 'Just tell me the product name and quantity! I will confirm your order, provide the total, and send payment details. Example: "I want 2 Emina Lip Coat in First Crush"', 'order,pesan,beli,buy,cara order'],
  ['Payment', 'What payment methods do you accept?', 'We accept:\n• Bank Transfer: BCA (1234567890 a/n Toko Emina), Mandiri, BNI\n• E-wallet: GoPay, OVO, DANA, ShopeePay\n• COD (Cash on Delivery) for Jabodetabek area only', 'payment,bayar,transfer,gopay,ovo,dana,cod,metode bayar'],
  ['Shipping', 'How long does shipping take?', 'Shipping estimates:\n• Jabodetabek: Same-day (order before 12.00 WIB) or next-day\n• Java: 2-3 business days\n• Outside Java: 3-5 business days\nWe use JNE, J&T, and SiCepat.', 'shipping,delivery,kirim,ongkir,lama,berapa hari'],
  ['Shipping', 'How much is the shipping cost?', 'Shipping cost depends on your location and courier. Estimated:\n• Jabodetabek: Rp 10.000 - 15.000\n• Java: Rp 15.000 - 25.000\n• Outside Java: Rp 25.000 - 45.000\nFree shipping for orders above Rp 150.000 with code FREESHIP!', 'ongkir,shipping cost,biaya kirim,gratis ongkir'],
  ['Promo', 'Do you have any promotions or discounts?', 'Active promos:\n• EMINA10 — 10% off all products (min. Rp 50.000)\n• SKINCARE20 — 20% off skincare (min. Rp 100.000)\n• FREESHIP — Free shipping (min. Rp 150.000)\n• NEWCUSTOMER — Rp 25.000 off your first order\nJust mention the code when ordering!', 'promo,diskon,discount,voucher,kode,code,sale'],
  ['Product', 'Are Emina products halal and safe?', 'Yes! All Emina products are:\n✅ BPOM certified (safe & registered)\n✅ Halal certified by MUI\n✅ Cruelty-free (no animal testing)\n✅ Dermatologically tested\nEmina is made by PT Paragon Technology & Innovation, a trusted Indonesian brand.', 'halal,bpom,safe,aman,cruelty free,tested,sertifikat'],
  ['Product', 'What skin type is Emina suitable for?', 'Emina has products for all skin types:\n• Oily/Acne-prone: Acne Solution series (face wash, toner)\n• Dry/Normal: Bright Stuff series (moisturizer, toner, serum)\n• All skin types: Most makeup products\nLet me know your skin type and I can recommend the right products!', 'skin type,kulit,oily,dry,acne,jerawat,berminyak,kering,cocok'],
  ['Return', 'Can I return or exchange a product?', 'Returns/exchanges accepted within 3 days of receiving if:\n• Product is damaged or defective\n• Wrong item was sent\nPlease send a photo via this chat. We do not accept returns for opened/used products unless defective.', 'return,refund,exchange,retur,tukar,rusak,salah kirim'],
  ['Wholesale', 'Do you offer wholesale or reseller pricing?', 'Yes! Reseller program:\n• Min. order 10 pcs per item: 10% discount\n• Min. order 25 pcs per item: 15% discount\n• Min. order 50 pcs per item: 20% discount\nContact us for a reseller agreement and price list.', 'wholesale,grosir,reseller,bulk,banyak,harga grosir'],
  ['Hours', 'What are your operating hours?', 'We are open:\n📅 Monday - Saturday: 08.00 - 20.00 WIB\n📅 Sunday: 09.00 - 17.00 WIB\nOrders outside hours will be processed the next business day.', 'jam,hours,open,buka,tutup,operational,hari'],
];

// ── SEED ──────────────────────────────────────────────────────────
const insertStock = db.prepare('INSERT INTO stock (product_id, quantity, unit, reorder_threshold) VALUES (?, ?, ?, ?)');
const insertSupplier = db.prepare('INSERT INTO suppliers (name, contact, category, lead_time_days, min_order_qty) VALUES (?, ?, ?, ?, ?)');
const insertPromo = db.prepare('INSERT INTO promotions (code, description, discount_type, discount_value, min_purchase, valid_until, active) VALUES (?, ?, ?, ?, ?, ?, ?)');
const insertFaq = db.prepare('INSERT INTO faq (category, question, answer, keywords) VALUES (?, ?, ?, ?)');

db.transaction(() => {
  products.forEach(p => {
    const result = insertProduct.run(...p);
    const s = stockData[p[0]];
    if (s) insertStock.run(result.lastInsertRowid, ...s);
  });
  suppliers.forEach(s => insertSupplier.run(...s));
  promotions.forEach(p => insertPromo.run(...p));
  faqs.forEach(f => insertFaq.run(...f));
})();

// Summary
const counts = {
  products: db.prepare('SELECT COUNT(*) as c FROM products').get().c,
  stock: db.prepare('SELECT COUNT(*) as c FROM stock').get().c,
  suppliers: db.prepare('SELECT COUNT(*) as c FROM suppliers').get().c,
  promotions: db.prepare('SELECT COUNT(*) as c FROM promotions').get().c,
  faq: db.prepare('SELECT COUNT(*) as c FROM faq').get().c,
};

console.log('✅ Emina CRM Database seeded:');
Object.entries(counts).forEach(([k, v]) => console.log(`   ${k}: ${v} records`));
db.close();
