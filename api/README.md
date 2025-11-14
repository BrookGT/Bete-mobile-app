# Bete API (Express + Prisma)

This is a minimal scaffold for the Bete backend. It uses Express and Prisma to talk to a Postgres database (Neon).

Quick start

1. Copy `.env.example` to `.env` and fill in your `DATABASE_URL` (Neon connection string) and `JWT_SECRET`.

2. Install dependencies

```powershell
cd api
npm install
```

3. Generate Prisma client and push schema to the database

```powershell
npm run prisma:generate
npm run prisma:push
```

4. Start server

```powershell
npm run dev
```

Endpoints

-   POST /signup { email, password, name? } -> { token, user }
-   POST /login { email, password } -> { token, user }
-   GET /properties -> { properties }

Notes

-   This scaffold stores password hashes (bcrypt) and issues JWTs. For production use you should:
    -   Use HTTPS and secure JWT storage on the client.
    -   Set proper CORS origins.
    -   Add email verification and rate limiting.
    -   Integrate social logins via a provider if needed.
