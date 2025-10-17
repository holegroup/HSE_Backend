# Super Admin Setup Guide

## Overview
This guide explains how to set up and use the Super Admin functionality in the HSE Inspection system.

## What's Been Implemented

### Backend Changes
1. **User Model Updated**: Added `superadmin` role to the user schema
2. **Authentication Enhanced**: Updated login and registration to support super admin role
3. **New API Endpoints**:
   - `GET /api/users/get-all-superadmins` - Get all super admin users
   - `GET /api/users/get-all-users` - Get all users (any role)
   - `GET /api/users/validate-super-admin` - Validate super admin access
4. **Middleware Protection**: Super admin endpoints are protected with authentication and role-based middleware

### Frontend Changes
1. **Role Selector Updated**: Added Super Admin option in registration and login
2. **New Super Admin Dashboard**: Complete dashboard with:
   - User statistics
   - Quick actions
   - User management
   - System overview
3. **Routing Updated**: Added super admin dashboard route
4. **Controllers**: New SuperAdminController for managing super admin functionality

## Super Admin Credentials

A default super admin account has been created:

**Email**: `superadmin@hsebuddy.com`  
**Password**: `superadmin123`  
**Role**: `superadmin`

## How to Use

### 1. Start the Backend Server
```bash
cd c:\Users\USER\Documents\GitHub\HSE_Backend
npm start
```

### 2. Login as Super Admin
1. Open the Flutter app
2. Go to Login page
3. Select "Super Admin" role
4. Enter the credentials above
5. Click Login

### 3. Super Admin Features
Once logged in, you'll have access to:

- **User Management**: View all users, create new users, manage roles
- **System Statistics**: See total counts of all user types
- **Full Permissions**: Access to all system features
- **User Creation**: Can create users with any role (inspector, supervisor, superadmin)

## Creating Additional Super Admins

### Method 1: Using the Script
```bash
cd c:\Users\USER\Documents\GitHub\HSE_Backend
node create_superadmin.js
```

### Method 2: Through Registration
1. Go to the signup page in the app
2. Select "Super Admin" role
3. Fill in the details
4. Register normally

### Method 3: Using API (for existing super admin)
Use the `/api/users/create-user` endpoint with super admin authentication.

## API Endpoints for Super Admin

### Authentication Required Endpoints
All these require `Authorization: Bearer <token>` header and super admin role:

- `POST /api/users/create-user` - Create any type of user
- `GET /api/users/get-all-users` - Get all users
- `GET /api/users/get-all-superadmins` - Get all super admins
- `GET /api/users/get-all-supervisors` - Get all supervisors  
- `GET /api/users/get-all-inspectors` - Get all inspectors

### Validation Endpoint
- `GET /api/users/validate-super-admin` - Check if current user is super admin

## Security Features

1. **Role-Based Access Control**: Super admin endpoints are protected
2. **JWT Authentication**: All protected routes require valid tokens
3. **Middleware Validation**: Double-check user roles on sensitive operations
4. **Password Hashing**: All passwords are bcrypt hashed

## Environment Variables

You can customize the default super admin credentials using environment variables:

```env
SUPERADMIN_NAME=Your Super Admin Name
SUPERADMIN_EMAIL=your-email@domain.com
SUPERADMIN_PASSWORD=your-secure-password
```

## Troubleshooting

### Can't Login as Super Admin
1. Ensure backend server is running
2. Check that super admin was created successfully
3. Verify you selected "Super Admin" role in login
4. Check network connectivity

### Super Admin Not Created
1. Ensure MongoDB is running
2. Check database connection in backend
3. Run the creation script again: `node create_superadmin.js`

### Permission Denied
1. Verify you're logged in as super admin
2. Check that JWT token is valid
3. Ensure super admin role is correctly set in database

## Next Steps

With super admin functionality in place, you can now:

1. **Manage Users**: Create, view, and manage all user accounts
2. **System Administration**: Full access to all system features
3. **Role Management**: Assign appropriate roles to users
4. **Monitor System**: View system statistics and user activity

## Files Modified/Created

### Backend Files
- `models/user.model.js` - Updated with superadmin role
- `controllers/userController.js` - Added super admin functions
- `routes/userRoutes.js` - Added super admin routes
- `middlewares/authMiddleware.js` - Super admin middleware
- `create_superadmin.js` - Super admin creation script

### Frontend Files
- `lib/views/superadmin/superadmin_dashboard.dart` - Super admin dashboard
- `lib/controllers/superadmin_controller.dart` - Super admin controller
- `lib/widgets/role_selector_widget.dart` - Updated with super admin option
- `lib/controllers/login_controller.dart` - Updated login logic
- `lib/main.dart` - Added super admin routing

The super admin system is now fully functional and ready for use!
