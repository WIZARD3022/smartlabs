# SmartLabWebsite Updates

## June 15, 2026 - Dashboard, Accounts, User Portal, and Printer API

### Landing Page and Shared Authentication

- Rebuilt the landing page into a responsive Smart Lab operations overview.
- Added one shared authentication panel for both admin and user accounts.
- Added a **Create account** mode to the shared authentication panel.
- New accounts are created with the `client` role and routed to the user dashboard after sign-in.
- Improved registration validation:
  - Name, email, and password are required.
  - Passwords must contain at least 8 characters.
  - Emails are normalized to lowercase.
  - Duplicate email registration is rejected.
- Removed sensitive password and stack-trace logging from the registration route.

### Admin Dashboard Redesign

- Rebuilt the admin dashboard as a lighter, denser operations console.
- Added compact metric cards for users, bookings, materials, and printers.
- Improved responsive navigation and management tables.
- Preserved existing material, printer, booking, and user CRUD actions.
- Added printer inventory IDs and connection types to the printer table.
- Added an admin form to configure Bambu Lab printer connections using:
  - Printer IP address
  - Serial number
  - Access code
- Added a **Sync** action for printers configured with the Bambu Labs API.

### User Dashboard

- Renamed and clarified the client experience as the **User Dashboard**.
- Users can:
  - Upload fabrication files
  - Select materials and printers
  - Request quotations
  - Reserve print slots
  - Monitor printer status
  - Send available printer-control actions

### Printer Catalog

Added the supplied equipment catalog to `backend/data/printerCatalog.js`:

1. `[R132781]` Bambu Lab A1 3D Printer
2. `[R100462]` Bambu Lab P1S Combo 3D Printer
3. `[R100463]` Bambu Lab P1S Multi-Colour 3D Printer
4. `[R214287]` ELEGOO Saturn 4 Ultra 16K 3D Printer
5. `[R190900]` Snapmaker Artisan 3-in-1 3D Printer
6. `[1644429]` Creality K1 Max AI Speedy 3D Printer
7. `[R256292]` Bambu Lab H2S AMS Combo 3D Printer

- The catalog is synchronized on backend startup without removing existing printer records.
- Bambu Lab printers default to the `bambulabs-api` provider.
- Non-Bambu printers remain configured for manual integration.

### Bambu Labs API Bridge

- Added optional integration with [`bambulabs-api` version `2.6.6`](https://pypi.org/project/bambulabs-api/).
- Added Python dependency file: `backend/requirements.txt`.
- Added Python MQTT status bridge: `backend/scripts/bambu_status.py`.
- Added Node-to-Python bridge service: `backend/services/bambuBridge.js`.
- Added endpoint:
  - `POST /api/printers/:printerId/sync` - fetch status from a configured Bambu Lab printer.
- Extended the printer model with:
  - `inventoryCode`
  - `manufacturer`
  - `apiProvider`
  - `ipAddress`
  - `serialNumber`
  - Hidden `accessCode`
- Printer access codes are excluded from normal API responses.

To enable live Bambu printer synchronization:

```powershell
pip install -r backend/requirements.txt
```

Then configure each Bambu printer from the admin dashboard. Live synchronization requires the printer IP address, serial number, and LAN access code. The H2S integration requires validation with the physical printer.

### Motion System

- Added a fabrication-inspired motion system across the landing page, admin dashboard, and user dashboard.
- Added staged entrance choreography for headings, metrics, login, and dashboard sections.
- Added a scanner-pass animation over the lab visual.
- Added smooth admin-tab and authentication-mode transitions.
- Added tactile hover elevation and button press feedback.
- Added smooth anchor navigation.
- Added full `prefers-reduced-motion` support for accessibility.

### Verification

- Frontend production build passes with `npm run build`.
- Focused frontend/backend ESLint checks pass.
- Backend JavaScript syntax checks pass.
- GitNexus change detection reports **medium risk**, limited to expected authentication, dashboard, user, and printer execution flows.

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
