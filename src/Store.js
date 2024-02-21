import { configureStore } from "@reduxjs/toolkit";

import AppReducer, { defaultState } from "./AppReducer";

const Store = configureStore({ reducer: AppReducer, preloadedState: defaultState });

export default Store;