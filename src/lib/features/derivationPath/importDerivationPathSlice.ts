import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit";

export interface ImportDerivationPathState {
  solanaPathKey: number;
  ethPathKey: number;
}

const initialState: ImportDerivationPathState = {
  solanaPathKey: 0,
  ethPathKey: 0,
};

export const importDerivationPathSlice = createSlice({
  name: "importDerivationPath",
  initialState,
  reducers: {
    incrementSolanaPathKey: (state) => {
      state.solanaPathKey += 1;
    },
    decrementSolanaPathKey: (state) => {
      state.solanaPathKey -= 1;
    },
    setPathKey: (state, action: PayloadAction<number>) => {
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
} = importDerivationPathSlice.actions;
export default importDerivationPathSlice.reducer;
