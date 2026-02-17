# Ramesh Computers - E-Commerce Website Specification

## Project Overview
- **Project Name**: Ramesh Computers
- **Type**: Full-stack E-commerce Website (Flipkart-style)
- **Core Functionality**: Online computer shop selling Desktops, Laptops, Speakers, Printers, CCTV and accessories
- **Target Users**: Retail and wholesale customers in Tamil Nadu, India

## Tech Stack
### Frontend
- React.js 18+ with Vite
- React Router v6
- Redux Toolkit for state management
- Tailwind CSS for styling
- Swiper.js for sliders
- React Icons

### Backend
- Node.js + Express.js
- Firebase Admin SDK
- Cloudinary SDK for image uploads
- JWT for admin authentication

### Database & Services
- Firebase Firestore (database)
- Firebase Authentication
- Cloudinary (image storage)
- Razorpay (payments)

## UI/UX Specification

### Color Palette (Flipkart-inspired)
- **Primary Blue**: #2874f0
- **Primary Blue Dark**: #1a5dc9
- **Yellow Accent**: #ff9f00
- **Teal Accent**: #00bfa5
- **Background**: #f1f3f6 (light gray)
- **White**: #ffffff
- **Text Primary**: #212121
- **Text Secondary**: #878787
- **Border**: #e0e0e0
- **Success**: #388e3c
- **Danger**: #d32f2f

### Typography
- **Primary Font**: 'Roboto', sans-serif
- **Headings**: 700 weight
- **Body**: 400 weight
- **Price**: #000000, 500 weight
- **Discount**: #388e3c

### Layout
- Max content width: 1248px
- Card border-radius: 4px
- Box shadow: 0 2px 8px rgba(0,0,0,0.1)
- Gap between cards: 16px

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Pages Structure

### 1. Home Page
- Header with logo, search, login, wishlist, cart
- Image slider (hero banner)
- Category strip with icons
- Top Deals section (horizontal scroll)
- Best Selling Laptops grid
- New Arrivals section
- Brands strip
- Footer with links

### 2. Products Listing Page (/products)
- Filter sidebar (left)
- Brand chips/tabs
- Sort dropdown
- Product grid (responsive)
- Pagination

### 3. Category Page (/category/:slug)
- Category-specific filters
- Brand tabs for each category
- Product grid

### 4. Product Details Page (/product/:id)
- Image gallery
- Product info
- Specifications
- Add to cart/wishlist
- Similar products

### 5. Cart Page (/cart)
- Cart items list
- Quantity update
- Price summary
- Coupon input
- Checkout button

### 6. Wishlist Page (/wishlist)
- Saved items grid
- Move to cart option
- Remove from wishlist

### 7. Checkout Page (/checkout)
- Address form
- Order summary
- Payment options (Razorpay/COD)
- Place order

### 8. Orders Page (/orders)
- Order list
- Order status timeline
- Order details

### 9. Admin Dashboard (/admin)
- Dashboard cards
- Products CRUD
- Orders management
- Banner management

## Components

### Header Components
- MainHeader
- SearchBar
- LoginButton
- CartIcon
- WishlistIcon

### Product Components
- ProductCard
- ProductGrid
- ProductFilters
- BrandChips
- PriceSlider
- SortDropdown

### Cart Components
- CartItem
- CartSummary
- CouponInput

### Common Components
- ImageSlider
- CategoryStrip
- Footer
- Toast
- Loader
- Modal
- Pagination

## Database Schema (Firestore)

### users collection
```
json
{
  "uid": "string",
  "email": "string",
  "displayName": "string",
  "phone": "string",
  "address": "string",
  "role": "user|admin",
  "createdAt": "timestamp"
}
```

### products collection
```
json
{
  "id": "string",
  "title": "string",
  "slug": "string",
  "category": "string",
  "brand": "string",
  "price": "number",
  "discountPrice": "number",
  "description": "string",
  "specs": "object",
  "images": ["string"],
  "stock": "number",
  "rating": "number",
  "reviewCount": "number",
  "isFeatured": "boolean",
  "createdAt": "timestamp"
}
```

### orders collection
```
json
{
  "id": "string",
  "userId": "string",
  "items": ["object"],
  "totalAmount": "number",
  "status": "confirmed|packed|shipped|delivered|cancelled",
  "paymentMethod": "razorpay|cod",
  "paymentStatus": "pending|paid|failed",
  "shippingAddress": "object",
  "orderedAt": "timestamp"
}
```

### categories collection
```
json
{
  "id": "string",
  "name": "string",
  "slug": "string",
  "icon": "string",
  "image": "string"
}
```

### banners collection
```
json
{
  "id": "string",
  "title": "string",
  "image": "string",
  "link": "string",
  "isActive": "boolean"
}
```

## API Endpoints

### Products
- GET /api/products - List all products
- GET /api/products/:id - Get product by ID
- POST /api/products - Create product (admin)
- PUT /api/products/:id - Update product (admin)
- DELETE /api/products/:id - Delete product (admin)

### Orders
- GET /api/orders - List all orders (admin)
- GET /api/orders/user/:userId - User orders
- POST /api/orders - Create order
- PUT /api/orders/:id/status - Update order status (admin)

### Upload
- POST /api/upload - Upload image to Cloudinary

## Features

### Authentication
- Firebase Auth (email/password, phone)
- Protected routes for checkout, orders
- Admin role verification

### Cart & Wishlist
- Redux persisted state
- LocalStorage for guests
- Firestore for logged-in users

### Payments
- Razorpay integration
- Cash on Delivery option
- Order creation on success

### Admin Features
- Product CRUD
- Order management
- Banner management
- Dashboard analytics

## Animations & Interactions
- Hover zoom on product images (scale 1.05)
- Smooth page transitions
- Toast notifications
- Loading skeletons
- Lazy loading images

## Acceptance Criteria
1. ✅ Flipkart-inspired blue header with all elements
2. ✅ Working search functionality
3. ✅ Category navigation
4. ✅ Product listing with filters
5. ✅ Product details page
6. ✅ Cart with quantity update
7. ✅ Wishlist functionality
8. ✅ Checkout with payment options
9. ✅ Order tracking
10. ✅ Admin dashboard
11. ✅ Fully responsive design
12. ✅ Fast performance with lazy loading
