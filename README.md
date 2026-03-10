# Authenticated Tasks System

REST API with Sequelize, SQLite, and session-based authentication.

## Features

- User registration with hashed passwords (`bcryptjs`)
- User login with session creation (`express-session`)
- Authentication middleware protecting routes
- User logout via session destroy
- Foreign key relationships:
  - User hasMany Projects
  - Project belongsTo User
  - Project hasMany Tasks
  - Task belongsTo Project

## Setup

1. Install dependencies:
   `npm install`
2. Configure env:
   copy `.env.example` to `.env`
3. Create database:
   `npm run setup`
4. Seed sample data:
   `npm run seed`
5. Start server:
   `npm start`

## Auth Endpoints

- `POST /api/register`
- `POST /api/login`
- `POST /api/logout`

## Protected Endpoints

- `GET /api/projects`
- `GET /api/tasks`
