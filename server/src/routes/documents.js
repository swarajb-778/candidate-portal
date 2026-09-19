import fs from 'node:fs';
import path from 'node:path';
import { Router } from 'express';

import { Application, Document } from '../models/index.js';
import { ApiError, wrap } from '../middleware/error.js';
import { requireAuth } from '../middleware/auth.js';
import { upload, UPLOAD_DIR } from '../middleware/upload.js';

export const documentRoutes = Router();
documentRoutes.use(wrap(requireAuth));

const KINDS = ['Resume', 'Cover Letter', 'Portfolio', 'Certification', 'Questionnaire', 'Other'];

const slugify = (name) =>
  `${name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)}-${Date.now().toString(36)}`;

const populated = (q) => q.populate('usedFor', 'slug title team');

documentRoutes.get(
  '/',
  wrap(async (req, res) => {
    const requested = req.query.tab === 'requested';

    const items = await populated(
      Document.find({
        user: req.user._id,
        deletedAt: { $exists: false },
        'request.isRequested': requested
      }).sort({ uploadedAt: -1 })
    ).lean();

    res.json({ items });
  })
);

documentRoutes.post(
  '/',
  upload.single('file'),
  wrap(async (req, res) => {
    if (!req.file) throw new ApiError(400, 'NO_FILE', 'Choose a file to upload.', 'file');

    const kind = KINDS.includes(req.body.kind) ? req.body.kind : 'Other';
    const application = req.body.applicationSlug
      ? await Application.findOne({ user: req.user._id, slug: req.body.applicationSlug }).select('_id')
      : null;

    const doc = await Document.create({
      user: req.user._id,
      slug: slugify(req.file.originalname),
      name: req.file.originalname,
      kind,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      storageKey: req.file.filename,
      uploadedAt: new Date(),
      usedFor: application ? [application._id] : []
    });

    res.status(201).json(await populated(Document.findById(doc._id)).lean());
  })
);

// Replace keeps the slug and its usedFor links. Uploading against an open
// request fulfils it rather than creating a second document.
documentRoutes.put(
  '/:slug',
  upload.single('file'),
  wrap(async (req, res) => {
    if (!req.file) throw new ApiError(400, 'NO_FILE', 'Choose a file to upload.', 'file');

    const doc = await Document.findOne({ user: req.user._id, slug: req.params.slug });
    if (!doc) throw new ApiError(404, 'NOT_FOUND', 'No such document.');

    removeFile(doc.storageKey);

    doc.name = req.file.originalname;
    doc.mimeType = req.file.mimetype;
    doc.sizeBytes = req.file.size;
    doc.storageKey = req.file.filename;
    doc.uploadedAt = new Date();
    if (doc.request?.isRequested) doc.request.fulfilled = true;

    await doc.save();
    res.json(await populated(Document.findById(doc._id)).lean());
  })
);

documentRoutes.delete(
  '/:slug',
  wrap(async (req, res) => {
    const doc = await Document.findOne({ user: req.user._id, slug: req.params.slug });
    if (!doc) throw new ApiError(404, 'NOT_FOUND', 'No such document.');

    // Soft delete — the file stays on disk so nothing is lost irrecoverably.
    doc.deletedAt = new Date();
    await doc.save();
    res.status(204).end();
  })
);

documentRoutes.get('/:slug/download', wrap((req, res) => stream(req, res, 'attachment')));
documentRoutes.get('/:slug/preview', wrap((req, res) => stream(req, res, 'inline')));

async function stream(req, res, disposition) {
  const doc = await Document.findOne({
    user: req.user._id,
    slug: req.params.slug,
    deletedAt: { $exists: false }
  });
  if (!doc?.storageKey) throw new ApiError(404, 'NOT_FOUND', 'No such document.');

  const file = path.join(UPLOAD_DIR, doc.storageKey);
  if (!fs.existsSync(file)) throw new ApiError(404, 'FILE_MISSING', 'That file is no longer stored.');

  res.setHeader('Content-Type', doc.mimeType ?? 'application/octet-stream');
  res.setHeader('Content-Disposition', `${disposition}; filename="${doc.name.replace(/"/g, '')}"`);
  fs.createReadStream(file).pipe(res);
}

// Seeded documents share one placeholder file; never unlink that one.
function removeFile(key) {
  if (!key || key === 'seed-placeholder.pdf') return;
  fs.rm(path.join(UPLOAD_DIR, key), { force: true }, () => {});
}
