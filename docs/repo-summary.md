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
