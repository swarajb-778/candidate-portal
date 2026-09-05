import { configureStore } from '@reduxjs/toolkit';
import ui from './slices/ui.js';
import filters from './slices/filters.js';
import drafts from './slices/drafts.js';

export const store = configureStore({
  reducer: { ui, filters, drafts }
});
