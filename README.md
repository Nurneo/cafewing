# Themis - Café Order Assistant

A modern, real-time café order management system built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### 🔐 Authentication & Authorization
- Role-based access control (Waiter/Administrator)
- Secure authentication with Supabase Auth
- Row Level Security (RLS) for data protection

### 📱 Real-time Order Management
- Create, read, update, and delete orders
- Real-time updates across all connected clients
- Order status tracking (Pending, In Progress, Completed, Updated)
- Comprehensive order details with items and pricing

### 🍽️ Menu Management
- Dynamic menu item management
- Category-based organization
- Real-time menu updates
- Search and filter functionality

### 👥 User Management
- User profiles with roles
- Admin dashboard for user oversight
- Secure user authentication

### 📊 Analytics & Reporting
- Order statistics and analytics
- Revenue tracking
- Export functionality (CSV)
- Real-time dashboard updates

### 🎨 Modern UI/UX
- Dark theme with professional aesthetics
- Responsive design for all devices
- Smooth animations and transitions
- Touch-optimized interface

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Icons**: Lucide React
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd themis
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Copy the project URL and anon key
   - Create a `.env` file based on `.env.example`
   ```bash
   cp .env.example .env
   ```
   - Fill in your Supabase credentials in `.env`

4. **Run database migrations**
   - In your Supabase dashboard, go to the SQL Editor
   - Run the migration files in order:
     1. `supabase/migrations/create_users_table.sql`
     2. `supabase/migrations/create_orders_table.sql`
     3. `supabase/migrations/create_order_items_table.sql`
     4. `supabase/migrations/create_menu_items_table.sql`

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Database Schema

### Users Table
- `id` (uuid, primary key)
- `name` (text)
- `role` (text: 'waiter' | 'admin')
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Orders Table
- `id` (uuid, primary key)
- `table_number` (text)
- `status` (text: 'pending' | 'in-progress' | 'completed' | 'updated')
- `notes` (text, optional)
- `base_price` (numeric)
- `service_fee_price` (numeric)
- `waiter_id` (uuid, foreign key)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Order Items Table
- `id` (uuid, primary key)
- `order_id` (uuid, foreign key)
- `item_name` (text)
- `quantity` (integer)
- `price` (numeric)

### Menu Items Table
- `id` (uuid, primary key)
- `name` (text)
- `price` (numeric)
- `category` (text)
- `is_available` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Security Features

### Row Level Security (RLS)
- **Users**: Users can read their own data; admins can read all users
- **Orders**: Waiters can only manage their own orders; admins can manage all orders
- **Order Items**: Access tied to order ownership
- **Menu Items**: All authenticated users can read; only admins can modify

### Authentication
- Email/password authentication
- Role-based access control
- Secure session management
- Automatic token refresh

## Real-time Features

- **Order Updates**: Live updates when orders are created, modified, or deleted
- **Menu Changes**: Real-time menu item updates
- **Status Changes**: Instant status updates across all connected clients
- **Multi-user Support**: Multiple users can work simultaneously with live updates

## API Integration

The application uses Supabase's JavaScript client for:
- Authentication (`supabase.auth`)
- Database operations (`supabase.from()`)
- Real-time subscriptions (`supabase.channel()`)
- Row Level Security enforcement

## Development

### Project Structure
```
src/
├── components/          # React components
│   ├── admin/          # Admin-specific components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   ├── layout/         # Layout components
│   ├── orders/         # Order management components
│   └── ui/             # Reusable UI components
├── context/            # React context providers
├── lib/                # Library configurations
├── services/           # API service layer
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

### Key Services

- **SupabaseService**: Handles all database operations and real-time subscriptions
- **AuthContext**: Manages authentication state and user sessions
- **ThemeContext**: Handles theme management

## Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform**
   - Vercel, Netlify, or any static hosting service
   - Ensure environment variables are configured

3. **Configure Supabase**
   - Add your deployment URL to Supabase Auth settings
   - Configure RLS policies if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.