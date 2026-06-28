import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ComponentStateSlice {
  values: Record<string, unknown>;
}

const initialState: ComponentStateSlice = {
  values: {},
};

const componentStateSlice = createSlice({
  name: 'componentState',
  initialState,
  reducers: {
    setReduxState: (state, action: PayloadAction<{ key: string; value: unknown }>) => {
      state.values[action.payload.key] = action.payload.value;
    },
    clearReduxState: (state, action: PayloadAction<string>) => {
      delete state.values[action.payload];
    },
  },
});

export const { clearReduxState, setReduxState } = componentStateSlice.actions;
export default componentStateSlice.reducer;
