import fs from 'node:fs';
import path from 'node:path';
import { UPLOAD_DIR } from '../middleware/upload.js';

// Seeded documents need something real on disk so download and preview stream
// bytes. It has to be a *valid* PDF — a missing xref table renders as a blank
// black frame in the browser's viewer, which breaks the preview modal's design.
const buildPdf = () => {
  const objects = [
    '<</Type/Catalog/Pages 2 0 R>>',
    '<</Type/Pages/Kids[3 0 R]/Count 1>>',
    '<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Resources<</Font<</F1 5 0 R>>>>/Contents 4 0 R>>',
    null, // content stream, built below
    '<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>'
  ];

  const text = 'BT /F1 16 Tf 72 700 Td (Candidate Portal) Tj 0 -28 Td (Seeded document) Tj ET';
  objects[3] = `<</Length ${text.length}>>\nstream\n${text}\nendstream`;

  let pdf = '%PDF-1.4\n';
  const offsets = [];

  objects.forEach((body, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<</Size ${objects.length + 1}/Root 1 0 R>>\nstartxref\n${xrefStart}\n%%EOF\n`;

  return pdf;
};

export const PLACEHOLDER_KEY = 'seed-placeholder.pdf';

// The seed wipes the database, so every previously uploaded file is orphaned
// the moment it runs. Clear them rather than letting the directory grow.
export const clearUploads = () => {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const files = fs.readdirSync(UPLOAD_DIR).filter((f) => f !== '.gitkeep');
  for (const f of files) fs.rmSync(path.join(UPLOAD_DIR, f), { force: true });
  return files.length;
};

export const writePlaceholder = () => {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOAD_DIR, PLACEHOLDER_KEY), buildPdf(), 'latin1');
  return PLACEHOLDER_KEY;
};
