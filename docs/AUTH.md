# Authentication & Authorization

- NextAuth v5 with Prisma adapter
- Credentials login for staff; Google OAuth optional
- Roles: `ADMIN`, `PROFESOR`, `PARENT`, `PUBLIC`

## Middleware

- Reads session to enforce route access:
  - `/admin/**` → ADMIN
  - `/profesor/**` → PROFESOR
  - `/parent/**` → PARENT
  - Public routes allowed
- Preserves `callbackUrl` on redirects after login

## Credentials Flow

- `authenticateUser` verifies email/password (bcrypt) against Prisma `user`
- Successful login attaches `user.role` to session for middleware

## Troubleshooting

- Login loop: ensure `NEXTAUTH_URL` and `NEXTAUTH_SECRET` are correct on Vercel
- 401 on protected routes: verify role mappings and session contents