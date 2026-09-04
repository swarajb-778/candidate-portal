import { createSlice } from '@reduxjs/toolkit';

// Which in-progress edit is open — not the field values themselves. Those live
// in React Hook Form.
const initialState = {
  profileSection: null, // 'personal' | 'links' | 'prefs' | 'eeo'
  profileRow: null,     // experience/education row id being edited
  signup: { step: 1, values: {} },
  availability: { month: null, day: null, timezone: null, slots: [] }
};

const drafts = createSlice({
  name: 'drafts',
  initialState,
  reducers: {
    setProfileSection: (s, a) => ({ ...s, profileSection: a.payload }),
    setProfileRow: (s, a) => ({ ...s, profileRow: a.payload }),
    setSignup: (s, a) => ({ ...s, signup: { ...s.signup, ...a.payload } }),
    resetSignup: (s) => ({ ...s, signup: initialState.signup }),
    setAvailability: (s, a) => ({ ...s, availability: { ...s.availability, ...a.payload } }),
    resetAvailability: (s) => ({ ...s, availability: initialState.availability })
  }
});

export const {
  setProfileSection, setProfileRow,
  setSignup, resetSignup,
  setAvailability, resetAvailability
} = drafts.actions;
export default drafts.reducer;
