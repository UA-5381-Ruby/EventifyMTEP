import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOpen: true, // За замовчуванням меню відкрите
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isOpen = !state.isOpen; // Змінюємо на протилежне значення
    },
  },
});

export const { toggleSidebar } = sidebarSlice.actions;
export default sidebarSlice.reducer;
