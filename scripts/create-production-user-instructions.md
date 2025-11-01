# Fix Production Login - Manual Steps

## Quick Fix via Convex Dashboard

1. **Open Production Convex Dashboard:**

   ```bash
   # Open this URL in your browser:
   https://dashboard.convex.dev/t/hinoki-ai/plataforma-astral/industrious-manatee-7/data
   ```

2. **Find/Create User:**
   - Go to the `users` table
   - Search for `agustin@astral.cl`
3. **If user EXISTS:**
   - Click on the user row
   - Copy this bcrypt hash (password: `59163476a`):

   ```text
   $2a$10$nDqQE4yF7JvPz3qH.K5V.eZ3zM7xQW8JvGR5Y6tN8pKLmH9Q2tXWm
   ```

   - Update the `password` field with this hash
   - Make sure `isActive` is `true`
   - Save changes

4. **If user DOESN'T exist:**
   - Click "Insert Document"
   - Fill in:

     ```json
     {
       "email": "agustin@astral.cl",
       "password": "$2a$10$nDqQE4yF7JvPz3qH.K5V.eZ3zM7xQW8JvGR5Y6tN8pKLmH9Q2tXWm",
       "name": "Agustin - Master Admin",
       "role": "MASTER",
       "isActive": true,
       "isOAuthUser": false
     }
     ```

   - Click "Insert"

5. **Test Login:**
   - Go to: <https://plataforma.aramac.dev/login>
   - Email: `agustin@astral.cl`
   - Password: `59163476a`

---

## Alternative: Script Method (requires production access)

If you have Convex production deploy key:

```bash
# Set production deployment
CONVEX_DEPLOYMENT=prod:industrious-manatee-7 npx tsx scripts/fix-production-password.ts
```

Or set it in a `.env.production` file:

```bash
CONVEX_DEPLOYMENT=prod:industrious-manatee-7
```

Then run:

```bash
npx tsx scripts/fix-production-password.ts
```
