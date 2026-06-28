# Employee Management System

Full-stack employee management system with REST API, Redux state management, and modern UI.

## Features

- **Authentication**: JWT-based with role-based access (admin, manager, employee)
- **Employee Management**: CRUD with search, filter, pagination, validation
- **Departments**: Department cards with employee counts and budgets
- **Attendance**: Clock in/out, daily/monthly tracking, trend charts
- **Payroll**: Salary processing, allowances/deductions, status workflow
- **Settings**: Company, leave policies, payroll, email, UI settings
- **Charts**: Employee growth, salary expense, department expense, attendance trend
- **Dashboard**: KPI stats with summary cards

## Tech Stack

- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT
- **Frontend**: React, Redux Toolkit, Chart.js, React Router
- **UI**: Custom CSS with modern design system

## Quick Start

```bash
# Backend
cd backend
npm install
npm run seed    # Populate demo data
npm run dev     # Start on port 5000

# Frontend
cd frontend
npm install
npm start       # Start on port 3000
```

## Demo Credentials

| Role     | Email              | Password     |
|----------|--------------------|--------------|
| Admin    | admin@company.com  | password123  |
| Manager  | manager@company.com| password123  |
| Employee | john@company.com   | password123  |

## Docker

```bash
docker-compose up -d
```

## API Endpoints

| Method | Endpoint                | Description          |
|--------|-------------------------|----------------------|
| POST   | /api/auth/login         | Login                |
| POST   | /api/auth/register      | Register             |
| GET    | /api/employees          | List employees       |
| POST   | /api/employees          | Create employee      |
| PUT    | /api/employees/:id      | Update employee      |
| DELETE | /api/employees/:id      | Delete employee      |
| GET    | /api/departments        | List departments     |
| POST   | /api/attendance         | Record attendance    |
| GET    | /api/payroll            | List payroll         |
| GET    | /api/charts/dashboard   | Dashboard stats      |
| GET    | /api/settings           | Get settings         |
| PUT    | /api/settings           | Update settings      |
