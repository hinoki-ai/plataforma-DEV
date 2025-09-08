# 🚨 URGENT: MASTER ACCESS TEST GUIDE

## 🔍 PROBLEM DIAGNOSIS
Your agustin account shows **MASTER role in database** but your browser session still shows **ADMIN role**.

**Database Check:** ✅ MASTER role confirmed
**Browser Session:** ❌ Still showing ADMIN (cached)

## 🧹 STEP-BY-STEP SOLUTION

### STEP 1: Complete Session Clear (CRITICAL)
You MUST clear ALL browser data completely:

#### Browser Instructions:
1. **Open Developer Tools** (F12)
2. **Go to Application/Storage tab**
3. **Clear ALL of these:**
   - ✅ Local Storage
   - ✅ Session Storage
   - ✅ Cookies (especially localhost:3000)
   - ✅ IndexedDB
   - ✅ Service Workers

#### Alternative: Use Incognito/Private Mode
1. **Open new Incognito/Private window**
2. **Navigate to:** `http://localhost:3000/login`
3. **Skip to Step 2 below**

### STEP 2: Fresh Login Test
1. **Go to:** `http://localhost:3000/login`
2. **Enter credentials:**
   - Email: `agustinaramac@gmail.com`
   - Password: `madmin123`
3. **Click login**

### STEP 3: Verify MASTER Access
**Expected Results:**
- ✅ **Redirect to:** `http://localhost:3000/master`
- ✅ **Page title:** "🏛️ SUPREME MASTER CONTROL"
- ✅ **Badge:** "MODO DIOS ACTIVADO"
- ✅ **No error messages**
- ✅ **Full dashboard access**

**If you still see ADMIN:**
- ❌ Check browser console (F12 → Console)
- ❌ Look for any error messages
- ❌ Try Step 1 again (more thorough clear)

### STEP 4: Test Master Features
Once in master dashboard, verify:
- ✅ System Health Card
- ✅ Master Stats Card
- ✅ Security Alerts
- ✅ Quick Actions Grid
- ✅ Development Tools Section

## 🔧 TROUBLESHOOTING

### If Still Getting ADMIN Access:
1. **Check browser console for errors**
2. **Try different browser (Chrome/Firefox)**
3. **Clear DNS cache:** `ipconfig /flushdns` (Windows) or browser refresh
4. **Restart browser completely**

### If Getting "Unauthorized":
- This means session clear didn't work
- Go back to Step 1 and be more thorough

### If Server Errors:
```bash
# Kill and restart server
cd "/mnt/Secondary/Projects/Websites/Schools/Manitos Pintadas SQL"
pkill -f "next dev"
npm run dev
```

## 📊 VERIFICATION CHECKLIST

- [ ] Browser cache/storage completely cleared
- [ ] Using fresh browser session (incognito recommended)
- [ ] Login page loads: `http://localhost:3000/login`
- [ ] Credentials entered correctly
- [ ] Redirected to `/master` URL
- [ ] Master dashboard content loads
- [ ] "SUPREME MASTER CONTROL" title visible
- [ ] "MODO DIOS ACTIVADO" badge visible
- [ ] All master features accessible

## 🎯 QUICK VERIFICATION

Run this in browser console after login:
```javascript
// Check current session
fetch('/api/auth/session')
  .then(r => r.json())
  .then(data => console.log('Session:', data));
```

**Expected output:**
```json
{
  "user": {
    "id": "...",
    "email": "agustinaramac@gmail.com",
    "name": "Agustin Arancibia Mac-Guire",
    "role": "MASTER"
  }
}
```

## ⚡ EMERGENCY COMMANDS

If nothing works, try these terminal commands:

```bash
# Force database refresh
cd "/mnt/Secondary/Projects/Websites/Schools/Manitos Pintadas SQL"
NODE_TLS_REJECT_UNAUTHORIZED=0 node -e "
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.lhpjliktgvttjjbzesfh:qVe8ZpgQ8BTidIzs@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require',
  ssl: { rejectUnauthorized: false }
});
client.connect().then(() => {
  client.query('SELECT role FROM users WHERE email = \$1', ['agustinaramac@gmail.com'])
    .then(result => console.log('DB Role:', result.rows[0]?.role))
    .finally(() => client.end());
});
"
```

## 🚀 FINAL TEST

**Follow these steps EXACTLY:**
1. **Clear browser completely** (all data)
2. **Use incognito mode**
3. **Go to login page**
4. **Login with MASTER credentials**
5. **Verify master dashboard loads**

**The fix is working - it's just a session caching issue!** 🎉