# Repository Summary — blog-api

This document summarizes the technology stack, repository structure, and server startup for the Node.js/Express + Mongoose API service in this repo.

## Stack

- Runtime: Node.js
- Web framework: Express (`express`)
- Database ODM: Mongoose (`mongoose`)
- Auth: JSON Web Tokens (`jsonwebtoken`), password hashing with `bcrypt`
- Validation: `joi`, `validator`
- Middleware/utilities: `cors`, `body-parser`
- Dev tooling: `nodemon` (dev), `env-cmd` to load env files

## Repository Structure

- `src/app.js` — Express app entrypoint; mounts routers and starts the HTTP server
- `src/db/mongoose.js` — connects to MongoDB using `process.env.MONGODB_URL`
- `src/middleware/auth.js` — JWT auth middleware; reads `Authorization: Bearer <token>` and attaches `req.user`
- `src/models/user.js` — `User` schema: `name`, `email` (unique), `password` (hashed), `user_type` (e.g. `ADMIN`, `CONTENT_WRITER`), `softDelete`, timestamps
- `src/models/blog.js` — `Blog` schema: `title`, `description`, `category`, `isApproved`, `owner` (ObjectId), `softDelete`, timestamps
- `src/routers/user.js` — user-facing routes (login/register, submit blog, list own blogs)
- `src/routers/blog.js` — public blog listing and blog-by-id
- `src/routers/admin.js` — admin-only user/blog management endpoints
- `package.json` — scripts and dependencies (`start`, `dev` with `env-cmd`)
- `README.md` — brief run note; see also this document for details

Note: `src/routers/auth.js` exists but is not currently mounted in `app.js`.

## Startup

The server is started from `src/app.js`:

1. Loads MongoDB connection by requiring `src/db/mongoose.js` (uses `process.env.MONGODB_URL`).
2. Creates an Express app, applies `body-parser` and `cors` middleware.
3. Mounts routers:
   - `app.use('/user', userRouter)`
   - `app.use('/admin', adminRouter)`
   - `app.use(blogRouter)` (mounted at root for public blog routes)
4. Listens on `process.env.PORT` and logs the port.

## API Endpoints

Base paths configured in `src/app.js`:

- `/user` — user-facing routes
- `/admin` — admin-only routes
- `/` (root) — public blog routes

All routes marked "Auth: JWT" require an `Authorization: Bearer <token>` header; the token encodes `{ _id, user_type }` and is verified with `JWT_SECRET` via `src/middleware/auth.js`.

User routes (`/user`):

- POST `/user/login` — Login with `email`, `password`, `user_type`. Returns user fields (sans password) plus `accessToken`.
  Auth: none
  Purpose: authenticate a user.
- POST `/user/register` — Register with `name`, `email`, `password`, `user_type`. Returns `{ user, token }`.
  Auth: none
  Purpose: create a new user.
- POST `/user/submit-blog` — Create a blog with `title`, `description`, `category`; sets `owner` to the authenticated user.
  Auth: JWT (any role)
  Purpose: submit a blog post for approval.
- GET `/user/blogs` — List blogs owned by the authenticated user where `softDelete=false`.
  Auth: JWT (any role)
  Purpose: view own blogs.

Public blog routes (root):

- GET `/` — List approved blogs (`isApproved=true`, `softDelete=false`).
  Auth: none
- GET `/:id` — Get a single blog by id if not soft-deleted.
  Auth: none

Admin routes (`/admin`):

- GET `/admin/users` — List users with `user_type=CONTENT_WRITER`.
  Auth: JWT + role `ADMIN`
- POST `/admin/user` — Create a `CONTENT_WRITER` user; body requires `name`, `email`, `password`.
  Auth: JWT + role `ADMIN`
- GET `/admin/delete-user/:id` — Delete a `CONTENT_WRITER` by id.
  Auth: JWT + role `ADMIN`
- PATCH `/admin/user/:userId` — Update `name` and/or `password` for a user by id.
  Auth: JWT + role `ADMIN`
  Note: current implementation applies updates to `req.user` instead of the target user; likely a bug.
- GET `/admin/deleted-blogs` — List soft-deleted blogs.
  Auth: JWT (any role)
- GET `/admin/deleted-users` — List soft-deleted users.
  Auth: JWT (any role)
- GET `/admin/pending-blogs` — List blogs pending approval (`isApproved=false`, `softDelete=false`).
  Auth: JWT (any role)
- GET `/admin/approve-blog/:id` — Mark a blog as approved.
  Auth: JWT (any role)
- GET `/admin/delete-blog/:id` — Soft-delete a blog.
  Auth: JWT (any role)
- GET `/admin/view-blog/:id` — View a blog by id (public).
  Auth: none
