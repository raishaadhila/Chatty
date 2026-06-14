const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

async function createDocument() {
  return await PDFDocument.create();
}

async function embedFont(doc, type = 'standard') {
  return await doc.embedFont(StandardFonts.Helvetica);
}

async function embedBoldFont(doc) {
  return await doc.embedFont(StandardFonts.HelveticaBold);
}

function addPage(doc, width = 595.28, height = 841.89) {
  return doc.addPage([width, height]);
}

async function saveBuffer(doc) {
  return Buffer.from(await doc.save());
}

module.exports = { createDocument, embedFont, embedBoldFont, addPage, saveBuffer };
