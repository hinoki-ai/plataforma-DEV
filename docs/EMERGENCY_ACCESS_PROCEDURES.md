# Emergency Access Procedures

**System**: Plataforma Astral Educational Management System  
**Site**: <https://school.aramac.dev>  
**Last Updated**: September 1, 2025  
**Classification**: CONFIDENTIAL - AUTHORIZED PERSONNEL ONLY

## 🚨 EMERGENCY ACCESS OVERVIEW

When the standard authentication system fails, emergency access procedures ensure continued system availability for critical operations. These procedures should only be used when normal authentication is completely unavailable.

## 🔑 EMERGENCY ADMIN ACCESS

### Credentials (CONFIDENTIAL)

```text
Email: admin@plataforma-astral.com
Password: admin123
```

### Access Conditions

The emergency bypass activates automatically when:

1. Database connection fails completely
2. Standard authentication system is down
3. Prisma client errors prevent normal operation
4. System-wide authentication failure

### Technical Implementation

Located in `src/lib/auth-prisma.ts` at lines 27-40 and 82-94:

```typescript
// EMERGENCY BYPASS: Allow admin access when database is unavailable
if (
  email.toLowerCase() === "admin@plataforma-astral.com" &&
  password === "admin123"
) {
  logger.warn("EMERGENCY BYPASS: Admin authentication without database", {
    email,
  });
  return {
    id: "emergency-admin-id",
    email: "admin@plataforma-astral.com",
    name: "Emergency Admin",
    role: "ADMIN",
  };
}
```

## 🚨 WHEN TO USE EMERGENCY ACCESS

### Authorized Use Cases

1. **Complete Authentication Failure**: No users can log in through normal channels
2. **Database Outage**: Database server is completely unavailable
3. **Critical System Maintenance**: Urgent fixes needed when authentication is broken
4. **Security Incident Response**: Need immediate admin access during security events

### UNAUTHORIZED Use Cases

- ❌ Convenience when regular login is slow
- ❌ Bypassing forgotten passwords
- ❌ Testing or development purposes
- ❌ Regular administrative tasks
- ❌ When normal authentication is working

## 🔒 SECURITY CONSIDERATIONS

### Logging and Monitoring

All emergency access usage is automatically logged:

```typescript
logger.warn("EMERGENCY BYPASS: Admin authentication without database", {
  email,
});
logger.warn("DATABASE DOWN: Using emergency admin bypass", { email });
```

### Access Tracking

- Every emergency login is logged with timestamp
- IP address and user agent recorded
- Duration of emergency session tracked
- Actions performed under emergency access logged

### Post-Emergency Audit

After each emergency access event:

1. Review all actions taken during emergency session
2. Verify no unauthorized changes made
3. Document reason for emergency access
4. Update security logs and incident reports

## 📋 EMERGENCY ACCESS PROCEDURES

### Step 1: Verify Emergency Conditions (2 minutes)

Before using emergency access, confirm standard authentication is truly unavailable:

```bash
# Test standard authentication endpoints
curl -s https://school.aramac.dev/api/auth/session
curl -I https://school.aramac.dev/login

# Test database connectivity
npm run verify-supabase

# Check system status
npx vercel ls | head -5
```

If any of these work, emergency access is NOT authorized.

### Step 2: Document Emergency Event (1 minute)

Create incident log entry:

```text
Timestamp: [Current UTC time]
Reporter: [Your name/role]
Issue: [Brief description of failure]
Impact: [Users/systems affected]
Emergency Access Initiated: YES
Authorization: [Manager name if available]
```

### Step 3: Access System (30 seconds)

1. Navigate to <https://school.aramac.dev/login>
2. Enter emergency credentials:
   - Email: <admin@plataforma-astral.com>
   - Password: admin123
3. Verify successful login with admin privileges

### Step 4: Perform Only Critical Actions

Emergency access should be used ONLY for:

- Fixing authentication system issues
- Restoring database connectivity
- Addressing security vulnerabilities
- Critical data recovery operations

### Step 5: Restore Normal Authentication

Work to restore standard authentication as quickly as possible:

```bash
# Common restoration steps
npx vercel env ls | grep NEXTAUTH_URL
npx vercel --prod
npx convex dashboard  # Create admin user manually
```

### Step 6: Document Resolution (5 minutes)

