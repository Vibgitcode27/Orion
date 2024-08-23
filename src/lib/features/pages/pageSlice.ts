import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { stat } from "fs";

export interface PageState {
  createPage: number;
  importPage: number;
}

const initialState: PageState = {
  createPage: 0,
  importPage: 0,
};

export const pageSlice = createSlice({
  name: "pages",
  initialState,
  reducers: {
    createPageIterator: (state, action) => {
      state.createPage = action.payload.createPage;
    },
    importPageIterator: (state, action) => {
      state.createPage = action.payload.importPage;
    },
  },
});

export const { importPageIterator, createPageIterator } = pageSlice.actions;

export default pageSlice.reducer;
