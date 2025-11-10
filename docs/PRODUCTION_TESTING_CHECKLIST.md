# 🧪 Production Testing Checklist

**Deployment Date**: 2025-11-10  
**Environment**: Production (Vercel)  
**URL**: https://qms-app-omega.vercel.app

---

## 🎯 Quick Test (5 minutes)

### 1. Basic Access ✅

- [ ] Open https://qms-app-omega.vercel.app
- [ ] Page loads without errors
- [ ] No console errors (F12 → Console)
- [ ] Login page appears

### 2. Authentication ✅

- [ ] Login with password
- [ ] Redirects to dashboard
- [ ] Session persists on refresh

### 3. Dashboard ✅

- [ ] Statistics cards display correctly
- [ ] Weather forecast shows (top of page)
- [ ] Current use tab shows quilts
- [ ] No console errors

### 4. Core Functions ✅

- [ ] Navigate to Quilts page
- [ ] List displays correctly
- [ ] Click on a quilt to view details
- [ ] No errors in console

---

## 🔍 Detailed Test (15 minutes)

### 1. Console Check (Most Important!)

**Open Browser Console** (F12 → Console)

**Expected**:

- ✅ No red errors
- ✅ No console.log from production code
- ✅ Only performance logs (if any) should have environment checks

**Check for**:

- ❌ No "console.log" from components
- ❌ No "console.error" from API routes
- ❌ No "Uncaught" errors
- ❌ No "Failed to fetch" errors

### 2. Pages Test

#### Dashboard (/)

- [ ] Weather forecast displays
- [ ] Statistics cards show correct numbers
- [ ] "Current Use" tab works
- [ ] "Historical Use" tab works
- [ ] "Recommended" tab works
- [ ] No loading errors

#### Quilts (/quilts)

- [ ] List displays all quilts
- [ ] Search works
- [ ] Filter works
- [ ] Add new quilt button works
- [ ] Edit quilt works
- [ ] Delete quilt works (with confirmation)
- [ ] Status change works
- [ ] Image upload works

#### Usage (/usage)

- [ ] Usage records display
- [ ] Calendar view works
- [ ] Add usage record works
- [ ] Edit usage record works
- [ ] Delete usage record works

#### Analytics (/analytics)

- [ ] Charts display correctly
- [ ] Data loads without errors
- [ ] No console errors

#### Settings (/settings)

- [ ] Page loads
- [ ] Change password works
- [ ] Language switch works
- [ ] Database stats display

#### Weather (/weather)

- [ ] Weather page loads
- [ ] 7-day forecast displays
- [ ] Temperature data shows

### 3. Notifications Test

**Check Notification Icon** (top right)

- [ ] Notification icon displays
- [ ] Unread count shows (if any)
- [ ] Click opens notification panel
- [ ] Notifications display correctly
- [ ] Mark as read works
- [ ] Delete notification works

### 4. API Routes Test

**Open Network Tab** (F12 → Network)

**Test these endpoints**:

- [ ] `/api/trpc/quilts.getAll` - Returns quilt data
- [ ] `/api/trpc/dashboard.getStats` - Returns stats
- [ ] `/api/weather` - Returns weather data
- [ ] `/api/trpc/notifications.getAll` - Returns notifications

**Expected**:

- ✅ Status 200 for all requests
- ✅ Response time < 1 second
- ❌ No 404 errors
- ❌ No 500 errors

### 5. Performance Test

**Open Lighthouse** (F12 → Lighthouse)

Run audit and check:

- [ ] Performance > 80
- [ ] Accessibility > 90
- [ ] Best Practices > 90
- [ ] SEO > 80

**Or manually check**:

- [ ] Page load < 2 seconds
- [ ] Navigation smooth
- [ ] No lag when typing
- [ ] Images load quickly

---

## 🐛 Bug Check

### Common Issues to Look For

#### 1. Console Errors

```
Open Console (F12)
Look for:
- Red error messages
- "Uncaught" errors
- "Failed to fetch"
- "TypeError"
```

#### 2. Network Errors

```
Open Network tab (F12)
Look for:
- Red (failed) requests
- 404 Not Found
- 500 Internal Server Error
- Slow requests (> 3s)
```

#### 3. Visual Issues

- [ ] Layout looks correct
- [ ] No broken images
- [ ] Text readable
- [ ] Colors correct
- [ ] Responsive on mobile

#### 4. Functionality Issues

- [ ] All buttons work
- [ ] Forms submit correctly
- [ ] Dialogs open/close
- [ ] Data saves correctly
- [ ] Search works

---

## 📊 Verification Results

### ✅ What Should Work

After cleanup, these should be **improved**:

