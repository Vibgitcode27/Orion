import { createSlice } from "@reduxjs/toolkit";

export interface CounterState {
  solPublicKey: string;
  solPrivateKey: string;
  ethPublicKey: string;
  ethPrivateKey: string;
}

const initialState: CounterState = {
  solPrivateKey: "",
  solPublicKey: "",
  ethPrivateKey: "",
  ethPublicKey: "",
};

export const keySlice = createSlice({
  name: "key",
  initialState,
  reducers: {
    setkeys: (state, action) => {
      state.ethPrivateKey = action.payload.ethPrivateKey;
      state.ethPublicKey = action.payload.ethPublicKey;
      state.solPrivateKey = action.payload.solPrivateKey;
      state.solPublicKey = action.payload.solPublicKey;
    },
  },
});

export const { setkeys } = keySlice.actions;

export default keySlice.reducer;
