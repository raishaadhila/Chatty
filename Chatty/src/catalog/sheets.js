const axios = require('axios');
const config = require('../config');
const { getData, setData } = require('../db/firebase');
const logger = require('../utils/logger');

async function getAccessToken() {
  if (!config.google.serviceAccountEmail) return null;

  const { JWT } = require('google-auth-library');
  const client = new JWT({
    email: config.google.serviceAccountEmail,
    key: config.google.privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const tokens = await client.authorize();
  return tokens.access_token;
}

function extractSheetId(url) {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

async function fetchSheet(sheetUrl) {
  const sheetId = extractSheetId(sheetUrl);
  if (!sheetId) throw new Error('Invalid Google Sheets URL');

  const token = await getAccessToken();
  if (!token) throw new Error('Google Sheets not configured');

  const range = 'A:Z';
  const response = await axios.get(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const rows = response.data.values;
  if (!rows || rows.length < 2) throw new Error('Sheet is empty or has no data rows');

  const headers = rows[0].map(h => h.toLowerCase().trim());
  const items = rows.slice(1).map((row, i) => {
    const item = {};
    headers.forEach((h, j) => {
      item[h] = row[j] || '';
    });
    return {
      name: item.name || `Item ${i + 1}`,
      price: parseFloat(item.price) || 0,
      sku: item.sku || `SHEET-${i + 1}`,
      stock: item.stock !== undefined ? parseInt(item.stock) || 0 : 0,
      category: item.category || 'Uncategorized',
      description: item.description || '',
    };
  });

  return items;
}

async function syncFromSheet(workspaceId) {
  const workspace = await getData(`/workspaces/${workspaceId}/config`);
  const sheetUrl = workspace?.catalogSheetUrl;
  if (!sheetUrl) {
    logger.info('No sheet URL configured', { workspaceId });
    return { count: 0 };
  }

  try {
    const items = await fetchSheet(sheetUrl);
    const catalog = {};
    items.forEach((item, i) => {
      catalog[`item_${i + 1}`] = item;
    });
    await setData(`/workspaces/${workspaceId}/catalog`, catalog);
    logger.info('Catalog synced from Google Sheets', { workspaceId, count: items.length });
    return { count: items.length };
  } catch (err) {
    logger.error('Sheet sync error', { workspaceId, error: err.message });
    throw err;
  }
}

module.exports = { fetchSheet, syncFromSheet, extractSheetId };
