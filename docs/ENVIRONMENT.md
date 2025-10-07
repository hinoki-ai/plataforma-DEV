# Environment Configuration

Set these in Vercel (Production) and locally for development.

## Required

- `NEXTAUTH_URL` – full site URL (e.g., `http://localhost:3000` or your Vercel domain)
- `NEXTAUTH_SECRET` – 32+ char secret
- `DATABASE_URL` – PostgreSQL connection string

## Optional (OAuth)

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## Media

- `CLOUDINARY_URL` – `cloudinary://KEY:SECRET@CLOUD_NAME`

## Notes

- Middleware and NextAuth depend on `NEXTAUTH_URL` being correct per environment.
- Ensure production `DATABASE_URL` is reachable from Vercel regions.
