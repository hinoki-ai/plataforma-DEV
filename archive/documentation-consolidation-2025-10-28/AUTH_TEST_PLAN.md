# Authentication System Test Plan

## Test Environment Setup

### Prerequisites

1. Development server running: `npm run dev` (Terminal 1)
2. Convex dev server running: `npx convex dev` (Terminal 2)
3. Test users seeded in database (use `npx tsx scripts/seed-convex.ts`)

### Test Users

| Role     | Email                          | Password    |
| -------- | ------------------------------ | ----------- |
| MASTER   | admin@plataforma-astral.com    | admin123    |
| ADMIN    | admin@plataforma-astral.com    | admin123    |
| PROFESOR | profesor@plataforma-astral.com | profesor123 |
| PARENT   | parent@plataforma-astral.com   | parent123   |

## Critical Test Cases

### 1. MASTER Role Login

**Priority**: HIGH
**Steps**:

1. Navigate to http://localhost:3000/login
2. Enter MASTER credentials
3. Click login button
4. Observe console logs for:
   - "Authentication successful"
   - "AuthSuccess - Status: authenticated"
   - "AuthSuccess - Redirecting to /master (role: MASTER)"

**Expected Result**:

- ✅ Redirected to `/master` dashboard
- ✅ No redirect loops
- ✅ Session persists on page refresh
- ✅ Can access MASTER-only routes

**Pass Criteria**: Successfully lands on MASTER dashboard within 2 seconds

---

### 2. ADMIN Role Login

**Priority**: HIGH
**Steps**:

1. Navigate to http://localhost:3000/login
2. Enter ADMIN credentials
3. Click login button

**Expected Result**:

- ✅ Redirected to `/admin` dashboard
- ✅ No redirect loops
- ✅ Session persists on page refresh

**Pass Criteria**: Successfully lands on ADMIN dashboard within 2 seconds

---

### 3. PROFESOR Role Login

**Priority**: HIGH
**Steps**:

1. Navigate to http://localhost:3000/login
2. Enter PROFESOR credentials
3. Click login button

**Expected Result**:

- ✅ Redirected to `/profesor` dashboard
- ✅ No redirect loops
- ✅ Session persists on page refresh

**Pass Criteria**: Successfully lands on PROFESOR dashboard within 2 seconds

---

### 4. PARENT Role Login

**Priority**: HIGH
**Steps**:

1. Navigate to http://localhost:3000/login
2. Enter PARENT credentials
3. Click login button

**Expected Result**:

- ✅ Redirected to `/parent` dashboard
- ✅ No redirect loops
- ✅ Session persists on page refresh

**Pass Criteria**: Successfully lands on PARENT dashboard within 2 seconds

---

### 5. Invalid Credentials

**Priority**: HIGH
**Steps**:

1. Navigate to http://localhost:3000/login
2. Enter invalid email/password
3. Click login button

**Expected Result**:

- ✅ Error message displayed: "Credenciales inválidas..."
- ✅ User stays on login page
- ✅ No redirect occurs

**Pass Criteria**: Error message shown, no redirect

---

### 6. Protected Route Access (Unauthenticated)

**Priority**: HIGH
**Steps**:

1. Ensure logged out
2. Navigate directly to http://localhost:3000/admin

**Expected Result**:

- ✅ Redirected to `/login?callbackUrl=/admin`
- ✅ After login, redirected back to `/admin`

**Pass Criteria**: Proper redirect to login with callback preservation

---

### 7. Protected Route Access (Wrong Role)

**Priority**: HIGH
**Steps**:

1. Login as PARENT
2. Try to access http://localhost:3000/admin

**Expected Result**:

- ✅ Redirected to `/parent` (their allowed dashboard)
- ✅ Console shows "Unauthorized access attempt"

**Pass Criteria**: Cannot access unauthorized route

---

### 8. Session Persistence

**Priority**: HIGH
**Steps**:

1. Login as any role
2. Navigate to dashboard
3. Refresh page (F5)