- ✅ No console.log in production code
- ✅ Cleaner console output
- ✅ Better code organization
- ✅ Faster page loads (less debug code)

### 🔍 What to Monitor

These should be **unchanged** (still working):

- ✅ All pages load correctly
- ✅ All features work
- ✅ Data displays correctly
- ✅ User interactions work

---

## 🚨 If You Find Issues

### Console Errors

**If you see console.log**:

1. Note which page/action triggered it
2. Check if it's from:
   - Performance monitoring (OK - has env check)
   - Test/Admin APIs (OK - intentional)
   - Production code (NOT OK - report it)

**If you see errors**:

1. Copy the full error message
2. Note what you were doing
3. Check if functionality still works
4. Report if it breaks something

### Functionality Issues

**If something doesn't work**:

1. Try refreshing the page (Ctrl+Shift+R)
2. Clear browser cache
3. Try in incognito mode
4. Check if it worked before deployment

### Performance Issues

**If page is slow**:

1. Check Network tab for slow requests
2. Check if it's a data issue (too many records)
3. Try on different network
4. Compare with before deployment

---

## 📝 Testing Commands

### Browser Console Tests

```javascript
// 1. Check for console.log pollution
// Open Console (F12) and navigate through pages
// Should see minimal console output

// 2. Test API manually
fetch('/api/weather')
  .then(r => r.json())
  .then(console.log);

// 3. Check service worker
navigator.serviceWorker.getRegistrations().then(regs => console.log('SW registered:', regs.length));

// 4. Check notifications
fetch('/api/trpc/notifications.getUnreadCount')
  .then(r => r.json())
  .then(console.log);
```

### Network Tab Checks

```
1. Open Network tab (F12)
2. Refresh page
3. Look for:
   - All requests return 200
   - No 404 errors
   - No 500 errors
   - Response times < 1s
```

---

## ✅ Success Criteria

### Must Pass (Critical)

- [ ] ✅ No console errors on any page
- [ ] ✅ Login works
- [ ] ✅ Dashboard loads
- [ ] ✅ Quilts page works
- [ ] ✅ Can add/edit/delete quilts
- [ ] ✅ All API calls succeed

### Should Pass (Important)

- [ ] ✅ No console.log from production code
- [ ] ✅ Weather displays correctly
- [ ] ✅ Notifications work
- [ ] ✅ All pages load < 2s
- [ ] ✅ No visual glitches

### Nice to Have (Optional)

- [ ] ✅ Lighthouse score > 80
- [ ] ✅ No ESLint warnings in console
- [ ] ✅ Smooth animations
- [ ] ✅ Mobile responsive

---

## 📊 Test Report Template

After testing, fill this out:

```
## Test Results - [Date]

### Environment
- URL: https://qms-app-omega.vercel.app
- Browser: [Chrome/Firefox/Safari]
- Device: [Desktop/Mobile]

### Quick Test Results
- [ ] Basic Access: PASS/FAIL
- [ ] Authentication: PASS/FAIL
- [ ] Dashboard: PASS/FAIL
- [ ] Core Functions: PASS/FAIL

### Console Check
- Console Errors: [Number] errors found
- Console.log: [Clean/Has debug logs]
- Network Errors: [Number] failed requests

### Issues Found
1. [Issue description]
2. [Issue description]

### Overall Status
✅ PASS - Ready for production
⚠️ PASS with warnings - Minor issues
❌ FAIL - Critical issues found

### Notes
[Any additional observations]
```

---

## 🎯 Quick Test Script

**5-Minute Smoke Test**:

1. **Open site** → https://qms-app-omega.vercel.app
2. **Open Console** → F12 → Console tab
3. **Login** → Enter password
4. **Check Dashboard** → Should load with stats
5. **Check Console** → Should be clean (no red errors)
6. **Go to Quilts** → Click "被子管理"
7. **Check List** → Should show quilts
8. **Check Console** → Still clean?
9. **Click a Quilt** → Should open details
10. **Final Console Check** → Any errors?

**Result**:

- ✅ If console is clean and everything works → SUCCESS!
- ⚠️ If minor warnings but works → ACCEPTABLE
- ❌ If errors or broken features → NEEDS FIX

---

## 📞 Need Help?

### Where to Look

1. **Console Errors** → F12 → Console
2. **Network Issues** → F12 → Network
3. **Performance** → F12 → Lighthouse
4. **Vercel Logs** → Vercel Dashboard → Functions

### What to Report

If you find issues:

- Screenshot of error
- What you were doing
- Browser and device
- Console error message (if any)

---

**Testing Guide Version**: 1.0  
**Created**: 2025-11-10  
**Status**: Ready for testing

**🎉 Happy Testing!**
