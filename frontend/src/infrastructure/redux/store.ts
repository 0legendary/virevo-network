import { configureStore } from '@reduxjs/toolkit';
import authReducer, { handleFetchUser } from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import logger from "redux-logger";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(logger),
  devTools: import.meta.env.VITE_APP_MODE !== 'production',
});

const { token, currUserID } = store.getState().auth;
if (token && currUserID) {
  store.dispatch(handleFetchUser(currUserID));
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
