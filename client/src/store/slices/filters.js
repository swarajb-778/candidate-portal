import { createSlice } from '@reduxjs/toolkit';

// Mirrored into search params so a filtered list is shareable and survives a
// reload. Redux holds it so it also survives navigating away and back.
const initialState = {
  applications: { status: 'all', sort: 'recent' },
  notifications: { filter: 'all' },
  interviews:    { tab: 'upcoming' },
  documents:     { tab: 'mine' },
  settings:      { tab: 'account' }
};

const filters = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setFilter: (s, a) => {
      const { scope, patch } = a.payload;
      return { ...s, [scope]: { ...s[scope], ...patch } };
    }
  }
});

export const { setFilter } = filters.actions;
export default filters.reducer;
