# Team Task Manager

A full-stack team task management application built with React, Node.js, Express, and MongoDB.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Tech Stack](https://img.shields.io/badge/Node.js-Express-green) ![Tech Stack](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen) ![Tech Stack](https://img.shields.io/badge/Tailwind_CSS-3-blue)

## Features

- **JWT Authentication** — Secure signup/login with bcrypt password hashing
- **Role-Based Access** — Admin and Member roles with granular permissions
- **Project Management** — Create, update, delete projects; manage team members
- **Task Management** — Kanban-style task board with Todo/In Progress/Done columns
- **Dashboard** — Personal task overview with stats, filters, and overdue alerts
- **User Management** — Admin panel for managing users and roles
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Dark Theme** — Premium glassmorphism UI with micro-animations

## Prerequisites

- **Node.js** >= 18.0.0
- **MongoDB** (local or cloud instance like MongoDB Atlas)
- **npm** or **yarn**

## Quick Start

### 1. Clone & Setup

```bash
git clone <your-repo-url>
cd team-task-manager
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env    # Edit .env with your settings
npm install
npm start
```

The backend runs on `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

### 4. Seed Database (Optional)

```bash
cd backend
npm run seed
```

This creates sample users, projects, and tasks:

| User | Email | Password | Role |
|------|-------|----------|------|
| Admin User | admin@taskmanager.com | admin123 | Admin |
| Alice Johnson | alice@taskmanager.com | password123 | Member |
| Bob Smith | bob@taskmanager.com | password123 | Member |
| Charlie Brown | charlie@taskmanager.com | password123 | Member |

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/team-task-manager
JWT_SECRET=your_super_secret_jwt_key_change_in_production
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |

### Users (Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/:id/role` | Update user role |
| DELETE | `/api/users/:id` | Delete user |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects` | Create project (Admin) |
| GET | `/api/projects` | List user's projects |
| GET | `/api/projects/:id` | Get project detail |
| PUT | `/api/projects/:id` | Update project (Admin) |
| DELETE | `/api/projects/:id` | Delete project (Admin) |
| POST | `/api/projects/:id/members` | Add member (Admin) |
| DELETE | `/api/projects/:id/members/:userId` | Remove member (Admin) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/my` | Get my tasks |
| GET | `/api/tasks/project/:projectId` | Get project tasks |
| GET | `/api/tasks/:id` | Get task detail |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

## Project Structure

```
project/
├── backend/
│   ├── config/db.js           # MongoDB connection
│   ├── controllers/           # Route handlers
│   ├── middleware/             # Auth & role middleware
│   ├── models/                # Mongoose schemas
│   ├── routes/                # Express routes
│   ├── seed/seed.js           # Sample data seeder
│   ├── server.js              # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/axios.js       # HTTP client
│   │   ├── components/        # Reusable components
│   │   ├── context/           # Auth context
│   │   ├── pages/             # Page components
│   │   ├── App.jsx            # Router
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Railway Deployment

### Option 1: Monorepo (Recommended)

Deploy backend and frontend as a single service. The backend serves the frontend build in production.

1. **Push to GitHub**

2. **Create a Railway project** at [railway.app](https://railway.app)

3. **Add a MongoDB service** (Railway Marketplace → MongoDB)

4. **Deploy the backend:**
   - Connect your GitHub repo
   - Set root directory: `backend`
   - Set build command: `cd ../frontend && npm install && npm run build && cd ../backend && npm install`
   - Set start command: `npm start`
   - Set environment variables:
     ```
     MONGODB_URI=<from Railway MongoDB service>
     JWT_SECRET=<generate a strong random string>
     NODE_ENV=production
     PORT=5000
     ```

5. **Generate a domain** in Railway settings

### Option 2: Separate Services

1. **Backend service:**
   - Root directory: `backend`
   - Build: `npm install`
   - Start: `npm start`
   - Add env vars (MONGODB_URI, JWT_SECRET, NODE_ENV=production)

2. **Frontend service:**
   - Root directory: `frontend`
   - Build: `npm install && npm run build`
   - Set `VITE_API_URL` to your backend Railway URL

3. **Update frontend `axios.js`** to use `VITE_API_URL` for the base URL

## Tech Stack

- **Frontend:** React 18, Tailwind CSS 3, React Router 6, Axios, Lucide Icons, date-fns
- **Backend:** Node.js, Express 4, Mongoose 8, JWT, bcrypt, express-validator
- **Database:** MongoDB

## License

MIT
