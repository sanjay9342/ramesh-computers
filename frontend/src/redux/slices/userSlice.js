import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase/config'

const mapFirebaseAuthError = (error) => {
  const code = error?.code || ''

  if (code === 'auth/email-already-in-use') {
    return {
      code,
      message: 'This email is already registered. Please login instead.',
    }
  }
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return {
      code,
      message: 'Invalid email or password.',
    }
  }
  if (code === 'auth/invalid-login-credentials') {
    return {
      code,
      message: 'Invalid email or password.',
    }
  }
  if (code === 'auth/email-not-verified') {
    return {
      code,
      message: 'Please verify your email before login.',
    }
  }
  if (code === 'permission-denied' || code === 'firestore/permission-denied') {
    return {
      code,
      message: 'Your account is verified, but profile access is restricted by Firestore rules.',
    }
  }
  if (code === 'auth/too-many-requests') {
    return {
      code,
      message: 'Too many attempts. Please try again later.',
    }
  }
  if (code === 'auth/invalid-email') {
    return {
      code,
      message: 'Please enter a valid email address.',
    }
  }
  if (code === 'auth/weak-password') {
    return {
      code,
      message: 'Password should be at least 6 characters.',
    }
  }

  return {
    code,
    message: error?.message || 'Authentication failed',
  }
}

// Async thunks
export const loginUser = createAsyncThunk(
  'user/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const normalizedEmail = String(email || '').trim().toLowerCase()
      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password)
      const user = userCredential.user

      if (!user.emailVerified) {
        await signOut(auth)
        return rejectWithValue({
          code: 'auth/email-not-verified',
          message: 'Please verify your email before login. Check inbox/spam folder.',
        })
      }
      
      // Get user data from Firestore (best effort; auth login should still succeed)
      let userData = {}
      let hasUserDoc = false
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        hasUserDoc = userDoc.exists()
        userData = hasUserDoc ? userDoc.data() : {}
      } catch (readError) {
        console.warn('User profile read blocked by Firestore rules. Continuing with auth profile only.', readError)
      }

      if (!hasUserDoc) {
        try {
          await setDoc(
            doc(db, 'users', user.uid),
            {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || '',
              phone: '',
              role: 'user',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          )
        } catch (writeError) {
          console.warn('User profile write blocked by Firestore rules. Continuing login.', writeError)
        }
      }
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || userData.displayName,
        phone: userData.phone,
        address: userData.address,
        role: userData.role || 'user',
      }
    } catch (error) {
      return rejectWithValue(mapFirebaseAuthError(error))
    }
  }
)

export const registerUser = createAsyncThunk(
  'user/register',
  async ({ email, password, name, phone }, { rejectWithValue }) => {
    try {
      const normalizedEmail = String(email || '').trim().toLowerCase()
      const signInMethods = await fetchSignInMethodsForEmail(auth, normalizedEmail)
      if (signInMethods.length > 0) {
        return rejectWithValue({
          code: 'auth/email-already-in-use',
          message: 'This email is already registered. Please login instead.',
        })
      }

      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password)
      const user = userCredential.user
      
      // Update profile
      await updateProfile(user, { displayName: String(name || '').trim() })
      
      // Create user document in Firestore (best effort)
      try {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: String(name || '').trim(),
          phone: String(phone || '').trim(),
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, { merge: true })
      } catch (writeError) {
        // Auth account is already created; do not fail registration for profile write issues.
        console.error('Profile write failed after auth signup:', writeError)
      }

      try {
        await sendEmailVerification(user)
      } catch (verifyError) {
        console.error('Failed to send verification email:', verifyError)
      }

      await signOut(auth)
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: String(name || '').trim(),
        phone: String(phone || '').trim(),
        role: 'user',
        emailVerificationSent: true,
      }
    } catch (error) {
      return rejectWithValue(mapFirebaseAuthError(error))
    }
  }
)

export const resendVerificationEmail = createAsyncThunk(
  'user/resendVerificationEmail',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const normalizedEmail = String(email || '').trim().toLowerCase()
      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password)
      const user = userCredential.user
      await sendEmailVerification(user)
      await signOut(auth)
      return true
    } catch (error) {
      return rejectWithValue(mapFirebaseAuthError(error))
    }
  }
)

export const logoutUser = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      await signOut(auth)
      return null
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const resetPassword = createAsyncThunk(
  'user/resetPassword',
  async (email, { rejectWithValue }) => {
    try {
      const normalizedEmail = String(email || '').trim().toLowerCase()
      await sendPasswordResetEmail(auth, normalizedEmail)
      return true
    } catch (error) {
      return rejectWithValue(mapFirebaseAuthError(error))
    }
  }
)

const initialState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
      state.loading = false
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || action.payload || 'Login failed'
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || action.payload || 'Registration failed'
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.loading = false
      })
      // Resend verification
      .addCase(resendVerificationEmail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(resendVerificationEmail.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(resendVerificationEmail.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || action.payload || 'Failed to send verification email'
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || action.payload || 'Failed to send reset email'
      })
  },
})

export const { setUser, clearError } = userSlice.actions
export default userSlice.reducer
