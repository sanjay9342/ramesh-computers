import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../../utils/api'

// Fetch all products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/products')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Fetch products by category
export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchProductsByCategory',
  async (category, { rejectWithValue }) => {
    try {
      const response = await api.get('/products', { params: { category } })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Fetch single product
export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${id}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

// Search products
export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get('/products', { params: { search: query } })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

const initialState = {
  products: [],
  filteredProducts: [],
  product: null,
  loading: false,
  error: null,
  filters: {
    category: '',
    brand: [],
    priceRange: [0, 100000],
    ram: [],
    storage: [],
    processor: [],
    rating: 0,
  },
  sortBy: 'popularity',
}

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters: (state) => {
      state.filters = initialState.filters
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload
    },
    filterProducts: (state) => {
      let filtered = [...state.products]
      
      // Category filter
      if (state.filters.category) {
        filtered = filtered.filter(p => p.category === state.filters.category)
      }
      
      // Brand filter
      if (state.filters.brand.length > 0) {
        filtered = filtered.filter(p => state.filters.brand.includes(p.brand))
      }
      
      // Price filter
      filtered = filtered.filter(
        p => p.price >= state.filters.priceRange[0] && p.price <= state.filters.priceRange[1]
      )
      
      // Rating filter
      if (state.filters.rating > 0) {
        filtered = filtered.filter(p => p.rating >= state.filters.rating)
      }
      
      // Sorting
      switch (state.sortBy) {
        case 'price-low':
          filtered.sort((a, b) => a.price - b.price)
          break
        case 'price-high':
          filtered.sort((a, b) => b.price - a.price)
          break
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating)
          break
        case 'newest':
          filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          break
        default:
          // popularity - keep original order or sort by rating
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      }
      
      state.filteredProducts = filtered
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload
        state.filteredProducts = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch by category
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.filteredProducts = action.payload
      })
      // Fetch single product
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false
        state.product = action.payload
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Search products
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.filteredProducts = action.payload
      })
  },
})

export const { setFilters, resetFilters, setSortBy, filterProducts } = productSlice.actions
export default productSlice.reducer
