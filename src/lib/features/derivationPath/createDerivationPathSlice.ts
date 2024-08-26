import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit";

export interface CreateDerivationPathState {
  solanaPathKey: number;
  ethPathKey: number;
}

const initialState: CreateDerivationPathState = {
  solanaPathKey: 0,
  ethPathKey: 0,
};

export const createDerivationPathSlice = createSlice({
  name: "createDerivationPath",
  initialState,
  reducers: {
    incrementSolanaPathKey: (state) => {
      state.solanaPathKey += 1;
    },
    decrementSolanaPathKey: (state) => {
      state.solanaPathKey -= 1;
    },
    setSolanaPathKey: (state, action: PayloadAction<number>) => {
      state.solanaPathKey = action.payload;
    },
    resetSolanaPathKey: (state) => {
      state.solanaPathKey = 0;
    },
    incrementEthPathKey: (state) => {
      state.ethPathKey += 1;
    },
    decrementEthPathKey: (state) => {
      state.ethPathKey -= 1;
    },
    setEthPathKey: (state, action: PayloadAction<number>) => {
      state.ethPathKey = action.payload;
    },
    resetEthPathKey: (state) => {
      state.ethPathKey = 0;
    },
  },
});

export const {
  incrementSolanaPathKey,
  decrementSolanaPathKey,
  resetSolanaPathKey,
  incrementEthPathKey,
  decrementEthPathKey,
  resetEthPathKey,
  setSolanaPathKey,
  setEthPathKey,
} = createDerivationPathSlice.actions;
export default createDerivationPathSlice.reducer;
