# Admin Frontend - Authentication System

This is a Next.js-based admin portal with role-based authentication for **Assistant** and **Director** roles.

## Features

✅ User authentication with email and password
✅ Role-based access control (Assistant & Director)
✅ Protected routes and components
✅ JWT/Session-based authentication
✅ Logout functionality
✅ Responsive design with Tailwind CSS

## Setup Instructions

### Prerequisites
- Node.js 18+
- Backend API running at `http://localhost:8000/api`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and update the API URL if needed:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
admin-frontend/
├── app/
│   ├── context/
│   │   └── AuthContext.tsx          # Authentication context & hooks
│   ├── components/
│   │   └── ProtectedRoute.tsx       # Route protection component
│   ├── login/
│   │   └── page.tsx                 # Login page
│   ├── dashboard/
│   │   ├── page.tsx                 # Main dashboard
│   │   └── users/
│   │       └── page.tsx             # User management (Director only)
│   ├── unauthorized/
│   │   └── page.tsx                 # 403 Unauthorized page
│   ├── layout.tsx                   # Root layout with AuthProvider
│   └── page.tsx                     # Home redirect page
└── .env.local                       # Environment variables
```

## Authentication Flow

### Login Process
1. User enters email and password on login page
2. Credentials sent to backend `/api/login` endpoint
3. Backend validates credentials and returns user data + token
4. Token stored in localStorage
5. User redirected to dashboard

### Session Management
- Tokens stored in `localStorage` as `auth_token`
- User data stored in `localStorage` as `auth_user`
- Authentication state managed via React Context
- Automatic redirect to login if not authenticated

## Role-Based Access

### Assistant Role
- Can access main dashboard
- Limited permissions
- Access to support and request pages

### Director Role
- Can access all pages
- Full admin privileges
- User management
- System settings
- Audit logs

## Available Pages

### Public Pages
- `/` - Home (redirects to dashboard or login)
- `/login` - Login page

### Protected Pages (Both Roles)
- `/dashboard` - Main dashboard with role-specific content

### Director-Only Pages
- `/dashboard/users` - User management
- `/dashboard/settings` - System settings
- `/dashboard/logs` - Audit logs

### Error Pages
- `/unauthorized` - 403 Forbidden page

## Test Credentials

### Assistant Account
- Email: `assistant@example.com`
- Password: `password123`

### Director Account
- Email: `director@example.com`
- Password: `password123`

> **Note:** These credentials are seeded from the backend database. Make sure the backend is running and migrations are executed.

## Authentication Context API

### useAuth Hook

```typescript
const { user, token, loading, login, logout, isAuthenticated } = useAuth();
```

- `user` - Current authenticated user object
- `token` - Current auth token
- `loading` - Loading state during auth check
- `login(email, password)` - Login function
- `logout()` - Logout function
- `isAuthenticated` - Boolean indicating if user is authenticated

### ProtectedRoute Component

```typescript
<ProtectedRoute allowedRoles={['director']}>
  <YourComponent />
</ProtectedRoute>
```

- `allowedRoles` - Array of allowed roles (optional)
- Automatically redirects to login if not authenticated
- Redirects to unauthorized page if role not allowed

## Backend Integration

The frontend communicates with the Laravel backend at:
- Base URL: `http://localhost:8000/api`

### Authentication Endpoints
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `POST /api/logout` - User logout
- `GET /api/me` - Get current user

## Styling

The application uses:
- **Tailwind CSS** v4 for styling
- **PostCSS** for CSS processing
- Responsive design patterns

## Build for Production

```bash
npm run build
npm run start
```

## Troubleshooting

### Login fails
- Verify backend is running
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure database migrations are run: `php artisan migrate:fresh --seed`

### Protected routes redirect to login
- Clear localStorage and try again
- Check if token has expired
- Verify user role in database

### CORS errors
- Ensure backend CORS is configured correctly
- Frontend URL should be in backend CORS whitelist

## Development Notes

- The app uses Next.js 16 with React 19
- TypeScript for type safety
- Client-side authentication (change to server-side for production)
- Consider implementing JWT refresh tokens for better security

## Next Steps

1. Implement user management UI (for directors)
2. Add audit logging
3. Create settings management page
4. Implement password reset functionality
5. Add two-factor authentication
6. Set up API rate limiting

## Support

For issues or questions, please refer to the backend documentation or contact the development team.
