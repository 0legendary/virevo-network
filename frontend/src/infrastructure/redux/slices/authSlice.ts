import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUser } from '../../../domain/models/user';

interface AuthState {
  currUser: IUser | null;
  token: string | null;
  role: string | null;
  currUserID: string | null;
  theme: string | 'light'
}

const initialState: AuthState = {
  currUser: null,
  currUserID: localStorage.getItem('currUserID'),
  token: localStorage.getItem('token'),
  role: localStorage.getItem('role'),
  theme: localStorage.getItem('theme') || 'light'
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ token: string; user: IUser }>) => {
      state.currUser = action.payload.user;
      state.token = action.payload.token;
      state.role = action.payload.user.role;
      state.currUserID = action.payload.user._id;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('role', action.payload.user.role);
      localStorage.setItem('currUserID', action.payload.user._id);
    },
    logout: (state) => {
      state.token = null;
      state.role = null;
      state.currUserID = null;
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('currUserID');
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
  },
});

export const { login, logout,toggleTheme } = authSlice.actions;
export default authSlice.reducer;
