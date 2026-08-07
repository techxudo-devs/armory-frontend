import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthUser } from '@/lib/api/types'

interface AuthState {
  user: AuthUser | null
  token: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (
      state,
      action: PayloadAction<{ user: AuthUser; token: string | null }>
    ) => {
      state.user = action.payload.user
      state.token = action.payload.token
    },
    clearAuth: (state) => {
      state.user = null
      state.token = null
    },
  },
})

export const { setAuth, clearAuth } = authSlice.actions
export const authReducer = authSlice.reducer
