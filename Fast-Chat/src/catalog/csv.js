const { parse } = require('csv-parse/sync');
const { setData } = require('../db/firebase');
const logger = require('../utils/logger');

const REQUIRED_COLUMNS = ['name', 'price'];
const OPTIONAL_COLUMNS = ['sku', 'stock', 'category', 'description'];

function parseCSV(fileContent) {
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });

  if (!records.length) throw new Error('CSV is empty');

  const headers = Object.keys(records[0]);
  const missing = REQUIRED_COLUMNS.filter(c => !headers.includes(c));
  if (missing.length) {
    throw new Error(`Missing required columns: ${missing.join(', ')}. Required: ${REQUIRED_COLUMNS.join(', ')}`);
  }

  const items = records.map((row, i) => ({
    name: row.name,
    price: parseFloat(row.price) || 0,
    sku: row.sku || `SKU-${i + 1}`,
    stock: row.stock !== undefined ? parseInt(row.stock) || 0 : 0,
    category: row.category || 'Uncategorized',
    description: row.description || '',
  }));

  logger.info(`CSV parsed: ${items.length} items`);
  return items;
}

async function importCSV(workspaceId, fileContent) {
  const items = parseCSV(fileContent);
  const catalog = {};
  items.forEach((item, i) => {
    catalog[`item_${i + 1}`] = item;
  });
  await setData(`/workspaces/${workspaceId}/catalog`, catalog);
  logger.info('Catalog imported from CSV', { workspaceId, count: items.length });
  return { count: items.length };
}

module.exports = { parseCSV, importCSV };
