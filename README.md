# Project Management SaaS Platform

A production-ready SaaS application for freelancers and agencies to manage clients, projects, tasks, and payments.

## Features

- **Auth**: JWT with Refresh Tokens, Role-based Access (Admin/Client).
- **Projects**: CRUD, filtering, searching.
- **Tasks**: Management within projects with real-time updates.
- **Payments**: Integrated Stripe Checkout with Webhook verification.
- **Design**: Modern, dark-themed UI using Tailwind CSS and Framer Motion.

## Tech Stack

- **Backend**: Node.js, Express, MySQL, Sequelize ORM.
- **Frontend**: React (Vite), Tailwind CSS, Axios, React Router.
- **Real-time**: Socket.io.
- **Payments**: Stripe API.

## Setup Instructions

### 1. Database Setup
1. Create a MySQL database named `saas_project_management`.
2. Update `server/.env` with your database credentials.

### 2. Backend Setup
```bash
cd server
npm install
# Run migrations
npx sequelize-cli db:migrate
# Seed database (optional)
npx sequelize-cli db:seed:all
# Start server
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
# Update .env if necessary (default VITE_API_URL is http://localhost:5000/api)
npm run dev
```

### 4. Stripe Integration
1. Obtain your Stripe Secret Key and Webhook Secret from the Stripe Dashboard.
2. Update `server/.env` with these keys.
3. Use Stripe CLI to forward webhooks: `stripe listen --forward-to localhost:5000/api/payments/webhook`.

## Folder Structure

- `/client`: React frontend application.
- `/server`: Node.js Express backend.
  - `/config`: Database configuration.
  - `/controllers`: Logic for each module.
  - `/models`: Sequelize model definitions.
  - `/routes`: API endpoints.
  - `/middlewares`: Auth and Role protection.
  - `/services`: Third-party integrations (Stripe, Socket.io).
  - `/migrations`: Database schema history.
  - `/seeders`: Sample data.
