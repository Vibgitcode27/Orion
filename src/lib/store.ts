import { configureStore } from "@reduxjs/toolkit";
import { counterSlice } from "./features/counter/counterSlice";
import { seedSlice } from "./features/seed/seedSlice";
import { pageSlice } from "./features/pages/pageSlice";
import { createDerivationPathSlice } from "./features/derivationPath/createDerivationPathSlice";
export const makeStore = () => {
  return configureStore({
    reducer: {
      counter: counterSlice.reducer,
      seed: seedSlice.reducer,
      page: pageSlice.reducer,
      path: createDerivationPathSlice.reducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