**Expected Result**:

- ✅ User stays logged in
- ✅ Remains on same dashboard
- ✅ No redirect to login

**Pass Criteria**: Session persists across refresh

---

### 9. Logout Flow

**Priority**: HIGH
**Steps**:

1. Login as any role
2. Click logout button
3. Observe behavior

**Expected Result**:

- ✅ Redirected to `/login`
- ✅ Session cleared
- ✅ Cannot access protected routes
- ✅ Trying to access protected route redirects to login

**Pass Criteria**: Complete logout with session cleared

---

### 10. Concurrent Login Attempts

**Priority**: MEDIUM
**Steps**:

1. Open login page
2. Rapidly click login button 5 times

**Expected Result**:

- ✅ Only one authentication attempt processed
- ✅ No double redirects
- ✅ Loading state prevents multiple submissions

**Pass Criteria**: Clean single login, no race conditions

---

### 11. OAuth Google Login (if enabled)

**Priority**: MEDIUM
**Steps**:

1. Navigate to login page
2. Click Google OAuth button
3. Complete Google authentication

**Expected Result**:

- ✅ For PARENT users: redirected to parent dashboard
- ✅ For non-PARENT users: OAuth blocked (teachers must use credentials)

**Pass Criteria**: OAuth works for parents only

---

### 12. Auth Success Timeout

**Priority**: LOW
**Steps**:

1. Manually navigate to http://localhost:3000/auth-success
2. Wait 10 seconds without valid session

**Expected Result**:

- ✅ After 10s timeout, redirected to `/`
- ✅ Console shows "Timeout reached"

**Pass Criteria**: Timeout safety mechanism works

---

### 13. Browser Back Button After Login

**Priority**: MEDIUM
**Steps**:

1. Login successfully
2. Reach dashboard
3. Click browser back button

**Expected Result**:

- ✅ Should redirect back to dashboard (not login)
- ✅ Middleware prevents accessing login when authenticated

**Pass Criteria**: Cannot go back to login after successful authentication

---

### 14. Multiple Browser Tabs

**Priority**: MEDIUM
**Steps**:

1. Login in Tab 1
2. Open Tab 2 to same site
3. Logout in Tab 1
4. Try to navigate in Tab 2

**Expected Result**:

- ✅ Tab 2 eventually recognizes logout
- ✅ Protected routes redirect to login

**Pass Criteria**: Session state synchronized across tabs

---

## Performance Tests

### 15. Login Performance

**Priority**: MEDIUM
**Metric**: Time from login submit to dashboard load
**Target**: < 2 seconds

**Pass Criteria**: 90% of logins complete within 2 seconds

---

### 16. Middleware Performance

**Priority**: MEDIUM
**Metric**: Middleware execution time per request
**Target**: < 50ms

**Pass Criteria**: No noticeable delay on navigation

---

## Edge Cases

### 17. Expired Session

**Priority**: HIGH
**Steps**:

1. Login
2. Manually expire session (after 24 hours or manipulate JWT)
3. Try to access protected route

**Expected Result**:

- ✅ Redirected to login
- ✅ No errors in console

**Pass Criteria**: Graceful handling of expired sessions

---

### 18. Invalid JWT Token

**Priority**: HIGH
**Steps**:

1. Login
2. Manually corrupt JWT token in cookies
3. Try to access protected route

**Expected Result**:

- ✅ Redirected to login
- ✅ Console shows auth validation failed

**Pass Criteria**: Middleware catches invalid token

---

### 19. Missing Role in Session

**Priority**: HIGH
**Steps**:

1. Manually create session without role field
2. Navigate to auth-success

**Expected Result**:

- ✅ After 3 retries, redirected to login
- ✅ Console shows "invalid role"

**Pass Criteria**: Validation catches missing role

---

## Browser Compatibility

### 20. Cross-Browser Testing

**Priority**: MEDIUM
**Browsers to Test**:

- Chrome/Chromium
- Firefox
- Safari (if available)
- Edge

