const { getData } = require('../db/firebase');

async function getWorkspaceCatalog(workspaceId) {
  const catalog = await getData(`/workspaces/${workspaceId}/catalog`);
  if (!catalog) return [];
  return Object.values(catalog);
}

async function searchCatalog(workspaceId, query) {
  const catalog = await getWorkspaceCatalog(workspaceId);
  if (!catalog.length) return [];

  const q = query.toLowerCase();
  return catalog.filter(item =>
    item.name?.toLowerCase().includes(q) ||
    item.sku?.toLowerCase().includes(q) ||
    item.category?.toLowerCase().includes(q)
  );
}

async function getStockStatus(workspaceId, productName) {
  const catalog = await getWorkspaceCatalog(workspaceId);
  const item = catalog.find(i =>
    i.name?.toLowerCase() === productName.toLowerCase() ||
    i.sku?.toLowerCase() === productName.toLowerCase()
  );
  if (!item) return null;
  return {
    name: item.name,
    stock: item.stock ?? 0,
    price: item.price,
    status: item.stock === 0 ? 'out_of_stock'
      : item.stock <= 5 ? 'low_stock'
      : 'in_stock',
  };
}

module.exports = { getWorkspaceCatalog, searchCatalog, getStockStatus };
