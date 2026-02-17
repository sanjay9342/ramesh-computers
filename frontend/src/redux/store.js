import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import cartReducer from './slices/cartSlice'
import wishlistReducer from './slices/wishlistSlice'
import userReducer from './slices/userSlice'
import productReducer from './slices/productSlice'

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['cart', 'wishlist', 'user']
}

const rootReducer = combineReducers({
  cart: cartReducer,
  wishlist: wishlistReducer,
  user: userReducer,
  products: productReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)
