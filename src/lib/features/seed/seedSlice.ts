import { createSlice } from "@reduxjs/toolkit";

export interface seedState {
  value: Buffer;
}

const initialState: seedState = {
  value: Buffer.alloc(0),
};

export const seedSlice = createSlice({
  name: "seed",
  initialState,
  reducers: {
    setSeed: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setSeed } = seedSlice.actions;

export default seedSlice.reducer;
