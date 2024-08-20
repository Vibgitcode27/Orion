import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface seedState {
  value: string;
}

const initialState: seedState = {
  value: "",
};

export const seedSlice = createSlice({
  name: "seed",
  initialState,
  reducers: {
    getSeed: (state) => {
      state.value += 1;
    },
  },
});

export const { getSeed } = seedSlice.actions;

export default seedSlice.reducer;
