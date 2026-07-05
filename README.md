# SplitFlow (MERN Stack)

## Project Overview

A modern expense-sharing application built with the MERN stack. It supports authentication, groups, expense splitting, balances, settlements, and a responsive dashboard.

## Features

- User registration and login
- JWT authentication
- Create and manage groups
- Invite members by email
- Add expenses
- Equal expense splitting
- Simple balance tracking
- Debt simplification
- Responsive dashboard and profile page

## Folder Structure

- client/ - Vite + React frontend
- server/ - Express + MongoDB backend

## Installation

1. Clone the repo
2. Install frontend dependencies:
   - `cd client`
   - `npm install`
3. Install backend dependencies:
   - `cd ../server`
   - `npm install`

## Environment Variables

Create a `.env` file in the server folder using `.env.example` as a template.

## Run Frontend

```bash
cd client
npm run dev
```

## Run Backend

```bash
cd server
npm run dev
```

## Deployment Instructions

- Frontend: deploy the `client` app to Vercel
- Backend: deploy the `server` app to Render
- Database: use MongoDB Atlas and set `MONGO_URI`

## Future Improvements

- Add real-time updates
- Create settlement flow UI
- Improve expense splitting options
- Add friend suggestions and notifications
