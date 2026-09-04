import { createSlice } from '@reduxjs/toolkit';

// What's open. Nothing here comes from the server.
const initialState = {
  drawerOpen: false,
  notifMenuOpen: false,
  userMenuOpen: false,
  modal: null,        // 'availability' | 'reschedule' | 'withdraw' | 'upload'
                      // | 'docPreview' | 'recruiterPreview' | 'signature'
                      // | 'decline' | 'deleteAccount'
  modalPayload: null, // { applicationSlug } | { documentSlug } | { mode }
  toast: null         // { message } — cleared on a timer
};

const ui = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setDrawerOpen: (s, a) => ({ ...s, drawerOpen: a.payload }),
    setNotifMenuOpen: (s, a) => ({ ...s, notifMenuOpen: a.payload }),
    setUserMenuOpen: (s, a) => ({ ...s, userMenuOpen: a.payload }),
    openModal: (s, a) => ({
      ...s,
      modal: a.payload.modal,
      modalPayload: a.payload.payload ?? null
    }),
    closeModal: (s) => ({ ...s, modal: null, modalPayload: null }),
    showToast: (s, a) => ({ ...s, toast: { message: a.payload } }),
    clearToast: (s) => ({ ...s, toast: null })
  }
});

export const {
  setDrawerOpen, setNotifMenuOpen, setUserMenuOpen,
  openModal, closeModal, showToast, clearToast
} = ui.actions;
export default ui.reducer;
