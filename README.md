# Employee Scheduling Application (MakeShift Assignment)

This project is a Nuxt 4 single-page scheduling app built for a technical interview assignment. It demonstrates role-based access, shift management, and a simple calendar view with frontend-only persistence for a lightweight review experience.

## Features Implemented

- Local authentication (admin and employee)
- Role-based route guards
- User management (admin only)
- Shift creation, update, and deletion
- Schedule/calendar view
- Employee read-only schedule view
- Drag and drop scheduling
- Unit tests with Vitest
- Frontend-only persistence via localStorage

## Tech Stack

- Nuxt 4
- Vue 3
- Pinia
- Tailwind CSS v4
- Vitest
- date-fns
- vuedraggable

## Project Setup

Node 18+ (or 20) is required.

```bash
npm run dev
```

## Authentication & Roles

Authentication is handled locally and stored in localStorage. There is no backend; the app seeds default users on first load. Admin users can manage employees and shifts, while employees can only view their own schedules.

Default credentials seeded from the users JSON:

| Role | Name | Email | Password |
| --- | --- | --- | --- |
| Admin | Alex Admin | <alex.admin@example.com> | AdminPass123! |
| Employee | Erin Employee | <erin.employee@example.com> | EmployeePass123! |
| Employee | Sam Scheduler | <sam.scheduler@example.com> | SchedulerPass123! |

## Data Persistence

All data is stored in the browser via localStorage, with no server-side database. This approach keeps the assignment focused on UI behavior, state management, and role-based access without requiring backend infrastructure.

## Testing

Unit tests are written with Vitest and focus on:

- Users store
- Shifts store
- Role-based logic

Run tests with:

```bash
npm run test
```

## Deployment

The app is deployed to Heroku as a standard Node-based Nuxt build. Typical deployment steps include:

```bash
npm run build
npm run start
```

This deployment is frontend-only and does not require a backend API. Deployed URL: _TBD_.
