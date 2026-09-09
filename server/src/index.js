import express from 'express';
import cookieParser from 'cookie-parser';

import { connect } from './db.js';
import { authRoutes } from './routes/auth.js';
import { applicationRoutes } from './routes/applications.js';
import { availabilityRoutes } from './routes/availability.js';
import { interviewRoutes } from './routes/interviews.js';
import { documentRoutes } from './routes/documents.js';
import { offerRoutes } from './routes/offers.js';
import { faqRoutes } from './routes/faq.js';
import { notificationRoutes } from './routes/notifications.js';
import { profileRoutes } from './routes/profile.js';
import { settingsRoutes } from './routes/settings.js';
import { threadRoutes } from './routes/threads.js';
import { notFound, errorHandler } from './middleware/error.js';
import { uploadErrors } from './middleware/upload.js';

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get('/api/v1/health', (req, res) => res.json({ ok: true }));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/availability', availabilityRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/faq', faqRoutes);
app.use('/api/v1/interviews', interviewRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/offers', offerRoutes);
app.use('/api/v1/me', profileRoutes);
app.use('/api/v1/me', settingsRoutes);
app.use('/api/v1/threads', threadRoutes);

app.use(notFound);
app.use(uploadErrors);
app.use(errorHandler);

const port = Number(process.env.PORT ?? 4000);

try {
  await connect();
  app.listen(port, () => console.log(`API listening on http://localhost:${port}/api/v1`));
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
