import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface DerivationPathState {
  solanaPathKey: number;
  ethPathKey: number;
}

const initialState: DerivationPathState = {
  solanaPathKey: 0,
  ethPathKey: 0,
};

export const derivationPathSlice = createSlice({
  name: "derivationPath",
  initialState,
  reducers: {
    incrementSolanaPathKey: (state) => {
      state.solanaPathKey += 1;
    },
    decrementSolanaPathKey: (state) => {
      state.solanaPathKey -= 1;
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
    resetEthPathKey: (state) => {
      state.ethPathKey = 0;
    },
  },
});

export const { incrementSolanaPathKey , decrementSolanaPathKey , resetSolanaPathKey , incrementEthPathKey , decrementEthPathKey , resetEthPathKey } = derivationPathSlice.actions;
export default derivationPathSlice.reducer;
