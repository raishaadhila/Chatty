const admin = require('firebase-admin');
const config = require('../config');
const logger = require('../utils/logger');

let db = null;

function initFirebase() {
  if (db) return db;

  if (!config.firebase.projectId) {
    logger.warn('Firebase not configured — running without database');
    return null;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey,
      }),
      databaseURL: config.firebase.databaseURL,
    });
    db = admin.database();
    logger.info('Firebase initialized');
  } catch (err) {
    logger.error('Firebase init failed', { error: err.message });
  }
  return db;
}

function getRef(path) {
  if (!db) return null;
  return db.ref(path);
}

async function getData(path) {
  const ref = getRef(path);
  if (!ref) return null;
  const snap = await ref.once('value');
  return snap.val();
}

async function setData(path, data) {
  const ref = getRef(path);
  if (!ref) return null;
  await ref.set(data);
  return data;
}

async function updateData(path, data) {
  const ref = getRef(path);
  if (!ref) return null;
  await ref.update(data);
  return data;
}

async function pushData(path, data) {
  const ref = getRef(path);
  if (!ref) return null;
  const newRef = ref.push();
  await newRef.set(data);
  return { key: newRef.key, ...data };
}

async function deleteData(path) {
  const ref = getRef(path);
  if (!ref) return null;
  await ref.remove();
  return true;
}

async function queryData(path, filters) {
  let ref = getRef(path);
  if (!ref) return [];
  if (filters) {
    if (filters.orderBy) ref = ref.orderByChild(filters.orderBy);
    if (filters.equalTo) ref = ref.equalTo(filters.equalTo);
    if (filters.limitToLast) ref = ref.limitToLast(filters.limitToLast);
    if (filters.limitToFirst) ref = ref.limitToFirst(filters.limitToFirst);
  }
  const snap = await ref.once('value');
  const val = snap.val();
  if (!val) return [];
  return Object.entries(val).map(([key, data]) => ({ id: key, ...data }));
}

module.exports = {
  initFirebase,
  getRef,
  getData,
  setData,
  updateData,
  pushData,
  deleteData,
  queryData,
};
