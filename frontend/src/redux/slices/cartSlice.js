import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload
      const existingItem = state.items.find(item => item.id === newItem.id)
      
      if (existingItem) {
        existingItem.quantity += newItem.quantity || 1
        existingItem.totalPrice += newItem.price * (newItem.quantity || 1)
      } else {
        state.items.push({
          ...newItem,
          quantity: newItem.quantity || 1,
          totalPrice: newItem.price * (newItem.quantity || 1)
        })
      }
      
      state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0)
      state.totalAmount = state.items.reduce((total, item) => total + item.totalPrice, 0)
    },
    
    removeFromCart: (state, action) => {
      const id = action.payload
      state.items = state.items.filter(item => item.id !== id)
      state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0)
      state.totalAmount = state.items.reduce((total, item) => total + item.totalPrice, 0)
    },
    
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload
      const item = state.items.find(item => item.id === id)
      
      if (item) {
        item.quantity = quantity
        item.totalPrice = item.price * quantity
        state.totalQuantity = state.items.reduce((total, item) => total + item.quantity, 0)
        state.totalAmount = state.items.reduce((total, item) => total + item.totalPrice, 0)
      }
    },
    
    clearCart: (state) => {
      state.items = []
      state.totalQuantity = 0
      state.totalAmount = 0
    },
    
    applyCoupon: (state, action) => {
      // Coupon logic can be added here
      const { code, discount } = action.payload
      state.couponCode = code
      state.discount = discount
    },
    
    removeCoupon: (state) => {
      state.couponCode = null
      state.discount = 0
    }
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart, applyCoupon, removeCoupon } = cartSlice.actions

export default cartSlice.reducer