Update incident log:

```text
Resolution Time: [UTC timestamp]
Actions Taken: [List of emergency actions]
Normal Auth Restored: [YES/NO]
Follow-up Required: [Any pending actions]
```

## 🛡️ SECURITY PROTOCOLS

### Access Authorization Matrix

| Scenario                | Authorization Required    | Max Duration |
| ----------------------- | ------------------------- | ------------ |
| Complete system failure | None (emergency)          | 24 hours     |
| Database outage         | IT Manager approval       | 12 hours     |
| Security incident       | Security Officer approval | 6 hours      |
| Maintenance window      | Development Lead approval | 4 hours      |

### Mandatory Reporting

All emergency access must be reported within 24 hours to:

- System administrator
- Security officer (if available)
- Project owner
- Development team lead

### Password Rotation Policy

Emergency access password must be rotated:

- After each use
- Every 90 days minimum
- Immediately if suspected compromise
- When staff with access leave

## 🔧 TECHNICAL RECOVERY PROCEDURES

### Database Connection Recovery

```bash
# Check database status
npm run verify-supabase

# Regenerate database client
npx prisma generate

# Test connection
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$queryRaw\`SELECT 1\`
  .then(() => console.log('✅ DB Connected'))
  .catch(e => console.log('❌ DB Error:', e.message))
  .finally(() => prisma.\$disconnect());
"
```

### Authentication System Recovery

```bash
# Verify environment variables
npx vercel env ls | grep -E "NEXTAUTH|DATABASE"

# Check NEXTAUTH_URL matches domain
npx vercel env ls | grep NEXTAUTH_URL
# Should show: https://school.aramac.dev

# Force redeploy if needed
npx vercel --prod --force
```

### User Account Recovery

```bash
# Recreate standard admin user
npm run create-admin

# Create all test users
npm run create-all-test-users

# Verify user creation
npm run verify-users
```

## 🚨 INCIDENT ESCALATION

### Level 1: Emergency Access Successful (0-30 minutes)

- Emergency credentials work
- System accessible via emergency bypass
- Focus on identifying and fixing root cause

### Level 2: Emergency Access Fails (30+ minutes)

- Emergency credentials don't work
- Complete system failure
- Escalate to infrastructure team immediately

### Level 3: Security Incident (Any time)

- Suspected unauthorized access
- Evidence of system compromise
- Data breach indicators
- Immediate security team notification required

## 📞 EMERGENCY CONTACTS

### Primary Contacts (24/7)

- **System Administrator**: [Contact info]
- **Development Team Lead**: [Contact info]
- **Project Owner**: [Contact info]

### Secondary Contacts (Business hours)

- **Security Officer**: [Contact info]
- **Database Administrator**: [Contact info]
- **Vercel Support**: <https://vercel.com/support>

### External Support

- **Supabase Support**: <https://supabase.com/support>
- **NextAuth.js Community**: <https://github.com/nextauthjs/next-auth/discussions>

## 🔄 POST-INCIDENT PROCEDURES

### Immediate (Within 1 hour)

1. Document all actions taken during emergency access
2. Verify normal authentication is restored
3. Test all user roles can access system normally
4. Create incident report with timeline

### Short-term (Within 24 hours)

1. Rotate emergency access password
2. Review security logs for any anomalies
3. Update monitoring to detect similar issues
4. Notify all stakeholders of resolution

### Long-term (Within 1 week)

1. Conduct root cause analysis
2. Update emergency procedures if needed
3. Test emergency access functionality
4. Review and update documentation

## ⚠️ IMPORTANT REMINDERS

### DO's

- ✅ Document all emergency access usage
- ✅ Use only for genuine emergencies
- ✅ Restore normal authentication ASAP
- ✅ Report usage to appropriate personnel
- ✅ Follow security protocols strictly

### DON'Ts

- ❌ Share emergency credentials with unauthorized personnel
- ❌ Use for routine administrative tasks
- ❌ Leave emergency session active longer than necessary
- ❌ Modify emergency bypass code without approval
- ❌ Skip documentation requirements

---

**CONFIDENTIAL**: This document contains sensitive security information.  
**Access restricted to**: Authorized system administrators only.  
**Last emergency usage**: [To be updated when used]  
**Next password rotation due**: December 1, 2025
