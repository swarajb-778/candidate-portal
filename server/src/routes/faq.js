import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Router } from 'express';
import { wrap } from '../middleware/error.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const { faq } = JSON.parse(
  fs.readFileSync(path.join(here, '../seed/seed-data.json'), 'utf8')
);

export const faqRoutes = Router();

// Served from the corpus rather than hardcoded in the client, and deliberately
// public — the Help page is useful before you can sign in.
faqRoutes.get('/', wrap(async (req, res) => res.json({ items: faq })));
