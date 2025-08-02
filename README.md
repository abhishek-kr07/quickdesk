# QuickDesk - Help Desk Solution

A simple, easy-to-use help desk solution where users can raise support tickets, and support staff can manage and resolve them efficiently.

## Features

### For End Users
- User registration and authentication
- Create tickets with subject, description, category, and attachments
- View and track ticket status
- Search and filter tickets (open/closed, category, sorting)
- Threaded conversations with support agents
- Profile management and notifications

### For Support Agents
- Dashboard with multiple ticket queues (My Tickets, All Tickets)
- Assign and update ticket status
- Add comments and updates to tickets
- Reply to user tickets
- Create tickets on behalf of users

### For Admins
- User management (roles, permissions)
- Category management
- Overall ticket flow monitoring

## Tech Stack

- **Frontend**: React.js with Material-UI
- **Backend**: Node.js with Express
- **Authentication**: JWT tokens
- **File Upload**: Multer
- **Security**: bcryptjs, helmet, rate limiting

## Quick Start

1. **Install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Start development servers:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

```
quickdesk/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context for state management
│   │   ├── services/      # API service functions
│   │   └── utils/         # Utility functions
├── server/                # Node.js backend
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── models/          # Data models
│   └── utils/           # Utility functions
└── uploads/              # File upload directory
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Tickets
- `GET /api/tickets` - Get tickets (with filters)
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/:id` - Get ticket details
- `PUT /api/tickets/:id` - Update ticket
- `POST /api/tickets/:id/comments` - Add comment to ticket

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Users
- `GET /api/users` - Get all users (admin only)
- `PUT /api/users/:id` - Update user (admin only)

## Ticket Status Flow

1. **Open** - Initial state when ticket is created
2. **In Progress** - Assigned to support agent
3. **Resolved** - Issue resolved, waiting for user confirmation
4. **Closed** - Ticket closed after user confirmation

## User Roles

- **End User**: Can create and track their own tickets
- **Support Agent**: Can manage and resolve tickets
- **Admin**: Can manage users, categories, and overall system

## License

MIT License 