**Pass Criteria**: Auth works identically across all browsers

---

## Security Tests

### 21. XSS Protection

**Priority**: HIGH
**Steps**:

1. Try to inject script in email field: `<script>alert('xss')</script>`
2. Submit login

**Expected Result**:

- ✅ Script not executed
- ✅ Validation rejects input

**Pass Criteria**: No XSS vulnerability

---

### 22. SQL Injection Protection

**Priority**: HIGH
**Steps**:

1. Try SQL injection in email: `admin' OR '1'='1`
2. Submit login

**Expected Result**:

- ✅ Login fails
- ✅ No database error

**Pass Criteria**: Convex/auth layer protects against injection

---

### 23. Rate Limiting

**Priority**: MEDIUM
**Steps**:

1. Make 10+ rapid login attempts

**Expected Result**:

- ✅ After threshold, rate limit kicks in
- ✅ 429 status returned

**Pass Criteria**: Rate limiting prevents brute force

---

## Test Results Template

```markdown
## Test Execution Results

**Date**: \***\*\_\_\_\*\***
**Tester**: \***\*\_\_\_\*\***
**Environment**: Development / Production

| Test # | Test Name                    | Status                      | Notes |
| ------ | ---------------------------- | --------------------------- | ----- |
| 1      | MASTER Login                 | ⬜ PASS / ❌ FAIL           |       |
| 2      | ADMIN Login                  | ⬜ PASS / ❌ FAIL           |       |
| 3      | PROFESOR Login               | ⬜ PASS / ❌ FAIL           |       |
| 4      | PARENT Login                 | ⬜ PASS / ❌ FAIL           |       |
| 5      | Invalid Credentials          | ⬜ PASS / ❌ FAIL           |       |
| 6      | Protected Route (Unauth)     | ⬜ PASS / ❌ FAIL           |       |
| 7      | Protected Route (Wrong Role) | ⬜ PASS / ❌ FAIL           |       |
| 8      | Session Persistence          | ⬜ PASS / ❌ FAIL           |       |
| 9      | Logout Flow                  | ⬜ PASS / ❌ FAIL           |       |
| 10     | Concurrent Login             | ⬜ PASS / ❌ FAIL           |       |
| 11     | OAuth Google                 | ⬜ PASS / ❌ FAIL / ⬜ SKIP |       |
| 12     | Auth Success Timeout         | ⬜ PASS / ❌ FAIL           |       |
| 13     | Back Button                  | ⬜ PASS / ❌ FAIL           |       |
| 14     | Multiple Tabs                | ⬜ PASS / ❌ FAIL           |       |
| 15     | Login Performance            | ⬜ PASS / ❌ FAIL           |       |
| 16     | Middleware Performance       | ⬜ PASS / ❌ FAIL           |       |
| 17     | Expired Session              | ⬜ PASS / ❌ FAIL           |       |
| 18     | Invalid JWT                  | ⬜ PASS / ❌ FAIL           |       |
| 19     | Missing Role                 | ⬜ PASS / ❌ FAIL           |       |
| 20     | Cross-Browser                | ⬜ PASS / ❌ FAIL           |       |
| 21     | XSS Protection               | ⬜ PASS / ❌ FAIL           |       |
| 22     | SQL Injection                | ⬜ PASS / ❌ FAIL           |       |
| 23     | Rate Limiting                | ⬜ PASS / ❌ FAIL           |       |

**Overall Result**: ⬜ ALL PASS / ❌ FAILURES FOUND

**Failures** (if any):

---

**Notes**:

---
```

## Deployment Authorization

### Sign-Off Required

- [ ] All HIGH priority tests PASS
- [ ] At least 90% of MEDIUM priority tests PASS
- [ ] No CRITICAL bugs found
- [ ] Performance targets met
- [ ] Security tests pass

**Authorized by**: \***\*\_\_\_\*\***
**Date**: \***\*\_\_\_\*\***
**Ready for Production**: YES / NO
