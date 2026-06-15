# SmartLabWebsite Updates

## Latest Changes (Admin Dashboard & Dynamic Costing)

### Backend Enhancements

**Material Model** (`backend/models/Material.js`):
- Enhanced with dynamic costing system
- `basePrice`: Base price per KG (₹/kg)
- `colors`: Array with color names and surcharges
- `stockTiers`: Stock-based pricing multipliers (buy more = cheaper)
  - Example: 0-2KG = 120%, 2-5KG = 100%, 5+KG = 90%
- `calculatePrice(colorName, weight)` method for real-time pricing
- `density`, `minStock`, `maxStock`, timestamps added

**Routes Created/Enhanced**:
- **`backend/routes/users.js`** (NEW):
  - GET `/` - list all users
  - GET `/:id` - get single user
  - PUT `/:id` - update user role
  - DELETE `/:id` - delete user
  
- **`backend/routes/materials.js`** (ENHANCED):
  - GET `/`, POST `/add`, GET `/:id`, PUT `/:id`, DELETE `/:id`
  - NEW: `POST /:id/calculate-price` - calculate price based on color and weight

- **`backend/routes/printers.js`** (ENHANCED):
  - NEW: `POST /add`, `PUT /:id`, `DELETE /:id` - full CRUD

- **`backend/routes/bookings.js`** (ENHANCED):
  - NEW: `GET /:id`, `PUT /:id`, `PATCH /:id/status`, `DELETE /:id`
  - Status management: pending → confirmed → completed/cancelled

**Server** (`backend/server.js`):
- Registered `/api/users` route for user management

### Frontend

**AdminDashboard** (`src/AdminDashboard.jsx`) - COMPLETE REWRITE:
- Full admin control panel with 5 management tabs:
  
  1. **Dashboard Tab**: System status overview
     - Live stats (users, bookings, materials, printers)
     - Quick reference guide
  
  2. **Materials Tab**: Material management with dynamic costing
     - Add materials with base price, stock, colors
     - Stock tier configuration (multipliers)
     - Update stock in real-time
     - Delete materials
     - View color surcharges
  
  3. **Printers Tab**: Printer fleet management
     - Add printers (ID, name, status)
     - Monitor progress percentage
     - Delete printers
     - Status tracking
  
  4. **Bookings Tab**: Order management
     - View all bookings with user, printer, material, date
     - Update booking status (dropdown: pending/confirmed/completed/cancelled)
     - View total cost per booking
     - Delete bookings
  
  5. **Users Tab**: User management
     - View all users with roles
     - Change user role (admin ↔ client)
     - Delete users (except default admin)

**Key Features**:
- Real-time data sync with MongoDB
- Form-based CRUD for materials and printers
- Dropdown status selectors for bookings
- Role-based user permissions
- Dynamic pricing visualization in materials table
- Responsive tables with hover effects
- Loading counts from all 4 main collections

## Previous Updates

### MongoDB Integration (Earlier Phase)

- Added `backend/models/Printer.js` for printer storage in MongoDB
- Updated `backend/routes/printers.js` to use database instead of in-memory data
- Updated `backend/routes/live.js` to return live printer state from MongoDB
- Updated `backend/routes/quote.js` to use real printer lookup during quote estimation
- Added startup seeding in `backend/server.js`:
  - Default printers
  - Default materials
  - Admin user (admin@smartlab.com / admin123)
- Removed legacy dummy printer data file: `backend/data/printerData.js`

### Frontend Integration

- Updated `src/App.jsx` to load real dashboard counts from MongoDB-backed APIs:
  - `/api/printers`
  - `/api/materials`
  - `/api/bookings`
- Updated `src/ClientDashboard.jsx` to use real printer API for selection, quotes, booking, and live feed
- Removed static dummy arrays from client dashboard

## System Architecture

### Database (MongoDB)
- Collections: `users`, `materials`, `printers`, `bookings`
- Connection: `mongodb://127.0.0.1:27017/smartlab`
- Auto-seeding on first connection (if empty)

### API Endpoints
- `/api/auth` - Authentication
- `/api/users` - User management
- `/api/materials` - Material management with pricing
- `/api/printers` - Printer fleet management
- `/api/bookings` - Booking/order management
- `/api/upload` - File uploads
- `/api/quote` - Quote generation
- `/api/live` - Live printer status

### Frontend Routes
- Login → Dashboard (role-based)
- Admin: `AdminDashboard` (full control)
- Client: `ClientDashboard` (order workflow)

## Next Steps
- Authorization middleware for protected routes
- User booking history display
- Client order tracking
- Email notifications
- Payment integration
- Real printer hardware integration (Bambu Lab API)
