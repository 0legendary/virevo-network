import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { IUser } from '../../../domain/models/user';
import { ApiResponse } from '@/domain/models/requestModel';
import apiClient from '@/infrastructure/axios/axios';

interface AuthState {
  currUser: IUser | null;
  token: string | null;
  role: string | null;
  currUserID: string | null;
  theme: string | 'light'
  loading: boolean
}

const initialState: AuthState = {
  currUser: null,
  currUserID: localStorage.getItem('currUserID'),
  token: localStorage.getItem('token'),
  role: localStorage.getItem('role'),
  theme: localStorage.getItem('theme') || 'light',
  loading: false,
};

export const handleFetchUser = createAsyncThunk(
  'auth/fetchUser',
  async (currUserID: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<ApiResponse>(`/user/fetch-user/${currUserID}`);
      if (!response.data.success) {
        return rejectWithValue(response.data.message);
      }
      return response.data?.data?.userData;
    } catch (error: any) {
      console.log(error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

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
    toggleTheme: (state, action: PayloadAction<string | undefined>) => {
      if (action.payload) {
        state.theme = action.payload;
      } else {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
      }
      localStorage.setItem('theme', state.theme);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(handleFetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(handleFetchUser.fulfilled, (state, action) => {
        state.currUser = action.payload;
        state.loading = false;
      })
      .addCase(handleFetchUser.rejected, (state) => {
        state.currUser = null;
        state.loading = false;
      })
  },
});

export const { login, logout, toggleTheme } = authSlice.actions;
export default authSlice.reducer;
